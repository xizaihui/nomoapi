package controller

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

var libreChatReverseProxy *httputil.ReverseProxy

func init() {
	target, _ := url.Parse("http://librechat:3080")
	libreChatReverseProxy = &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.Host = target.Host

			// Strip /chat prefix
			path := strings.TrimPrefix(req.URL.Path, "/chat")
			if path == "" {
				path = "/"
			}
			req.URL.Path = path

			// Remove Accept-Encoding for HTML so we can modify it
			if isHTMLPath(path) {
				req.Header.Del("Accept-Encoding")
			}
		},
		// Enable streaming: FlushInterval -1 means flush immediately
		FlushInterval: -1,
		ModifyResponse: func(resp *http.Response) error {
			reqPath := resp.Request.URL.Path
			contentType := resp.Header.Get("Content-Type")

			// Prevent browser caching of API responses (avoids stale config/icons)
			// LibreChat serves JSON as text/html, so check path instead of content-type
			if strings.HasPrefix(reqPath, "/api/") {
				resp.Header.Set("Cache-Control", "no-cache, no-store, must-revalidate")
				resp.Header.Set("Pragma", "no-cache")
			}

			// Only modify actual HTML pages, not API responses
			if !strings.Contains(contentType, "text/html") {
				return nil
			}
			// Skip API paths (LibreChat returns text/html for JSON APIs)
			if strings.HasPrefix(reqPath, "/api/") {
				return nil
			}

			var reader io.ReadCloser
			switch resp.Header.Get("Content-Encoding") {
			case "gzip":
				var err error
				reader, err = gzip.NewReader(resp.Body)
				if err != nil {
					return err
				}
				defer reader.Close()
				resp.Header.Del("Content-Encoding")
			default:
				reader = resp.Body
			}

			body, err := io.ReadAll(reader)
			if err != nil {
				return err
			}
			resp.Body.Close()

			bodyStr := string(body)
			bodyStr = strings.Replace(bodyStr, `<base href="/" />`, `<base href="/chat/" />`, 1)
			bodyStr = strings.Replace(bodyStr, `<base href="/">`, `<base href="/chat/">`, 1)

			newBody := []byte(bodyStr)
			resp.Body = io.NopCloser(bytes.NewReader(newBody))
			resp.ContentLength = int64(len(newBody))
			resp.Header.Del("Content-Length")
			return nil
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			common.SysError(fmt.Sprintf("LibreChat proxy error: %v (path: %s)", err, r.URL.Path))
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadGateway)
			w.Write([]byte(`{"error":"Chat service temporarily unavailable. Please refresh the page."}`))
		},
	}
}

func isHTMLPath(path string) bool {
	if path == "/" || path == "" {
		return true
	}
	if strings.HasPrefix(path, "/c/") || strings.HasPrefix(path, "/login") || strings.HasPrefix(path, "/register") {
		return true
	}
	return strings.HasSuffix(path, ".html")
}

// freshLibreChatLogin does a fresh login to LibreChat and returns JWT + refreshToken
func freshLibreChatLogin() (jwt string, refreshToken string, err error) {
	body, _ := json.Marshal(map[string]string{
		"email":    libreChatEmail,
		"password": libreChatPassword,
	})

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post("http://librechat:3080/api/auth/login", "application/json", bytes.NewReader(body))
	if err != nil {
		return "", "", fmt.Errorf("login failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		respBody, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("login failed (%d): %s", resp.StatusCode, string(respBody))
	}

	var loginResp struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return "", "", err
	}

	for _, cookie := range resp.Cookies() {
		if cookie.Name == "refreshToken" {
			refreshToken = cookie.Value
			break
		}
	}

	return loginResp.Token, refreshToken, nil
}

// LibreChatAutoLogin serves a page that injects auth then redirects to the chat
func LibreChatAutoLogin(c *gin.Context) {
	jwt, refreshToken, err := freshLibreChatLogin()
	if err != nil {
		common.SysError(fmt.Sprintf("LibreChat auto-login failed: %v", err))
		c.Data(http.StatusOK, "text/html; charset=utf-8",
			[]byte(`<!DOCTYPE html><html><body><p>Chat service unavailable. <a href="/console">Go back</a></p></body></html>`))
		return
	}

	// Set refreshToken cookie for /chat/ path - this is what LibreChat uses for auth
	c.SetCookie("refreshToken", refreshToken, 7*24*3600, "/chat/", "", false, true)
	c.SetCookie("token_provider", "librechat", 7*24*3600, "/chat/", "", false, true)

	redirect := c.DefaultQuery("redirect", "/chat/c/new")

	html := fmt.Sprintf(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0d0d0d;color:#a1a1a1;font-family:sans-serif}
.s{width:20px;height:20px;border:2px solid rgba(255,255,255,.1);border-top-color:#fff;border-radius:50%%;animation:r .6s linear infinite;margin-bottom:12px}
@keyframes r{to{transform:rotate(360deg)}}
.c{text-align:center}
</style></head><body>
<div class="c"><div class="s"></div><div>Loading chat...</div></div>
<script>
try{localStorage.setItem('token',JSON.stringify(%q))}catch(e){}
window.location.replace(%q);
</script></body></html>`, jwt, redirect)

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// LibreChatProxy handles all /chat/* requests
func LibreChatProxy(c *gin.Context) {
	path := strings.TrimPrefix(c.Param("path"), "/")

	// Root path → auto-login page
	if path == "" || path == "auto-login" {
		LibreChatAutoLogin(c)
		return
	}

	// Login/register pages → redirect to auto-login (skip LibreChat's own login)
	if path == "login" || path == "register" || strings.HasPrefix(path, "login/") {
		c.Redirect(http.StatusFound, "/chat/")
		return
	}

	// For SSE endpoints, ensure proper headers for streaming
	if isSSEPath(path) {
		c.Writer.Header().Set("X-Accel-Buffering", "no")
		c.Writer.Header().Set("Cache-Control", "no-cache")
	}

	libreChatReverseProxy.ServeHTTP(c.Writer, c.Request)
}

// isSSEPath returns true for endpoints that use Server-Sent Events
func isSSEPath(path string) bool {
	return strings.HasPrefix(path, "api/ask/") ||
		strings.HasPrefix(path, "api/edit/") ||
		strings.HasPrefix(path, "api/agents/")
}

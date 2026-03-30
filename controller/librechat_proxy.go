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
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

var libreChatReverseProxy *httputil.ReverseProxy

// Cached LibreChat auth tokens (shared account)
var (
	lcAuthMu       sync.Mutex
	lcToken        string
	lcRefreshToken string
	lcTokenExpiry  time.Time
)

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
			if isHTMLRequest(path) {
				req.Header.Del("Accept-Encoding")
			}
		},
		ModifyResponse: func(resp *http.Response) error {
			contentType := resp.Header.Get("Content-Type")
			if !strings.Contains(contentType, "text/html") {
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
			// Rewrite base href
			bodyStr = strings.Replace(bodyStr, `<base href="/" />`, `<base href="/chat/" />`, 1)
			bodyStr = strings.Replace(bodyStr, `<base href="/">`, `<base href="/chat/">`, 1)

			newBody := []byte(bodyStr)
			resp.Body = io.NopCloser(bytes.NewReader(newBody))
			resp.ContentLength = int64(len(newBody))
			resp.Header.Del("Content-Length")
			return nil
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadGateway)
			w.Write([]byte(`{"error":"Chat service unavailable"}`))
		},
	}
}

func isHTMLRequest(path string) bool {
	if path == "/" || path == "" {
		return true
	}
	if strings.HasPrefix(path, "/c/") || strings.HasPrefix(path, "/login") || strings.HasPrefix(path, "/register") {
		return true
	}
	return strings.HasSuffix(path, ".html")
}

// ensureLibreChatAuth gets or refreshes the cached LibreChat JWT
func ensureLibreChatAuth() (string, string, error) {
	lcAuthMu.Lock()
	defer lcAuthMu.Unlock()

	if lcToken != "" && time.Now().Before(lcTokenExpiry) {
		return lcToken, lcRefreshToken, nil
	}

	body, _ := json.Marshal(map[string]string{
		"email":    libreChatEmail,
		"password": libreChatPassword,
	})

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post("http://librechat:3080/api/auth/login", "application/json", bytes.NewReader(body))
	if err != nil {
		return "", "", fmt.Errorf("login request failed: %w", err)
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

	// Extract refreshToken from Set-Cookie
	refreshToken := ""
	for _, cookie := range resp.Cookies() {
		if cookie.Name == "refreshToken" {
			refreshToken = cookie.Value
			break
		}
	}

	lcToken = loginResp.Token
	lcRefreshToken = refreshToken
	lcTokenExpiry = time.Now().Add(14 * time.Minute) // JWT typically 15min, refresh early

	return lcToken, refreshToken, nil
}

// LibreChatAutoLogin serves a page that injects auth into localStorage then redirects
func LibreChatAutoLogin(c *gin.Context) {
	token, refreshToken, err := ensureLibreChatAuth()
	if err != nil {
		common.SysError(fmt.Sprintf("LibreChat auto-login failed: %v", err))
		c.HTML(http.StatusOK, "", nil)
		c.Writer.WriteString(`<!DOCTYPE html><html><body><p>Chat service unavailable. <a href="/console">Go back</a></p></body></html>`)
		return
	}

	// Set the refreshToken cookie for /chat/ path
	c.SetCookie("refreshToken", refreshToken, 7*24*3600, "/chat/", "", false, true)
	c.SetCookie("token_provider", "librechat", 7*24*3600, "/chat/", "", false, true)

	// Serve a tiny HTML page that sets localStorage.token then redirects
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
try{localStorage.setItem('lastConversationSetup',JSON.stringify({presetOverride:null}));localStorage.setItem('token',JSON.stringify(%q))}catch(e){}
window.location.replace(%q);
</script></body></html>`, token, redirect)

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}

// LibreChatProxy reverse proxies all /chat/* requests
// For the root /chat/ path, it serves an auto-login page that injects JWT
func LibreChatProxy(c *gin.Context) {
	path := strings.TrimPrefix(c.Param("path"), "/")
	// Root path or explicit auto-login → inject auth
	if path == "" || path == "auto-login" {
		LibreChatAutoLogin(c)
		return
	}
	libreChatReverseProxy.ServeHTTP(c.Writer, c.Request)
}

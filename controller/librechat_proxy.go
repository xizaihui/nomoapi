package controller

import (
	"bytes"
	"compress/gzip"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

var libreChatProxy *httputil.ReverseProxy

func init() {
	target, _ := url.Parse("http://librechat:3080")
	libreChatProxy = &httputil.ReverseProxy{
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

			// Remove Accept-Encoding to get uncompressed response for modification
			if strings.HasSuffix(path, ".html") || path == "/" || strings.HasPrefix(path, "/c/") || strings.HasPrefix(path, "/login") {
				req.Header.Del("Accept-Encoding")
			}
		},
		ModifyResponse: func(resp *http.Response) error {
			contentType := resp.Header.Get("Content-Type")

			// Only modify HTML responses to fix asset paths
			if !strings.Contains(contentType, "text/html") {
				return nil
			}

			var reader io.ReadCloser
			var err error
			switch resp.Header.Get("Content-Encoding") {
			case "gzip":
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

			// Rewrite <base href="/"> to <base href="/chat/">
			bodyStr := string(body)
			bodyStr = strings.Replace(bodyStr, `<base href="/" />`, `<base href="/chat/" />`, 1)
			bodyStr = strings.Replace(bodyStr, `<base href="/">`, `<base href="/chat/">`, 1)
			// Fix absolute API calls in inline scripts
			bodyStr = strings.ReplaceAll(bodyStr, `"/api/`, `"/chat/api/`)

			newBody := []byte(bodyStr)
			resp.Body = io.NopCloser(bytes.NewReader(newBody))
			resp.ContentLength = int64(len(newBody))
			resp.Header.Set("Content-Length", "")
			resp.Header.Del("Content-Length")
			return nil
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadGateway)
			w.Write([]byte(`{"error": "Chat service unavailable"}`))
		},
	}
}

// LibreChatProxy reverse proxies requests to LibreChat under /chat/*
func LibreChatProxy(c *gin.Context) {
	libreChatProxy.ServeHTTP(c.Writer, c.Request)
}

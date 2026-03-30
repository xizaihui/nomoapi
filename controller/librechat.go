package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

const (
	libreChatBaseURL  = "http://librechat:3080"
	libreChatEmail    = "admin@opentoken.io"
	libreChatPassword = "OpenToken2026!"
)

type libreChatLoginResp struct {
	Token string `json:"token"`
	User  struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
	} `json:"user"`
}

// LibreChatAuth handles authentication bridge between NewAPI and LibreChat
// It logs into LibreChat with a shared account and sets the user's API key
func LibreChatAuth(c *gin.Context) {
	// Get current user from NewAPI session
	userID := c.GetInt("id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not logged in"})
		return
	}

	// Get the user's selected token key from request
	var req struct {
		TokenKey string `json:"token_key"` // The sk-xxx key to use
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.TokenKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide a token_key"})
		return
	}

	// Login to LibreChat
	token, err := libreChatLogin()
	if err != nil {
		common.SysError(fmt.Sprintf("LibreChat login failed: %v", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Chat service unavailable"})
		return
	}

	// Set the API key in LibreChat for the OpenToken endpoint
	fullKey := req.TokenKey
	if len(fullKey) > 0 && fullKey[:3] != "sk-" {
		fullKey = "sk-" + fullKey
	}
	if err := libreChatSetKey(token, fullKey); err != nil {
		common.SysError(fmt.Sprintf("LibreChat set key failed: %v", err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to configure chat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   token,
		"message": "Chat ready",
	})
}

func libreChatLogin() (string, error) {
	body, _ := json.Marshal(map[string]string{
		"email":    libreChatEmail,
		"password": libreChatPassword,
	})

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(
		libreChatBaseURL+"/api/auth/login",
		"application/json",
		bytes.NewReader(body),
	)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("login failed (status %d): %s", resp.StatusCode, string(respBody))
	}

	var loginResp libreChatLoginResp
	if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return "", fmt.Errorf("decode failed: %w", err)
	}

	return loginResp.Token, nil
}

func libreChatSetKey(jwtToken, apiKey string) error {
	body, _ := json.Marshal(map[string]string{
		"name":  "OpenToken",
		"value": apiKey,
	})

	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("PUT", libreChatBaseURL+"/api/keys", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+jwtToken)

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 && resp.StatusCode != 200 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("set key failed (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// LibreChatStatus checks if LibreChat service is available
func LibreChatStatus(c *gin.Context) {
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(libreChatBaseURL + "/api/config")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"available": false, "error": err.Error()})
		return
	}
	defer resp.Body.Close()

	c.JSON(http.StatusOK, gin.H{
		"available": resp.StatusCode == 200,
		"url":       libreChatBaseURL,
	})
}

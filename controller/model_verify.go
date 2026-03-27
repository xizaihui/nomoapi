package controller

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// ==================== 模型鉴真 API ====================
// 检测 Claude 模型是否为官方正版，识别逆向渠道特征

// VerifyRequest 鉴真请求
type VerifyRequest struct {
	ChannelID int    `json:"channel_id"` // 渠道 ID（管理员）
	Model     string `json:"model"`      // 模型名称
}

// VerifyResult 单项检测结果
type VerifyCheck struct {
	ID     string `json:"id"`
	Label  string `json:"label"`
	Pass   bool   `json:"pass"`
	Weight int    `json:"weight"`
	Detail string `json:"detail,omitempty"`
}

// VerifyResponse 鉴真响应
type VerifyResponse struct {
	Success    bool          `json:"success"`
	Model      string        `json:"model"`
	ChannelID  int           `json:"channel_id,omitempty"`
	Score      int           `json:"score"`
	Badge      string        `json:"badge"`
	Level      string        `json:"level"`
	Checks     []VerifyCheck `json:"checks"`
	DurationMs int64         `json:"duration_ms"`
	Error      string        `json:"error,omitempty"`
	RawAnswer  string        `json:"raw_answer,omitempty"`
	Thinking   string        `json:"thinking,omitempty"`
}

// 检测维度定义
var verifyChecks = []struct {
	ID     string
	Label  string
	Weight int
}{
	{"is_claude", "是 Claude 模型", 70},
	{"not_reverse", "非逆向渠道", 20},
	{"thinking", "Thinking 支持", 3},
	{"signature", "响应签名", 3},
	{"tools", "工具调用能力", 4},
}

// ModelVerify 模型鉴真接口
func ModelVerify(c *gin.Context) {
	var req VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误"})
		return
	}

	if req.Model == "" {
		req.Model = "claude-sonnet-4-5-20250929"
	}

	// 检查管理员权限
	userId := c.GetInt("id")
	userRole := c.GetInt("role")
	isAdmin := userRole >= common.RoleAdminUser

	if req.ChannelID > 0 && !isAdmin {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "指定渠道需要管理员权限"})
		return
	}

	// 获取渠道
	var channel *model.Channel
	var err error
	if req.ChannelID > 0 {
		channel, err = model.GetChannelById(req.ChannelID, true)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "渠道不存在"})
			return
		}
	} else {
		// 使用用户的默认渠道（通过 token 路由）
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请指定渠道 ID"})
		return
	}

	_ = userId // 后续可用于日志

	// 执行鉴真
	result := executeVerify(channel, req.Model)
	c.JSON(http.StatusOK, result)
}

// executeVerify 执行鉴真检测
func executeVerify(channel *model.Channel, modelName string) VerifyResponse {
	start := time.Now()
	result := VerifyResponse{
		Success:   true,
		Model:     modelName,
		ChannelID: channel.Id,
		Checks:    make([]VerifyCheck, 0, len(verifyChecks)),
	}

	// 初始化检测项
	for _, vc := range verifyChecks {
		result.Checks = append(result.Checks, VerifyCheck{
			ID:     vc.ID,
			Label:  vc.Label,
			Weight: vc.Weight,
			Pass:   false,
		})
	}

	// 1. 发送检测请求
	answer, thinking, rawResp, err := sendVerifyRequest(channel, modelName)
	if err != nil {
		result.Success = false
		result.Error = err.Error()
		result.DurationMs = time.Since(start).Milliseconds()
		result.Badge = "检测失败"
		return result
	}

	result.RawAnswer = answer
	result.Thinking = thinking

	// 2. 分析响应，执行各项检测
	totalScore := 0

	// 检测1: 是否为 Claude 模型
	isClaudeScore, isClaudeDetail := checkIsClaude(answer, rawResp)
	result.Checks[0].Pass = isClaudeScore > 0
	result.Checks[0].Detail = isClaudeDetail
	if result.Checks[0].Pass {
		totalScore += result.Checks[0].Weight
	}

	// 检测2: 是否来自逆向渠道
	notReverseScore, reverseDetail := checkNotReverse(rawResp, channel)
	result.Checks[1].Pass = notReverseScore > 0
	result.Checks[1].Detail = reverseDetail
	if result.Checks[1].Pass {
		totalScore += result.Checks[1].Weight
	}

	// 检测3: Thinking 支持
	thinkingScore, thinkingDetail := checkThinking(thinking, rawResp)
	result.Checks[2].Pass = thinkingScore > 0
	result.Checks[2].Detail = thinkingDetail
	if result.Checks[2].Pass {
		totalScore += result.Checks[2].Weight
	}

	// 检测4: 响应签名
	signatureScore, signatureDetail := checkSignature(rawResp)
	result.Checks[3].Pass = signatureScore > 0
	result.Checks[3].Detail = signatureDetail
	if result.Checks[3].Pass {
		totalScore += result.Checks[3].Weight
	}

	// 检测5: 工具调用能力
	toolsScore, toolsDetail := checkToolsCapability(channel, modelName)
	result.Checks[4].Pass = toolsScore > 0
	result.Checks[4].Detail = toolsDetail
	if result.Checks[4].Pass {
		totalScore += result.Checks[4].Weight
	}

	result.Score = totalScore
	result.Badge, result.Level = scoreToBadge(totalScore)
	result.DurationMs = time.Since(start).Milliseconds()

	return result
}

// sendVerifyRequest 发送鉴真请求
func sendVerifyRequest(channel *model.Channel, modelName string) (answer, thinking string, rawResp map[string]interface{}, err error) {
	baseURL := channel.GetBaseURL()
	if baseURL == "" {
		baseURL = "https://api.anthropic.com"
	}
	baseURL = strings.TrimSuffix(baseURL, "/")

	// 构建请求 - 使用特定 prompt 来检测模型身份
	reqBody := map[string]interface{}{
		"model":      modelName,
		"max_tokens": 500,
		"messages": []map[string]interface{}{
			{
				"role":    "user",
				"content": "请用中文回答：你是什么模型？你的版本号是多少？你是由哪家公司开发的？请简洁回答。",
			},
		},
	}

	jsonBody, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", baseURL+"/v1/messages", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", "", nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", channel.Key)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", nil, err
	}

	if resp.StatusCode != 200 {
		return "", "", nil, fmt.Errorf("API 错误 (%d): %s", resp.StatusCode, string(body))
	}

	if err := json.Unmarshal(body, &rawResp); err != nil {
		return "", "", nil, err
	}

	// 提取回答文本
	if content, ok := rawResp["content"].([]interface{}); ok {
		for _, block := range content {
			if b, ok := block.(map[string]interface{}); ok {
				if b["type"] == "text" {
					if text, ok := b["text"].(string); ok {
						answer = text
					}
				}
				if b["type"] == "thinking" {
					if text, ok := b["text"].(string); ok {
						thinking = text
					}
				}
			}
		}
	}

	return answer, thinking, rawResp, nil
}

// checkIsClaude 检测是否为 Claude 模型
func checkIsClaude(answer string, rawResp map[string]interface{}) (int, string) {
	lowerAnswer := strings.ToLower(answer)

	// 检查模型自我认知
	claudeKeywords := []string{"claude", "anthropic"}
	for _, kw := range claudeKeywords {
		if strings.Contains(lowerAnswer, kw) {
			return 1, "模型自称 Claude/Anthropic"
		}
	}

	// 检查响应中的 model 字段
	if model, ok := rawResp["model"].(string); ok {
		if strings.Contains(strings.ToLower(model), "claude") {
			return 1, fmt.Sprintf("响应 model 字段: %s", model)
		}
	}

	// 检查是否声称是其他模型
	otherModels := []string{"gpt", "openai", "gemini", "google", "llama", "mistral"}
	for _, m := range otherModels {
		if strings.Contains(lowerAnswer, m) {
			return 0, fmt.Sprintf("模型自称为 %s，非 Claude", m)
		}
	}

	return 0, "无法确认模型身份"
}

// checkNotReverse 检测是否来自逆向渠道
func checkNotReverse(rawResp map[string]interface{}, channel *model.Channel) (int, string) {
	// 检查响应头/元数据中的逆向特征
	reverseIndicators := []string{
		"cursor", "kiro", "windsurf", "cline", "continue",
		"vscode", "ide", "editor", "copilot",
	}

	// 检查 channel 名称
	channelNameLower := strings.ToLower(channel.Name)
	for _, indicator := range reverseIndicators {
		if strings.Contains(channelNameLower, indicator) {
			return 0, fmt.Sprintf("渠道名称包含逆向特征: %s", indicator)
		}
	}

	// 检查响应中的特殊字段
	if rawResp != nil {
		respStr, _ := json.Marshal(rawResp)
		respLower := strings.ToLower(string(respStr))
		for _, indicator := range reverseIndicators {
			if strings.Contains(respLower, indicator) {
				return 0, fmt.Sprintf("响应包含逆向特征: %s", indicator)
			}
		}
	}

	// 检查 base_url 是否为官方
	baseURL := channel.GetBaseURL()
	if strings.Contains(baseURL, "anthropic.com") {
		return 1, "使用 Anthropic 官方 API"
	}

	// 第三方中转，无法确定
	return 1, "未检测到明显逆向特征"
}

// checkThinking 检测 Thinking 支持
func checkThinking(thinking string, rawResp map[string]interface{}) (int, string) {
	if thinking != "" {
		return 1, fmt.Sprintf("支持 Thinking，长度 %d 字符", len(thinking))
	}

	// 检查响应中是否有 thinking 相关字段
	if content, ok := rawResp["content"].([]interface{}); ok {
		for _, block := range content {
			if b, ok := block.(map[string]interface{}); ok {
				if b["type"] == "thinking" {
					return 1, "响应包含 thinking 块"
				}
			}
		}
	}

	return 0, "未检测到 Thinking 支持（可能需要启用）"
}

// checkSignature 检测响应签名
func checkSignature(rawResp map[string]interface{}) (int, string) {
	// 检查 Anthropic 特有的响应字段
	requiredFields := []string{"id", "type", "role", "model", "stop_reason", "usage"}
	foundFields := 0

	for _, field := range requiredFields {
		if _, ok := rawResp[field]; ok {
			foundFields++
		}
	}

	if foundFields >= 5 {
		// 检查 ID 格式
		if id, ok := rawResp["id"].(string); ok {
			if strings.HasPrefix(id, "msg_") {
				return 1, fmt.Sprintf("响应签名完整，ID: %s", id[:min(20, len(id))])
			}
		}
		return 1, fmt.Sprintf("响应签名基本完整 (%d/%d 字段)", foundFields, len(requiredFields))
	}

	return 0, fmt.Sprintf("响应签名不完整 (%d/%d 字段)", foundFields, len(requiredFields))
}

// checkToolsCapability 检测工具调用能力
func checkToolsCapability(channel *model.Channel, modelName string) (int, string) {
	baseURL := channel.GetBaseURL()
	if baseURL == "" {
		baseURL = "https://api.anthropic.com"
	}
	baseURL = strings.TrimSuffix(baseURL, "/")

	// 发送带工具的请求
	reqBody := map[string]interface{}{
		"model":      modelName,
		"max_tokens": 200,
		"tools": []map[string]interface{}{
			{
				"name":        "get_weather",
				"description": "Get weather for a location",
				"input_schema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"location": map[string]string{"type": "string"},
					},
					"required": []string{"location"},
				},
			},
		},
		"messages": []map[string]interface{}{
			{
				"role":    "user",
				"content": "What's the weather in Beijing?",
			},
		},
	}

	jsonBody, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", baseURL+"/v1/messages", bytes.NewBuffer(jsonBody))
	if err != nil {
		return 0, "工具调用请求失败"
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", channel.Key)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, "工具调用请求超时"
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return 0, fmt.Sprintf("工具调用失败 (%d)", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return 0, "响应解析失败"
	}

	// 检查是否返回了 tool_use
	if content, ok := result["content"].([]interface{}); ok {
		for _, block := range content {
			if b, ok := block.(map[string]interface{}); ok {
				if b["type"] == "tool_use" {
					if name, ok := b["name"].(string); ok {
						return 1, fmt.Sprintf("工具调用正常，调用了: %s", name)
					}
					return 1, "工具调用正常"
				}
			}
		}
	}

	return 0, "模型未调用工具"
}

// scoreToBadge 分数转徽章
func scoreToBadge(score int) (badge, level string) {
	switch {
	case score >= 90:
		return "官方正版", "极高可信度"
	case score >= 85:
		return "高度可信", "可能为官方或高质量中转"
	case score >= 70:
		return "基本可信", "功能正常但来源不确定"
	case score >= 50:
		return "疑似逆向", "可能来自第三方工具"
	default:
		return "不可信", "可能为假冒或严重降智"
	}
}

// generateVerifyHash 生成验证哈希（用于防重放）
func generateVerifyHash(channelID int, model string) string {
	data := fmt.Sprintf("%d:%s:%d", channelID, model, time.Now().Unix()/60)
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:8])
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

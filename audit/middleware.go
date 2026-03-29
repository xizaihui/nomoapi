package audit

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	relaycommon "github.com/QuantumNous/new-api/relay/common"

	"github.com/bytedance/gopkg/util/gopool"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var auditDB *gorm.DB

func SetDB(db *gorm.DB) {
	auditDB = db
}

// ExtractPromptFromRequest 从请求中提取用户提问内容
// 策略：从后往前找最后一条有文本内容的 user 消息；
// 如果最后一条 user 消息只有 tool_result（无 text），继续往前找。
func ExtractPromptFromRequest(request interface{}) string {
	switch req := request.(type) {
	case *dto.GeneralOpenAIRequest:
		if req == nil || len(req.Messages) == 0 {
			return ""
		}
		// 从后往前找有文本的 user 消息
		for i := len(req.Messages) - 1; i >= 0; i-- {
			if req.Messages[i].Role == "user" {
				text := req.Messages[i].StringContent()
				if text != "" {
					return text
				}
			}
		}
		// fallback: 取最后一条消息的内容
		return req.Messages[len(req.Messages)-1].StringContent()

	case *dto.ClaudeRequest:
		if req == nil || len(req.Messages) == 0 {
			return ""
		}
		// 从后往前找有文本的 user 消息（跳过纯 tool_result 的消息）
		for i := len(req.Messages) - 1; i >= 0; i-- {
			if req.Messages[i].Role == "user" {
				text := extractClaudeMessageContent(req.Messages[i].Content)
				if text != "" {
					return text
				}
			}
		}
		// 所有 user 消息都没文本，尝试提取 tool_result 的 content 作为上下文
		for i := len(req.Messages) - 1; i >= 0; i-- {
			if req.Messages[i].Role == "user" {
				text := extractClaudeToolResultContent(req.Messages[i].Content)
				if text != "" {
					return "[tool_result] " + text
				}
			}
		}
		return ""

	case *dto.GeminiChatRequest:
		if req == nil || len(req.Contents) == 0 {
			return ""
		}
		for i := len(req.Contents) - 1; i >= 0; i-- {
			if req.Contents[i].Role == "user" {
				text := extractGeminiParts(req.Contents[i].Parts)
				if text != "" {
					return text
				}
			}
		}
		return extractGeminiParts(req.Contents[len(req.Contents)-1].Parts)

	case *dto.OpenAIResponsesRequest:
		if req == nil || len(req.Input) == 0 {
			return ""
		}
		return extractResponsesInput(req.Input)

	default:
		// 尝试 JSON 序列化后提取
		data, err := json.Marshal(request)
		if err != nil {
			return ""
		}
		var generic map[string]interface{}
		if err := json.Unmarshal(data, &generic); err != nil {
			return ""
		}
		if messages, ok := generic["messages"]; ok {
			if msgArr, ok := messages.([]interface{}); ok && len(msgArr) > 0 {
				// 从后往前找有文本的 user 消息
				for i := len(msgArr) - 1; i >= 0; i-- {
					if msgMap, ok := msgArr[i].(map[string]interface{}); ok {
						role, _ := msgMap["role"].(string)
						if role == "user" {
							text := extractContentFromMap(msgMap)
							if text != "" {
								return text
							}
						}
					}
				}
				// fallback: 取最后一条
				if msgMap, ok := msgArr[len(msgArr)-1].(map[string]interface{}); ok {
					return extractContentFromMap(msgMap)
				}
			}
		}
		// 也尝试 "input" 字段（OpenAI Responses 格式 fallback）
		if input, ok := generic["input"]; ok {
			if inputStr, ok := input.(string); ok {
				return inputStr
			}
		}
		return ""
	}
}

// extractClaudeMessageContent 从 Claude 消息的 content 字段提取文本
func extractClaudeMessageContent(content any) string {
	if content == nil {
		return ""
	}
	// content 可能是 string
	if s, ok := content.(string); ok {
		return s
	}
	// content 可能是 []ClaudeMessageContent 数组
	data, err := json.Marshal(content)
	if err != nil {
		return ""
	}
	var blocks []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	}
	if err := json.Unmarshal(data, &blocks); err != nil {
		return ""
	}
	var texts []string
	for _, b := range blocks {
		if b.Type == "text" && b.Text != "" {
			texts = append(texts, b.Text)
		}
	}
	return strings.Join(texts, "\n")
}

// extractResponsesInput 从 OpenAI Responses 格式的 input 字段提取文本
// input 可以是 string 或 messages 数组
func extractResponsesInput(input json.RawMessage) string {
	if len(input) == 0 {
		return ""
	}
	// 尝试作为 string 解析
	var s string
	if err := json.Unmarshal(input, &s); err == nil {
		return s
	}
	// 尝试作为 messages 数组解析
	var messages []struct {
		Role    string `json:"role"`
		Content any    `json:"content"`
	}
	if err := json.Unmarshal(input, &messages); err == nil && len(messages) > 0 {
		// 从后往前找 user 消息
		for i := len(messages) - 1; i >= 0; i-- {
			if messages[i].Role == "user" {
				switch c := messages[i].Content.(type) {
				case string:
					if c != "" {
						return c
					}
				case []interface{}:
					for _, item := range c {
						if m, ok := item.(map[string]interface{}); ok {
							if t, ok := m["text"].(string); ok && t != "" {
								return t
							}
						}
					}
				}
			}
		}
	}
	return ""
}

// extractClaudeToolResultContent 从 Claude tool_result 类型的 content 块中提取内容
func extractClaudeToolResultContent(content any) string {
	if content == nil {
		return ""
	}
	data, err := json.Marshal(content)
	if err != nil {
		return ""
	}
	var blocks []struct {
		Type      string `json:"type"`
		Content   any    `json:"content"`
		ToolUseId string `json:"tool_use_id"`
	}
	if err := json.Unmarshal(data, &blocks); err != nil {
		return ""
	}
	var texts []string
	for _, b := range blocks {
		if b.Type == "tool_result" && b.Content != nil {
			switch c := b.Content.(type) {
			case string:
				if c != "" {
					// 截取前 200 字符作为摘要
					if len(c) > 200 {
						c = c[:200] + "..."
					}
					texts = append(texts, c)
				}
			case []interface{}:
				// tool_result 的 content 也可以是数组
				for _, item := range c {
					if m, ok := item.(map[string]interface{}); ok {
						if t, ok := m["text"].(string); ok && t != "" {
							if len(t) > 200 {
								t = t[:200] + "..."
							}
							texts = append(texts, t)
						}
					}
				}
			}
		}
	}
	return strings.Join(texts, "\n")
}

// extractGeminiParts 从 Gemini Parts 提取文本
func extractGeminiParts(parts []dto.GeminiPart) string {
	var texts []string
	for _, p := range parts {
		if p.Text != "" {
			texts = append(texts, p.Text)
		}
	}
	return strings.Join(texts, "\n")
}

// extractContentFromMap 从 generic map 提取 content 文本
func extractContentFromMap(msgMap map[string]interface{}) string {
	content := msgMap["content"]
	if content == nil {
		return ""
	}
	// string content
	if s, ok := content.(string); ok {
		return s
	}
	// array content (OpenAI multimodal format)
	if arr, ok := content.([]interface{}); ok {
		var texts []string
		for _, item := range arr {
			if m, ok := item.(map[string]interface{}); ok {
				if t, ok := m["text"].(string); ok {
					texts = append(texts, t)
				}
			}
		}
		return strings.Join(texts, "\n")
	}
	return ""
}

// AsyncAuditCheck 异步审计检查 — 在请求处理完成后调用，不阻塞用户请求
func AsyncAuditCheck(c *gin.Context, info *relaycommon.RelayInfo, request interface{}) {
	if auditDB == nil {
		return
	}

	// 检查该用户是否开启了审计
	userId := info.UserId
	if !IsAuditEnabled(auditDB, userId) {
		return
	}

	// 提取 prompt — 即使为空也记录审计日志（标记为提取失败）
	prompt := ExtractPromptFromRequest(request)

	// 截取前 10000 字符，避免超大文本
	if len(prompt) > 10000 {
		prompt = prompt[:10000]
	}

	// 收集请求信息（在主 goroutine 中完成，避免 gin.Context 并发问题）
	group := info.UserGroup
	if group == "" {
		group = info.UsingGroup
	}

	tokenName := ""
	if tn, exists := c.Get("token_name"); exists {
		tokenName = fmt.Sprintf("%v", tn)
	}

	username := ""
	if un, exists := c.Get("username"); exists {
		username = fmt.Sprintf("%v", un)
	}

	ip := c.ClientIP()
	requestId := ""
	if rid, exists := c.Get("X-Request-Id"); exists {
		requestId = fmt.Sprintf("%v", rid)
	}
	if requestId == "" {
		requestId = c.GetHeader("X-Request-Id")
	}

	modelName := info.OriginModelName
	isStream := info.IsStream
	tokenId := info.TokenId

	// 异步执行扫描和写入
	gopool.Go(func() {
		defer func() {
			if r := recover(); r != nil {
				common.SysError(fmt.Sprintf("审计日志写入 panic: %v", r))
			}
		}()

		// 如果 prompt 为空，记录一条标记日志
		if prompt == "" {
			prompt = "[prompt_extraction_empty]"
		}

		// 规则匹配
		scanResult := ScanPrompt(group, prompt)

		// 构建审计日志
		auditLog := &AuditLog{
			RequestId:    requestId,
			UserId:       userId,
			Username:     username,
			Group:        group,
			TokenId:      tokenId,
			TokenName:    tokenName,
			ModelName:    modelName,
			Prompt:       prompt,
			Ip:           ip,
			IsStream:     isStream,
			RiskLevel:    scanResult.RiskLevel,
			RiskCategory: scanResult.RiskCategory,
			RiskTags:     scanResult.RiskTags,
			RiskDetail:   scanResult.RiskDetail,
		}

		// 写入 ES
		if err := IndexAuditLog(auditLog); err != nil {
			common.SysError("审计日志写入 ES 失败: " + err.Error())
		}
	})
}

// GetCategoryLabel 获取规则类型的中文标题
func GetCategoryLabel(category string) string {
	labels := map[string]string{
		"prohibited": "🚫 违禁内容",
		"political":  "🏛️ 政治敏感",
		"secret":     "🔒 商业机密",
		"credential": "🔑 凭证泄露",
		"infra":      "🖥️ 基础设施",
		"custom":     "⚙️ 自定义规则",
	}
	if label, ok := labels[category]; ok {
		return label
	}
	return category
}

// GetRiskLevelLabel 获取风险等级标签
func GetRiskLevelLabel(level int) string {
	labels := map[int]string{
		0: "正常",
		1: "可疑",
		2: "危险",
		3: "高危",
	}
	if label, ok := labels[level]; ok {
		return label
	}
	return "未知"
}

// ValidateCategory 验证规则类型
func ValidateCategory(category string) bool {
	valid := []string{"prohibited", "political", "secret", "credential", "infra", "custom"}
	for _, v := range valid {
		if v == category {
			return true
		}
	}
	return false
}

// ValidateRuleType 验证匹配方式
func ValidateRuleType(ruleType string) bool {
	return ruleType == "keyword" || ruleType == "regex"
}

// ValidatePatterns 验证 patterns 格式
func ValidatePatterns(patterns string) error {
	var arr []string
	if err := json.Unmarshal([]byte(patterns), &arr); err != nil {
		return fmt.Errorf("patterns 必须是 JSON 字符串数组")
	}
	if len(arr) == 0 {
		return fmt.Errorf("patterns 不能为空")
	}
	for _, p := range arr {
		if strings.TrimSpace(p) == "" {
			return fmt.Errorf("patterns 中不能包含空字符串")
		}
	}
	return nil
}

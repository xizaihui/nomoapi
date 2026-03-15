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
func ExtractPromptFromRequest(request interface{}) string {
	switch req := request.(type) {
	case *dto.GeneralOpenAIRequest:
		if req == nil || len(req.Messages) == 0 {
			return ""
		}
		// 取最后一条 user 消息
		for i := len(req.Messages) - 1; i >= 0; i-- {
			if req.Messages[i].Role == "user" {
				return req.Messages[i].StringContent()
			}
		}
		// 没有 user 消息，取最后一条
		return req.Messages[len(req.Messages)-1].StringContent()
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
				last := msgArr[len(msgArr)-1]
				if msgMap, ok := last.(map[string]interface{}); ok {
					if content, ok := msgMap["content"].(string); ok {
						return content
					}
				}
			}
		}
		return ""
	}
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

	// 提取 prompt
	prompt := ExtractPromptFromRequest(request)
	if prompt == "" {
		return
	}

	// 截取前 10000 字符，避免超大文本
	if len(prompt) > 10000 {
		prompt = prompt[:10000]
	}

	// 收集请求信息
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

	// 异步执行扫描和写入
	gopool.Go(func() {
		// 规则匹配
		scanResult := ScanPrompt(group, prompt)

		// 构建审计日志
		auditLog := &AuditLog{
			RequestId:    requestId,
			UserId:       userId,
			Username:     username,
			Group:        group,
			TokenId:      info.TokenId,
			TokenName:    tokenName,
			ModelName:    modelName,
			Prompt:       prompt,
			Ip:           ip,
			IsStream:     info.IsStream,
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

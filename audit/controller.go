package audit

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// --- 审计规则 API ---

func GetAuditRulesHandler(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	category := c.Query("category")

	// 获取当前用户角色和分组
	role := c.GetInt("role")
	group := c.GetString("group")

	var rules []AuditRule
	var total int64
	var err error

	if role >= common.RoleAdminUser {
		// 管理员看所有规则
		rules, total, err = GetAuditRules(auditDB, page, pageSize, category, "", false)
	} else {
		// 普通用户（有审计权限的公司管理员）看全局 + 本组规则
		rules, total, err = GetAuditRules(auditDB, page, pageSize, category, group, false)
	}

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"rules": rules,
			"total": total,
			"page":  page,
		},
	})
}

func CreateAuditRuleHandler(c *gin.Context) {
	var rule AuditRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误: " + err.Error()})
		return
	}

	// 验证
	if !ValidateCategory(rule.Category) {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的规则类型"})
		return
	}
	if !ValidateRuleType(rule.RuleType) {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "匹配方式必须是 keyword 或 regex"})
		return
	}
	if err := ValidatePatterns(rule.Patterns); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	role := c.GetInt("role")
	userId := c.GetInt("id")
	group := c.GetString("group")

	if role >= common.RoleAdminUser {
		// 管理员创建的是全局规则
		rule.IsGlobal = true
		rule.OwnerGroup = ""
	} else {
		// 公司用户创建的是本组规则
		rule.IsGlobal = false
		rule.OwnerGroup = group
	}
	rule.CreatedBy = userId

	if err := CreateAuditRule(auditDB, &rule); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	InvalidateCache()
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "规则创建成功", "data": rule})
}

func UpdateAuditRuleHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的 ID"})
		return
	}

	existing, err := GetAuditRuleById(auditDB, id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "规则不存在"})
		return
	}

	// 权限检查
	role := c.GetInt("role")
	group := c.GetString("group")
	if role < common.RoleAdminUser && existing.IsGlobal {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无权修改全局规则"})
		return
	}
	if role < common.RoleAdminUser && !existing.IsGlobal && existing.OwnerGroup != group {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无权修改其他分组的规则"})
		return
	}

	var update AuditRule
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
		return
	}

	// 验证
	if update.Category != "" && !ValidateCategory(update.Category) {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的规则类型"})
		return
	}
	if update.RuleType != "" && !ValidateRuleType(update.RuleType) {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "匹配方式必须是 keyword 或 regex"})
		return
	}
	if update.Patterns != "" {
		if err := ValidatePatterns(update.Patterns); err != nil {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
			return
		}
	}

	// 更新字段
	if update.Name != "" {
		existing.Name = update.Name
	}
	if update.Category != "" {
		existing.Category = update.Category
	}
	if update.RuleType != "" {
		existing.RuleType = update.RuleType
	}
	if update.Patterns != "" {
		existing.Patterns = update.Patterns
	}
	if update.Description != "" {
		existing.Description = update.Description
	}
	existing.RiskLevel = update.RiskLevel
	existing.Enabled = update.Enabled

	if err := UpdateAuditRule(auditDB, existing); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	InvalidateCache()
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "规则更新成功"})
}

func DeleteAuditRuleHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的 ID"})
		return
	}

	existing, err := GetAuditRuleById(auditDB, id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "规则不存在"})
		return
	}

	// 权限检查
	role := c.GetInt("role")
	group := c.GetString("group")
	if role < common.RoleAdminUser && existing.IsGlobal {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无权删除全局规则"})
		return
	}
	if role < common.RoleAdminUser && !existing.IsGlobal && existing.OwnerGroup != group {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无权删除其他分组的规则"})
		return
	}

	if err := DeleteAuditRule(auditDB, id); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	InvalidateCache()
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "规则删除成功"})
}

// --- 审计日志 API ---

func SearchAuditLogsHandler(c *gin.Context) {
	var params SearchParams
	params.Page, _ = strconv.Atoi(c.DefaultQuery("page", "1"))
	params.PageSize, _ = strconv.Atoi(c.DefaultQuery("page_size", "20"))
	params.Username = c.Query("username")
	params.TokenName = c.Query("token_name")
	params.RiskCategory = c.Query("risk_category")
	params.Keyword = c.Query("keyword")

	if rl := c.Query("risk_level"); rl != "" {
		level, _ := strconv.Atoi(rl)
		params.RiskLevel = &level
	}
	if st := c.Query("start_time"); st != "" {
		params.StartTime, _ = strconv.ParseInt(st, 10, 64)
	}
	if et := c.Query("end_time"); et != "" {
		params.EndTime, _ = strconv.ParseInt(et, 10, 64)
	}
	if rv := c.Query("reviewed"); rv != "" {
		reviewed := rv == "true"
		params.Reviewed = &reviewed
	}

	// 权限：管理员看所有，普通用户看本组
	role := c.GetInt("role")
	if role < common.RoleAdminUser {
		params.Group = c.GetString("group")
	} else {
		params.Group = c.Query("group")
	}

	result, err := SearchAuditLogs(params)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "查询失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"logs":  result.Logs,
			"total": result.Total,
			"page":  params.Page,
		},
	})
}

func GetAuditStatsHandler(c *gin.Context) {
	role := c.GetInt("role")
	group := ""
	if role < common.RoleAdminUser {
		group = c.GetString("group")
	} else {
		group = c.Query("group")
	}

	startTime, _ := strconv.ParseInt(c.DefaultQuery("start_time", "0"), 10, 64)
	endTime, _ := strconv.ParseInt(c.DefaultQuery("end_time", "0"), 10, 64)

	stats, err := GetAuditStats(group, startTime, endTime)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}

func ReviewAuditLogHandler(c *gin.Context) {
	requestId := c.Param("request_id")
	if requestId == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "request_id 不能为空"})
		return
	}

	var body struct {
		ReviewNote string `json:"review_note"`
	}
	c.ShouldBindJSON(&body)

	username := ""
	if un, exists := c.Get("username"); exists {
		username, _ = un.(string)
	}

	if err := UpdateAuditLogReview(requestId, username, body.ReviewNote); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "审阅成功"})
}

// --- 审计配置 API ---

func GetAuditConfigHandler(c *gin.Context) {
	userIdStr := c.Param("user_id")
	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的用户 ID"})
		return
	}

	config, err := GetAuditConfig(auditDB, userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": config})
}

func SetAuditConfigHandler(c *gin.Context) {
	userIdStr := c.Param("user_id")
	userId, err := strconv.Atoi(userIdStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的用户 ID"})
		return
	}

	var body struct {
		AuditEnabled bool `json:"audit_enabled"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
		return
	}

	updatedBy := c.GetInt("id")
	if err := SetAuditConfig(auditDB, userId, body.AuditEnabled, updatedBy); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "配置更新成功"})
}

// BatchGetAuditConfigsHandler 批量获取用户审计状态（用户管理页面用）
func BatchGetAuditConfigsHandler(c *gin.Context) {
	var body struct {
		UserIds []int `json:"user_ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
		return
	}

	configs, err := BatchGetAuditConfigs(auditDB, body.UserIds)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": configs})
}

// GetCurrentUserAuditStatus 当前用户的审计状态（用于前端判断是否显示菜单）
func GetCurrentUserAuditStatusHandler(c *gin.Context) {
	userId := c.GetInt("id")
	role := c.GetInt("role")

	// 管理员总是有审计权限
	if role >= common.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"audit_enabled": true, "is_admin": true}})
		return
	}

	enabled := IsAuditEnabled(auditDB, userId)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"audit_enabled": enabled, "is_admin": false}})
}

// --- 审计权限中间件 ---

func AuditAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetInt("role")
		userId := c.GetInt("id")

		// 管理员直接通过
		if role >= common.RoleAdminUser {
			c.Next()
			return
		}

		// 普通用户检查是否开启了审计
		if IsAuditEnabled(auditDB, userId) {
			c.Next()
			return
		}

		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "无审计权限"})
		c.Abort()
	}
}

// --- 获取用户信息辅助 ---

func GetUserById(userId int) (*model.User, error) {
	user, err := model.GetUserById(userId, false)
	return user, err
}

package audit

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// --- 保存策略 API ---

// GetRetentionPoliciesHandler 获取所有保存策略
func GetRetentionPoliciesHandler(c *gin.Context) {
	policies, err := GetRetentionPolicies(auditDB)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "获取保存策略失败: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": policies})
}

// GetRetentionSummaryHandler 获取各分组数据量概况
func GetRetentionSummaryHandler(c *gin.Context) {
	items, err := GetRetentionSummary(auditDB)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "获取概况失败: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": items})
}

// UpsertRetentionPolicyHandler 创建或更新保存策略
func UpsertRetentionPolicyHandler(c *gin.Context) {
	var body struct {
		Group         string `json:"group"`
		RetentionDays int    `json:"retention_days"`
		Description   string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "参数错误"})
		return
	}

	if body.Group == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "分组名不能为空"})
		return
	}
	if body.RetentionDays < 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "保存天数不能为负数"})
		return
	}

	updatedBy := c.GetInt("id")
	policy := &RetentionPolicy{
		Group:         body.Group,
		RetentionDays: body.RetentionDays,
		Description:   body.Description,
		UpdatedBy:     updatedBy,
	}

	if err := UpsertRetentionPolicy(auditDB, policy); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "保存失败: " + err.Error()})
		return
	}

	daysText := strconv.Itoa(body.RetentionDays) + " 天"
	if body.RetentionDays == 0 {
		daysText = "永久保存"
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "保存策略已更新: " + body.Group + " → " + daysText})
}

// DeleteRetentionPolicyHandler 删除保存策略
func DeleteRetentionPolicyHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的 ID"})
		return
	}

	if err := DeleteRetentionPolicy(auditDB, id); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "策略已删除，该分组将使用全局默认策略"})
}

// ManualRetentionCleanupHandler 手动触发一次清理
func ManualRetentionCleanupHandler(c *gin.Context) {
	go runRetentionCleanup(auditDB)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "清理任务已启动，请稍后查看日志"})
}

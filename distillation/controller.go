package distillation

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

// GetDistillationConfig 获取蒸馏检测配置
func GetDistillationConfig(c *gin.Context) {
	cfg := GetConfig()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    cfg,
	})
}

// GetDistillationWhitelist 获取白名单
func GetDistillationWhitelist(c *gin.Context) {
	ids, err := GetWhitelist()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": ids})
}

// AddDistillationWhitelist 添加白名单
func AddDistillationWhitelist(c *gin.Context) {
	var req struct {
		TokenId int `json:"token_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.TokenId <= 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的 token_id"})
		return
	}
	if err := AddWhitelist(req.TokenId); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "已添加到白名单"})
}

// RemoveDistillationWhitelist 移除白名单
func RemoveDistillationWhitelist(c *gin.Context) {
	tokenIdStr := c.Param("id")
	tokenId, err := strconv.Atoi(tokenIdStr)
	if err != nil || tokenId <= 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "无效的 token_id"})
		return
	}
	if err := RemoveWhitelist(tokenId); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "已从白名单移除"})
}

// GetDistillationAlerts 获取告警记录（从 Redis 读取当前活跃的告警计数）
func GetDistillationAlerts(c *gin.Context) {
	if !common.RedisEnabled || common.RDB == nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "Redis not enabled"})
		return
	}
	// 扫描所有告警计数 key
	ctx := c.Request.Context()
	var alerts []gin.H
	iter := common.RDB.Scan(ctx, 0, keyAlertCount+"*", 100).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		tokenIdStr := key[len(keyAlertCount):]
		count, _ := common.RDB.Get(ctx, key).Int()
		tokenId, _ := strconv.Atoi(tokenIdStr)
		alerts = append(alerts, gin.H{
			"token_id":    tokenId,
			"alert_count": count,
		})
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": alerts})
}

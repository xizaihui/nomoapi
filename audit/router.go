package audit

import (
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-gonic/gin"
)

// SetAuditRouter 注册审计模块路由
func SetAuditRouter(apiRouter *gin.RouterGroup) {
	auditRouter := apiRouter.Group("/audit")
	auditRouter.Use(middleware.UserAuth())
	{
		// 当前用户审计状态（前端用来判断是否显示菜单）
		auditRouter.GET("/status", GetCurrentUserAuditStatusHandler)

		// 需要审计权限的路由
		authorized := auditRouter.Group("")
		authorized.Use(AuditAuth())
		{
			// 审计日志
			authorized.GET("/logs", SearchAuditLogsHandler)
			authorized.GET("/stats", GetAuditStatsHandler)
			authorized.POST("/logs/:request_id/review", ReviewAuditLogHandler)

			// 审计规则
			authorized.GET("/rules", GetAuditRulesHandler)
			authorized.POST("/rules", CreateAuditRuleHandler)
			authorized.PUT("/rules/:id", UpdateAuditRuleHandler)
			authorized.DELETE("/rules/:id", DeleteAuditRuleHandler)
		}

		// 管理员专用：审计配置（开关）
		adminRouter := auditRouter.Group("/config")
		adminRouter.Use(middleware.AdminAuth())
		{
			adminRouter.GET("/user/:user_id", GetAuditConfigHandler)
			adminRouter.POST("/user/:user_id", SetAuditConfigHandler)
			adminRouter.POST("/batch", BatchGetAuditConfigsHandler)
		}
	}
}

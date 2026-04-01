package router

import (
	"embed"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/QuantumNous/new-api/audit"
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/distillation"
	"github.com/QuantumNous/new-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetRouter(router *gin.Engine, buildFS embed.FS, indexPage []byte) {
	SetApiRouter(router)
	SetDashboardRouter(router)
	SetRelayRouter(router)
	SetVideoRouter(router)

	// 审计模块路由（独立模块，不影响上游）
	apiGroup := router.Group("/api")
	audit.SetAuditRouter(apiGroup)

	// 蒸馏检测路由
	distillGroup := apiGroup.Group("/distillation")
	distillGroup.Use(middleware.AdminAuth())
	{
		distillGroup.GET("/config", distillation.GetDistillationConfig)
		distillGroup.GET("/whitelist", distillation.GetDistillationWhitelist)
		distillGroup.POST("/whitelist", distillation.AddDistillationWhitelist)
		distillGroup.DELETE("/whitelist/:id", distillation.RemoveDistillationWhitelist)
		distillGroup.GET("/alerts", distillation.GetDistillationAlerts)
	}
	frontendBaseUrl := os.Getenv("FRONTEND_BASE_URL")
	if common.IsMasterNode && frontendBaseUrl != "" {
		frontendBaseUrl = ""
		common.SysLog("FRONTEND_BASE_URL is ignored on master node")
	}
	if frontendBaseUrl == "" {
		SetWebRouter(router, buildFS, indexPage)
	} else {
		frontendBaseUrl = strings.TrimSuffix(frontendBaseUrl, "/")
		router.NoRoute(func(c *gin.Context) {
			c.Set(middleware.RouteTagKey, "web")
			c.Redirect(http.StatusMovedPermanently, fmt.Sprintf("%s%s", frontendBaseUrl, c.Request.RequestURI))
		})
	}
}

package audit

import (
	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

// SeedDefaultRules 初始化默认审计规则
func SeedDefaultRules(db *gorm.DB) {
	var count int64
	db.Model(&AuditRule{}).Count(&count)
	if count > 0 {
		return // 已有规则，不重复初始化
	}

	defaultRules := []AuditRule{
		// 🚫 违禁内容
		{
			Name:        "色情内容检测",
			Category:    "prohibited",
			RuleType:    "keyword",
			Patterns:    `["色情","黄色","裸体","性爱","嫖娼","卖淫","AV","成人视频"]`,
			RiskLevel:   2,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测色情相关违禁内容",
		},
		{
			Name:        "赌博内容检测",
			Category:    "prohibited",
			RuleType:    "keyword",
			Patterns:    `["赌博","赌场","博彩","下注","赔率","庄家","老虎机","百家乐"]`,
			RiskLevel:   2,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测赌博相关违禁内容",
		},
		{
			Name:        "毒品内容检测",
			Category:    "prohibited",
			RuleType:    "keyword",
			Patterns:    `["毒品","冰毒","海洛因","大麻","可卡因","摇头丸","吸毒","贩毒","制毒"]`,
			RiskLevel:   3,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测毒品相关违禁内容",
		},
		{
			Name:        "暴力血腥内容检测",
			Category:    "prohibited",
			RuleType:    "keyword",
			Patterns:    `["杀人方法","制造炸弹","自杀方法","投毒","纵火","恐怖袭击"]`,
			RiskLevel:   3,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测暴力血腥相关违禁内容",
		},

		// 🏛️ 政治敏感
		{
			Name:        "政治敏感事件检测",
			Category:    "political",
			RuleType:    "keyword",
			Patterns:    `["天安门事件","六四","文化大革命","法轮功","藏独","疆独","台独"]`,
			RiskLevel:   2,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测政治敏感事件关键词",
		},

		// 🔒 商业机密
		{
			Name:        "公司机密文件检测",
			Category:    "secret",
			RuleType:    "keyword",
			Patterns:    `["公司机密","商业秘密","内部文件","保密协议","竞业禁止","核心技术"]`,
			RiskLevel:   2,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测公司核心机密或文件泄露",
		},
		{
			Name:        "财务数据泄露检测",
			Category:    "secret",
			RuleType:    "keyword",
			Patterns:    `["财务报表","利润表","资产负债","营收数据","薪资表","工资单"]`,
			RiskLevel:   2,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测财务数据泄露",
		},

		// 🔑 凭证泄露
		{
			Name:        "密码泄露检测",
			Category:    "credential",
			RuleType:    "regex",
			Patterns:    `["(?i)password\\s*[:=]\\s*\\S+","(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)\\s*[:=]\\s*\\S+"]`,
			RiskLevel:   3,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测密码、API Key、Secret 泄露",
		},
		{
			Name:        "私钥内容检测",
			Category:    "credential",
			RuleType:    "regex",
			Patterns:    `["(?i)(BEGIN\\s+(RSA|DSA|EC|OPENSSH)\\s+PRIVATE\\s+KEY)"]`,
			RiskLevel:   3,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测私钥内容泄露",
		},
		{
			Name:        "数据库连接串检测",
			Category:    "credential",
			RuleType:    "regex",
			Patterns:    `["(?i)jdbc:[a-z]+://[^\\s]+","(?i)(mysql|postgres|mongodb)://[^\\s]+"]`,
			RiskLevel:   3,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测数据库连接串泄露",
		},

		// 🖥️ 基础设施
		{
			Name:        "服务器信息泄露检测",
			Category:    "infra",
			RuleType:    "regex",
			Patterns:    `["(?i)(ssh|root|admin)@\\d+\\.\\d+\\.\\d+\\.\\d+","(?i)(生产环境|prod|production)\\s*(服务器|server|ip|地址)"]`,
			RiskLevel:   3,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测生产环境服务器信息泄露",
		},
		{
			Name:        "危险运维操作检测",
			Category:    "infra",
			RuleType:    "regex",
			Patterns:    `["(?i)(rm\\s+-rf|drop\\s+table|drop\\s+database|truncate\\s+table)","(?i)(chmod\\s+777|iptables\\s+-F)"]`,
			RiskLevel:   2,
			Enabled:     true,
			IsGlobal:    true,
			Description: "检测危险运维操作指令",
		},
	}

	for i := range defaultRules {
		if err := db.Create(&defaultRules[i]).Error; err != nil {
			common.SysError("创建默认审计规则失败: " + err.Error())
		}
	}

	common.SysLog("默认审计规则初始化完成，共 " + string(rune(len(defaultRules)+'0')) + " 条")
}

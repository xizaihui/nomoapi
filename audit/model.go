package audit

import (
	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

// AuditRule 审计规则（存 PostgreSQL）
type AuditRule struct {
	Id          int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string `json:"name" gorm:"type:varchar(128);not null"`
	Category    string `json:"category" gorm:"type:varchar(32);index;not null"`  // prohibited, political, secret, credential, infra, custom
	RuleType    string `json:"rule_type" gorm:"type:varchar(16);not null"`       // keyword, regex
	Patterns    string `json:"patterns" gorm:"type:text;not null"`               // JSON array of strings
	RiskLevel   int    `json:"risk_level" gorm:"default:1"`                      // 1=可疑 2=危险 3=高危
	Enabled     bool   `json:"enabled" gorm:"default:true"`
	IsGlobal    bool   `json:"is_global" gorm:"default:true"`                    // true=全局规则(管理员创建) false=公司自定义
	OwnerGroup  string `json:"owner_group" gorm:"type:varchar(64);index;default:''"` // 创建者所属分组，全局规则为空
	Description string `json:"description" gorm:"type:varchar(512)"`
	CreatedBy   int    `json:"created_by" gorm:"default:0"`
	CreatedAt   int64  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   int64  `json:"updated_at" gorm:"autoUpdateTime"`
}

func (AuditRule) TableName() string {
	return "audit_rules"
}

// AuditConfig 审计开关配置（按用户维度，存 PostgreSQL）
type AuditConfig struct {
	Id           int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	UserId       int    `json:"user_id" gorm:"uniqueIndex;not null"`
	AuditEnabled bool   `json:"audit_enabled" gorm:"default:false"`
	UpdatedBy    int    `json:"updated_by" gorm:"default:0"`
	UpdatedAt    int64  `json:"updated_at" gorm:"autoUpdateTime"`
}

func (AuditConfig) TableName() string {
	return "audit_configs"
}

// --- CRUD for AuditRule ---

func GetAuditRules(db *gorm.DB, page, pageSize int, category, group string, globalOnly bool) (rules []AuditRule, total int64, err error) {
	query := db.Model(&AuditRule{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if globalOnly {
		query = query.Where("is_global = ?", true)
	} else if group != "" {
		// 返回全局规则 + 该分组的自定义规则
		query = query.Where("is_global = ? OR owner_group = ?", true, group)
	}
	err = query.Count(&total).Error
	if err != nil {
		return
	}
	err = query.Order("id DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rules).Error
	return
}

func GetAuditRuleById(db *gorm.DB, id int64) (*AuditRule, error) {
	var rule AuditRule
	err := db.First(&rule, id).Error
	return &rule, err
}

func CreateAuditRule(db *gorm.DB, rule *AuditRule) error {
	return db.Create(rule).Error
}

func UpdateAuditRule(db *gorm.DB, rule *AuditRule) error {
	return db.Save(rule).Error
}

func DeleteAuditRule(db *gorm.DB, id int64) error {
	return db.Delete(&AuditRule{}, id).Error
}

// GetEnabledRules 获取对某个分组生效的所有启用规则
func GetEnabledRules(db *gorm.DB, group string) ([]AuditRule, error) {
	var rules []AuditRule
	err := db.Where("enabled = ? AND (is_global = ? OR owner_group = ?)", true, true, group).Find(&rules).Error
	return rules, err
}

// --- CRUD for AuditConfig ---

func GetAuditConfig(db *gorm.DB, userId int) (*AuditConfig, error) {
	var config AuditConfig
	err := db.Where("user_id = ?", userId).First(&config).Error
	if err == gorm.ErrRecordNotFound {
		return &AuditConfig{UserId: userId, AuditEnabled: false}, nil
	}
	return &config, err
}

func SetAuditConfig(db *gorm.DB, userId int, enabled bool, updatedBy int) error {
	var config AuditConfig
	err := db.Where("user_id = ?", userId).First(&config).Error
	if err == gorm.ErrRecordNotFound {
		config = AuditConfig{
			UserId:       userId,
			AuditEnabled: enabled,
			UpdatedBy:    updatedBy,
		}
		return db.Create(&config).Error
	}
	if err != nil {
		return err
	}
	config.AuditEnabled = enabled
	config.UpdatedBy = updatedBy
	return db.Save(&config).Error
}

func GetAuditEnabledUserIds(db *gorm.DB) ([]int, error) {
	var configs []AuditConfig
	err := db.Where("audit_enabled = ?", true).Find(&configs).Error
	if err != nil {
		return nil, err
	}
	ids := make([]int, len(configs))
	for i, c := range configs {
		ids[i] = c.UserId
	}
	return ids, err
}

func IsAuditEnabled(db *gorm.DB, userId int) bool {
	var config AuditConfig
	err := db.Where("user_id = ? AND audit_enabled = ?", userId, true).First(&config).Error
	return err == nil
}

// BatchGetAuditConfigs 批量获取用户审计配置
func BatchGetAuditConfigs(db *gorm.DB, userIds []int) (map[int]bool, error) {
	var configs []AuditConfig
	err := db.Where("user_id IN ? AND audit_enabled = ?", userIds, true).Find(&configs).Error
	if err != nil {
		return nil, err
	}
	result := make(map[int]bool)
	for _, c := range configs {
		result[c.UserId] = true
	}
	return result, err
}

// InitAuditTables 初始化审计相关表
func InitAuditTables(db *gorm.DB) error {
	err := db.AutoMigrate(&AuditRule{}, &AuditConfig{})
	if err != nil {
		common.SysLog("审计模块表初始化失败: " + err.Error())
		return err
	}
	common.SysLog("审计模块表初始化成功")
	return nil
}

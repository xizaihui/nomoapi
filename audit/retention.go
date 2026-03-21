package audit

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

// RetentionPolicy 审计日志保存策略
type RetentionPolicy struct {
	Id            int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Group         string `json:"group" gorm:"type:varchar(64);uniqueIndex;not null"`  // 分组名，"*" 表示全局默认
	RetentionDays int    `json:"retention_days" gorm:"default:90;not null"`           // 保存天数，0=永久
	Description   string `json:"description" gorm:"type:varchar(256)"`
	UpdatedBy     int    `json:"updated_by" gorm:"default:0"`
	CreatedAt     int64  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     int64  `json:"updated_at" gorm:"autoUpdateTime"`
}

func (RetentionPolicy) TableName() string {
	return "audit_retention_policies"
}

// --- CRUD ---

// GetRetentionPolicies 获取所有保存策略
func GetRetentionPolicies(db *gorm.DB) ([]RetentionPolicy, error) {
	var policies []RetentionPolicy
	err := db.Order("CASE WHEN \"group\" = '*' THEN 0 ELSE 1 END, \"group\" ASC").Find(&policies).Error
	return policies, err
}

// GetRetentionPolicyByGroup 获取指定分组的保存策略，找不到则返回全局默认
func GetRetentionPolicyByGroup(db *gorm.DB, group string) (*RetentionPolicy, error) {
	var policy RetentionPolicy
	// 先找分组专属
	err := db.Where("\"group\" = ?", group).First(&policy).Error
	if err == nil {
		return &policy, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}
	// 找全局默认
	err = db.Where("\"group\" = ?", "*").First(&policy).Error
	if err == gorm.ErrRecordNotFound {
		// 没有任何策略，返回默认 90 天
		return &RetentionPolicy{Group: "*", RetentionDays: 30, Description: "系统默认"}, nil
	}
	return &policy, err
}

// UpsertRetentionPolicy 创建或更新保存策略
func UpsertRetentionPolicy(db *gorm.DB, policy *RetentionPolicy) error {
	var existing RetentionPolicy
	err := db.Where("\"group\" = ?", policy.Group).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return db.Create(policy).Error
	}
	if err != nil {
		return err
	}
	existing.RetentionDays = policy.RetentionDays
	existing.Description = policy.Description
	existing.UpdatedBy = policy.UpdatedBy
	return db.Save(&existing).Error
}

// DeleteRetentionPolicy 删除保存策略（不允许删除全局默认）
func DeleteRetentionPolicy(db *gorm.DB, id int64) error {
	var policy RetentionPolicy
	if err := db.First(&policy, id).Error; err != nil {
		return err
	}
	if policy.Group == "*" {
		return fmt.Errorf("不能删除全局默认策略，只能修改")
	}
	return db.Delete(&RetentionPolicy{}, id).Error
}

// InitRetentionTable 初始化保存策略表
func InitRetentionTable(db *gorm.DB) error {
	if err := db.AutoMigrate(&RetentionPolicy{}); err != nil {
		return err
	}
	// 确保全局默认策略存在
	var count int64
	db.Model(&RetentionPolicy{}).Where("\"group\" = ?", "*").Count(&count)
	if count == 0 {
		defaultPolicy := &RetentionPolicy{
			Group:         "*",
			RetentionDays: 30,
			Description:   "全局默认：保存 30 天",
		}
		if err := db.Create(defaultPolicy).Error; err != nil {
			return err
		}
		common.SysLog("审计日志保存策略初始化：全局默认 30 天")
	}
	return nil
}

// --- 定时清理 ---

// StartRetentionCleaner 启动定时清理协程，每天凌晨 3 点执行一次
func StartRetentionCleaner(db *gorm.DB) {
	go func() {
		// 启动后等待 1 分钟再首次执行（让 ES 先就绪）
		time.Sleep(1 * time.Minute)

		// 首次立即执行一次
		runRetentionCleanup(db)

		// 之后每天凌晨 3 点执行
		for {
			now := time.Now()
			next := time.Date(now.Year(), now.Month(), now.Day()+1, 3, 0, 0, 0, now.Location())
			sleepDuration := next.Sub(now)
			time.Sleep(sleepDuration)
			runRetentionCleanup(db)
		}
	}()
	common.SysLog("审计日志保存策略清理协程已启动")
}

func runRetentionCleanup(db *gorm.DB) {
	if !IsESEnabled() {
		return
	}

	policies, err := GetRetentionPolicies(db)
	if err != nil {
		common.SysError("获取保存策略失败: " + err.Error())
		return
	}

	// 构建 group -> retention_days 映射
	groupRetention := make(map[string]int)
	globalDays := 30 // 最终兜底
	for _, p := range policies {
		if p.Group == "*" {
			globalDays = p.RetentionDays
		} else {
			groupRetention[p.Group] = p.RetentionDays
		}
	}

	// 如果全局策略设为 0（永久），且没有任何分组策略，则跳过清理
	if globalDays == 0 && len(groupRetention) == 0 {
		common.SysLog("审计日志保存策略: 全局永久保存，无分组策略，跳过清理")
		return
	}

	// 清理分组指定的过期数据
	totalDeleted := int64(0)
	for group, days := range groupRetention {
		if days == 0 {
			continue // 该分组永久保存
		}
		cutoff := time.Now().Add(-time.Duration(days) * 24 * time.Hour).Unix()
		deleted, err := deleteAuditLogsBefore(group, cutoff)
		if err != nil {
			common.SysError(fmt.Sprintf("清理分组 %s 审计日志失败: %s", group, err.Error()))
		} else if deleted > 0 {
			totalDeleted += deleted
			common.SysLog(fmt.Sprintf("清理分组 %s 审计日志: 删除 %d 条 (保留 %d 天)", group, deleted, days))
		}
	}

	// 清理全局策略覆盖的剩余数据（不在任何分组策略中的 group 都用全局策略）
	if globalDays > 0 {
		cutoff := time.Now().Add(-time.Duration(globalDays) * 24 * time.Hour).Unix()
		// 排除有专属策略的分组
		excludeGroups := make([]string, 0, len(groupRetention))
		for g := range groupRetention {
			excludeGroups = append(excludeGroups, g)
		}
		deleted, err := deleteAuditLogsGlobal(cutoff, excludeGroups)
		if err != nil {
			common.SysError("清理全局审计日志失败: " + err.Error())
		} else if deleted > 0 {
			totalDeleted += deleted
			common.SysLog(fmt.Sprintf("清理全局审计日志: 删除 %d 条 (保留 %d 天)", deleted, globalDays))
		}
	}

	if totalDeleted > 0 {
		common.SysLog(fmt.Sprintf("审计日志清理完成，共删除 %d 条", totalDeleted))
	}
}

// deleteAuditLogsBefore 删除指定分组在 cutoff 之前的日志
func deleteAuditLogsBefore(group string, cutoffUnix int64) (int64, error) {
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": []map[string]interface{}{
					{"term": map[string]interface{}{"group": group}},
					{"range": map[string]interface{}{"created_at": map[string]interface{}{"lt": cutoffUnix}}},
				},
			},
		},
	}
	return esDeleteByQuery(query)
}

// deleteAuditLogsGlobal 删除不在 excludeGroups 中的、cutoff 之前的日志
func deleteAuditLogsGlobal(cutoffUnix int64, excludeGroups []string) (int64, error) {
	must := []map[string]interface{}{
		{"range": map[string]interface{}{"created_at": map[string]interface{}{"lt": cutoffUnix}}},
	}

	if len(excludeGroups) > 0 {
		mustNot := []map[string]interface{}{
			{"terms": map[string]interface{}{"group": excludeGroups}},
		}
		query := map[string]interface{}{
			"query": map[string]interface{}{
				"bool": map[string]interface{}{
					"must":     must,
					"must_not": mustNot,
				},
			},
		}
		return esDeleteByQuery(query)
	}

	query := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": must,
			},
		},
	}
	return esDeleteByQuery(query)
}

// esDeleteByQuery 执行 ES delete_by_query
func esDeleteByQuery(query map[string]interface{}) (int64, error) {
	if esClient == nil || !esClient.enabled {
		return 0, nil
	}

	body, err := json.Marshal(query)
	if err != nil {
		return 0, err
	}

	req, err := http.NewRequest("POST",
		esClient.baseURL+"/audit-logs-*/_delete_by_query?conflicts=proceed&wait_for_completion=true",
		bytes.NewReader(body))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := esClient.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	if resp.StatusCode >= 300 {
		return 0, fmt.Errorf("ES delete_by_query 失败 (%d): %s", resp.StatusCode, string(respBody))
	}

	var result struct {
		Deleted int64 `json:"deleted"`
	}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return 0, err
	}

	return result.Deleted, nil
}

// GetRetentionSummary 获取各分组数据量概况（用于前端展示）
func GetRetentionSummary(db *gorm.DB) ([]RetentionSummaryItem, error) {
	if !IsESEnabled() {
		return nil, nil
	}

	// 先获取所有策略
	policies, err := GetRetentionPolicies(db)
	if err != nil {
		return nil, err
	}

	// 获取 ES 中按 group 的文档数
	groupCounts, err := getGroupDocCounts()
	if err != nil {
		return nil, err
	}

	// 合并
	policyMap := make(map[string]*RetentionPolicy)
	for i := range policies {
		policyMap[policies[i].Group] = &policies[i]
	}

	var items []RetentionSummaryItem
	// 先放全局默认
	if gp, ok := policyMap["*"]; ok {
		totalDocs := int64(0)
		for _, c := range groupCounts {
			totalDocs += c
		}
		items = append(items, RetentionSummaryItem{
			Group:         "*",
			RetentionDays: gp.RetentionDays,
			Description:   gp.Description,
			DocCount:      totalDocs,
			IsDefault:     true,
		})
	}

	// 再放各分组
	for group, count := range groupCounts {
		days := 0
		desc := ""
		isCustom := false
		if p, ok := policyMap[group]; ok {
			days = p.RetentionDays
			desc = p.Description
			isCustom = true
		} else if gp, ok := policyMap["*"]; ok {
			days = gp.RetentionDays
			desc = "继承全局默认"
		}
		items = append(items, RetentionSummaryItem{
			Group:         group,
			RetentionDays: days,
			Description:   desc,
			DocCount:      count,
			IsDefault:     !isCustom,
		})
	}

	return items, nil
}

type RetentionSummaryItem struct {
	Group         string `json:"group"`
	RetentionDays int    `json:"retention_days"`
	Description   string `json:"description"`
	DocCount      int64  `json:"doc_count"`
	IsDefault     bool   `json:"is_default"` // true=继承全局, false=有自定义策略
}

// getGroupDocCounts 获取 ES 中各 group 的文档数
func getGroupDocCounts() (map[string]int64, error) {
	query := map[string]interface{}{
		"size": 0,
		"aggs": map[string]interface{}{
			"groups": map[string]interface{}{
				"terms": map[string]interface{}{
					"field": "group",
					"size":  1000,
				},
			},
		},
	}

	body, _ := json.Marshal(query)
	req, err := http.NewRequest("POST", esClient.baseURL+"/audit-logs-*/_search", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := esClient.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var esResp struct {
		Aggregations struct {
			Groups struct {
				Buckets []struct {
					Key      string `json:"key"`
					DocCount int64  `json:"doc_count"`
				} `json:"buckets"`
			} `json:"groups"`
		} `json:"aggregations"`
	}

	if err := json.Unmarshal(respBody, &esResp); err != nil {
		return nil, err
	}

	counts := make(map[string]int64)
	for _, b := range esResp.Aggregations.Groups.Buckets {
		counts[b.Key] = b.DocCount
	}
	return counts, nil
}

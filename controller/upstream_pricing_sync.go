package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/gin-gonic/gin"
)

// ==================== 数据结构 ====================

type UpstreamSiteConfig struct {
	Name     string `json:"name"`
	URL      string `json:"url"`
	VendorID *int   `json:"vendor_id"`
	Group    string `json:"group"`
}

type PricingSyncConfig struct {
	Upstreams   []UpstreamSiteConfig   `json:"upstreams"`
	GroupRatios map[string]float64     `json:"group_ratios"`
}

type UpstreamPricingModel struct {
	ModelName              string   `json:"model_name"`
	VendorID               *int     `json:"vendor_id,omitempty"`
	QuotaType              int      `json:"quota_type"`
	ModelRatio             float64  `json:"model_ratio"`
	ModelPrice             float64  `json:"model_price"`
	CompletionRatio        float64  `json:"completion_ratio"`
	CacheRatio             *float64 `json:"cache_ratio,omitempty"`
	CreateCacheRatio       *float64 `json:"create_cache_ratio,omitempty"`
	EnableGroups           []string `json:"enable_groups"`
	OwnerBy                string   `json:"owner_by"`
}

type UpstreamPricingResponse struct {
	Success    bool                   `json:"success"`
	Data       []UpstreamPricingModel `json:"data"`
	GroupRatio map[string]float64     `json:"group_ratio"`
	Vendors    []UpstreamVendorInfo   `json:"vendors"`
}

type UpstreamVendorInfo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

// 魔改格式 (catapi 等)
type AltUpstreamPricingResponse struct {
	Success bool `json:"success"`
	Data    struct {
		ModelRatio      map[string]float64 `json:"ModelRatio"`
		CompletionRatio map[string]float64 `json:"CompletionRatio"`
		GroupRatio      map[string]float64 `json:"GroupRatio"`
		ModelFixedPrice map[string]float64 `json:"ModelFixedPrice"`
	} `json:"data"`
}

type PricingSyncDiffItem struct {
	ModelName     string   `json:"model_name"`
	Status        string   `json:"status"` // "new", "changed", "unchanged"
	OldRatio      *float64 `json:"old_ratio,omitempty"`
	NewRatio      *float64 `json:"new_ratio,omitempty"`
	OldCompletion *float64 `json:"old_completion,omitempty"`
	NewCompletion *float64 `json:"new_completion,omitempty"`
	OldPrice      *float64 `json:"old_price,omitempty"`
	NewPrice      *float64 `json:"new_price,omitempty"`
	QuotaType     int      `json:"quota_type"`
}

type PricingSyncBackup struct {
	ID               int                `json:"id"`
	Timestamp        string             `json:"timestamp"`
	UpstreamName     string             `json:"upstream_name"`
	ModelRatio       map[string]float64 `json:"model_ratio"`
	CompletionRatio  map[string]float64 `json:"completion_ratio"`
	ModelPrice       map[string]float64 `json:"model_price"`
	GroupRatio       map[string]float64 `json:"group_ratio"`
	CacheRatio       map[string]float64 `json:"cache_ratio"`
	CreateCacheRatio map[string]float64 `json:"create_cache_ratio"`
}

// ==================== 辅助函数 ====================

var vendorPrefixMap = map[string]int{
	"gpt": 4, "o1": 4, "o3": 4, "o4": 4, "dall-e": 4, "whisper": 4, "tts": 4,
	"claude": 5, "gemini": 10, "deepseek": 7, "qwen": 17,
	"glm": 3, "llama": 6, "mistral": 14, "grok": 11,
}

var vendorNameMap = map[int]string{
	4: "OpenAI", 5: "Anthropic", 10: "Google", 7: "DeepSeek",
	17: "阿里巴巴", 3: "智谱", 6: "Meta", 14: "Mistral", 11: "xAI",
}

func fetchUpstreamPricingData(upstreamURL string) (*UpstreamPricingResponse, error) {
	apiURL := strings.TrimRight(upstreamURL, "/") + "/api/pricing"
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("请求上游失败: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// 先尝试标准 NewAPI 格式
	var pricing UpstreamPricingResponse
	if err := json.Unmarshal(body, &pricing); err == nil && len(pricing.Data) > 0 {
		return &pricing, nil
	}

	// 尝试魔改格式
	var altPricing AltUpstreamPricingResponse
	if err := json.Unmarshal(body, &altPricing); err == nil && len(altPricing.Data.ModelRatio) > 0 {
		return convertAltUpstreamPricing(&altPricing), nil
	}

	return nil, fmt.Errorf("无法解析上游数据，不是标准 NewAPI 格式也不是已知魔改格式")
}

func convertAltUpstreamPricing(alt *AltUpstreamPricingResponse) *UpstreamPricingResponse {
	result := &UpstreamPricingResponse{
		Success:    true,
		GroupRatio: alt.Data.GroupRatio,
		Vendors:    []UpstreamVendorInfo{},
		Data:       []UpstreamPricingModel{},
	}

	allModels := make(map[string]bool)
	for name := range alt.Data.ModelRatio {
		allModels[name] = true
	}
	for name := range alt.Data.ModelFixedPrice {
		allModels[name] = true
	}

	vendorSeen := make(map[int]bool)
	for name := range allModels {
		m := UpstreamPricingModel{
			ModelName:    name,
			EnableGroups: []string{"default"},
		}

		if ratio, ok := alt.Data.ModelRatio[name]; ok {
			m.ModelRatio = ratio
			m.QuotaType = 0
		}
		if price, ok := alt.Data.ModelFixedPrice[name]; ok && price > 0 {
			m.ModelPrice = price
			m.QuotaType = 1
		}
		if cr, ok := alt.Data.CompletionRatio[name]; ok {
			m.CompletionRatio = cr
		} else {
			m.CompletionRatio = 1
		}

		nameLower := strings.ToLower(name)
		for prefix, vid := range vendorPrefixMap {
			if strings.Contains(nameLower, prefix) {
				v := vid
				m.VendorID = &v
				vendorSeen[vid] = true
				break
			}
		}

		result.Data = append(result.Data, m)
	}

	for vid := range vendorSeen {
		name := vendorNameMap[vid]
		if name == "" {
			name = fmt.Sprintf("Vendor_%d", vid)
		}
		result.Vendors = append(result.Vendors, UpstreamVendorInfo{ID: vid, Name: name})
	}

	return result
}

func filterUpstreamModels(models []UpstreamPricingModel, vendorID *int, group string) []UpstreamPricingModel {
	var filtered []UpstreamPricingModel
	for _, m := range models {
		if vendorID != nil && (m.VendorID == nil || *m.VendorID != *vendorID) {
			continue
		}
		if group != "" {
			found := false
			for _, g := range m.EnableGroups {
				if g == group {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}
		filtered = append(filtered, m)
	}
	return filtered
}

func getExistingRatioOptions() (modelRatio, completionRatio, modelPrice, groupRatio, cacheRatio, createCacheRatio map[string]float64) {
	modelRatio = make(map[string]float64)
	completionRatio = make(map[string]float64)
	modelPrice = make(map[string]float64)
	groupRatio = make(map[string]float64)
	cacheRatio = make(map[string]float64)
	createCacheRatio = make(map[string]float64)

	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()

	if v, ok := common.OptionMap["ModelRatio"]; ok {
		json.Unmarshal([]byte(v), &modelRatio)
	}
	if v, ok := common.OptionMap["CompletionRatio"]; ok {
		json.Unmarshal([]byte(v), &completionRatio)
	}
	if v, ok := common.OptionMap["ModelPrice"]; ok {
		json.Unmarshal([]byte(v), &modelPrice)
	}
	if v, ok := common.OptionMap["GroupRatio"]; ok {
		json.Unmarshal([]byte(v), &groupRatio)
	}
	if v, ok := common.OptionMap["CacheRatio"]; ok {
		json.Unmarshal([]byte(v), &cacheRatio)
	}
	if v, ok := common.OptionMap["CreateCacheRatio"]; ok {
		json.Unmarshal([]byte(v), &createCacheRatio)
	}
	return
}

func updateOptionByKey(key string, value interface{}) error {
	jsonValue, err := json.Marshal(value)
	if err != nil {
		return err
	}
	strValue := string(jsonValue)

	// 特殊处理 GroupRatio
	if key == "GroupRatio" {
		if err := ratio_setting.CheckGroupRatio(strValue); err != nil {
			return fmt.Errorf("%s 校验失败: %v", key, err)
		}
	}

	err = model.UpdateOption(key, strValue)
	if err != nil {
		return err
	}

	common.OptionMapRWMutex.Lock()
	common.OptionMap[key] = strValue
	common.OptionMapRWMutex.Unlock()

	return nil
}

// ==================== API Handlers ====================

// GetPricingSyncConfig — 获取配置
func GetPricingSyncConfig(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	raw, ok := common.OptionMap["UpstreamPricingSyncConfig"]
	common.OptionMapRWMutex.RUnlock()

	var cfg PricingSyncConfig
	if ok && raw != "" {
		json.Unmarshal([]byte(raw), &cfg)
	}
	if cfg.Upstreams == nil {
		cfg.Upstreams = []UpstreamSiteConfig{}
	}
	if cfg.GroupRatios == nil {
		cfg.GroupRatios = make(map[string]float64)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": cfg})
}

// SavePricingSyncConfig — 保存配置
func SavePricingSyncConfig(c *gin.Context) {
	body, _ := io.ReadAll(c.Request.Body)
	common.SysLog(fmt.Sprintf("[PricingSync] SaveConfig body: %s", string(body)))

	var cfg PricingSyncConfig
	if err := json.Unmarshal(body, &cfg); err != nil {
		common.SysLog(fmt.Sprintf("[PricingSync] SaveConfig parse error: %v", err))
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "配置格式错误: " + err.Error()})
		return
	}

	jsonData, _ := json.Marshal(cfg)
	err := model.UpdateOption("UpstreamPricingSyncConfig", string(jsonData))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "保存失败: " + err.Error()})
		return
	}

	common.OptionMapRWMutex.Lock()
	common.OptionMap["UpstreamPricingSyncConfig"] = string(jsonData)
	common.OptionMapRWMutex.Unlock()

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "配置已保存"})
}

// FetchUpstreamPricing — 获取上游站点的 pricing 数据
func FetchUpstreamPricing(c *gin.Context) {
	upstreamURL := c.Query("url")
	if upstreamURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "缺少 url 参数"})
		return
	}

	pricing, err := fetchUpstreamPricingData(upstreamURL)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"data":        pricing.Data,
		"vendors":     pricing.Vendors,
		"group_ratio": pricing.GroupRatio,
	})
}

// PreviewUpstreamModels — 预览过滤后的上游模型
func PreviewUpstreamModels(c *gin.Context) {
	var req struct {
		URL      string `json:"url"`
		VendorID *int   `json:"vendor_id"`
		Group    string `json:"group"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "请求格式错误"})
		return
	}

	if req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "缺少 url"})
		return
	}

	pricing, err := fetchUpstreamPricingData(req.URL)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	models := filterUpstreamModels(pricing.Data, req.VendorID, req.Group)

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"models":      models,
		"total":       len(models),
		"vendors":     pricing.Vendors,
		"group_ratio": pricing.GroupRatio,
	})
}

// DiffUpstreamModels — 对比上游与本地差异
func DiffUpstreamModels(c *gin.Context) {
	var req struct {
		URL      string `json:"url"`
		VendorID *int   `json:"vendor_id"`
		Group    string `json:"group"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "请求格式错误"})
		return
	}

	pricing, err := fetchUpstreamPricingData(req.URL)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	models := filterUpstreamModels(pricing.Data, req.VendorID, req.Group)
	existingMR, existingCR, existingMP, _, _, _ := getExistingRatioOptions()

	var diffs []PricingSyncDiffItem
	for _, m := range models {
		item := PricingSyncDiffItem{
			ModelName: m.ModelName,
			QuotaType: m.QuotaType,
		}

		if m.QuotaType == 1 {
			// 固定价格
			oldPrice, exists := existingMP[m.ModelName]
			if !exists {
				item.Status = "new"
				item.NewPrice = &m.ModelPrice
			} else if oldPrice != m.ModelPrice {
				item.Status = "changed"
				item.OldPrice = &oldPrice
				item.NewPrice = &m.ModelPrice
			} else {
				item.Status = "unchanged"
			}
		} else {
			// 倍率
			oldRatio, exists := existingMR[m.ModelName]
			oldCompletion := existingCR[m.ModelName]
			if !exists {
				item.Status = "new"
				newR := m.ModelRatio
				newC := m.CompletionRatio
				item.NewRatio = &newR
				item.NewCompletion = &newC
			} else if oldRatio != m.ModelRatio || oldCompletion != m.CompletionRatio {
				item.Status = "changed"
				newR := m.ModelRatio
				newC := m.CompletionRatio
				item.OldRatio = &oldRatio
				item.NewRatio = &newR
				item.OldCompletion = &oldCompletion
				item.NewCompletion = &newC
			} else {
				item.Status = "unchanged"
			}
		}

		diffs = append(diffs, item)
	}

	// 统计
	var newCount, changedCount, unchangedCount int
	for _, d := range diffs {
		switch d.Status {
		case "new":
			newCount++
		case "changed":
			changedCount++
		case "unchanged":
			unchangedCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"data":      diffs,
		"total":     len(diffs),
		"new":       newCount,
		"changed":   changedCount,
		"unchanged": unchangedCount,
	})
}

// SyncUpstreamPricing — 执行同步
func SyncUpstreamPricing(c *gin.Context) {
	var req struct {
		URL          string             `json:"url"`
		VendorID     *int               `json:"vendor_id"`
		Group        string             `json:"group"`
		GroupRatios  map[string]float64 `json:"group_ratios"`
		UpstreamName string             `json:"upstream_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "请求格式错误"})
		return
	}

	pricing, err := fetchUpstreamPricingData(req.URL)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	models := filterUpstreamModels(pricing.Data, req.VendorID, req.Group)
	if len(models) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "没有匹配的模型"})
		return
	}

	existingMR, existingCR, existingMP, existingGR, existingCaR, existingCCR := getExistingRatioOptions()

	// 创建备份
	backup := PricingSyncBackup{
		Timestamp:        time.Now().Format(time.RFC3339),
		UpstreamName:     req.UpstreamName,
		ModelRatio:       existingMR,
		CompletionRatio:  existingCR,
		ModelPrice:       existingMP,
		GroupRatio:       existingGR,
		CacheRatio:       existingCaR,
		CreateCacheRatio: existingCCR,
	}
	backupJSON, _ := json.Marshal(backup)

	// 保存备份到 option
	savePricingSyncBackup(string(backupJSON))

	// 合并模型数据
	addedCount := 0
	updatedCount := 0
	for _, m := range models {
		_, exists := existingMR[m.ModelName]
		if !exists {
			if _, priceExists := existingMP[m.ModelName]; !priceExists {
				addedCount++
			} else {
				updatedCount++
			}
		} else {
			updatedCount++
		}

		if m.QuotaType == 1 && m.ModelPrice > 0 {
			existingMP[m.ModelName] = m.ModelPrice
		} else {
			existingMR[m.ModelName] = m.ModelRatio
		}

		if m.CompletionRatio != 0 && m.CompletionRatio != 1 {
			existingCR[m.ModelName] = m.CompletionRatio
		}

		if m.CacheRatio != nil {
			existingCaR[m.ModelName] = *m.CacheRatio
		}
		if m.CreateCacheRatio != nil {
			existingCCR[m.ModelName] = *m.CreateCacheRatio
		}
	}

	// 合并分组倍率
	if req.GroupRatios != nil {
		for group, ratio := range req.GroupRatios {
			existingGR[group] = ratio
		}
	}

	// 写回各项配置
	var details []string
	updates := map[string]interface{}{
		"ModelRatio":       existingMR,
		"CompletionRatio":  existingCR,
		"ModelPrice":       existingMP,
		"GroupRatio":       existingGR,
		"CacheRatio":       existingCaR,
		"CreateCacheRatio": existingCCR,
	}

	for key, value := range updates {
		if err := updateOptionByKey(key, value); err != nil {
			details = append(details, fmt.Sprintf("❌ 更新 %s 失败: %v", key, err))
		} else {
			details = append(details, fmt.Sprintf("✅ 更新 %s 成功", key))
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        fmt.Sprintf("同步完成: 新增 %d 个模型, 更新 %d 个模型", addedCount, updatedCount),
		"models_added":   addedCount,
		"models_updated": updatedCount,
		"details":        details,
	})
}

// ==================== 备份相关 ====================

var backupMu sync.Mutex

func savePricingSyncBackup(backupJSON string) {
	backupMu.Lock()
	defer backupMu.Unlock()

	common.OptionMapRWMutex.RLock()
	raw, ok := common.OptionMap["UpstreamPricingSyncBackups"]
	common.OptionMapRWMutex.RUnlock()

	var backups []json.RawMessage
	if ok && raw != "" {
		json.Unmarshal([]byte(raw), &backups)
	}

	backups = append([]json.RawMessage{json.RawMessage(backupJSON)}, backups...)

	// 最多保留 20 条备份
	if len(backups) > 20 {
		backups = backups[:20]
	}

	data, _ := json.Marshal(backups)
	strValue := string(data)
	model.UpdateOption("UpstreamPricingSyncBackups", strValue)

	common.OptionMapRWMutex.Lock()
	common.OptionMap["UpstreamPricingSyncBackups"] = strValue
	common.OptionMapRWMutex.Unlock()
}

// ListPricingSyncBackups — 列出备份
func ListPricingSyncBackups(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	raw, ok := common.OptionMap["UpstreamPricingSyncBackups"]
	common.OptionMapRWMutex.RUnlock()

	var backups []PricingSyncBackup
	if ok && raw != "" {
		json.Unmarshal([]byte(raw), &backups)
	}
	if backups == nil {
		backups = []PricingSyncBackup{}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": backups})
}

// RestorePricingSyncBackup — 恢复备份
func RestorePricingSyncBackup(c *gin.Context) {
	var req struct {
		Index int `json:"index"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "请求格式错误"})
		return
	}

	common.OptionMapRWMutex.RLock()
	raw, ok := common.OptionMap["UpstreamPricingSyncBackups"]
	common.OptionMapRWMutex.RUnlock()

	var backups []PricingSyncBackup
	if ok && raw != "" {
		json.Unmarshal([]byte(raw), &backups)
	}

	if req.Index < 0 || req.Index >= len(backups) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "无效的备份索引"})
		return
	}

	backup := backups[req.Index]

	var details []string
	updates := map[string]interface{}{
		"ModelRatio":       backup.ModelRatio,
		"CompletionRatio":  backup.CompletionRatio,
		"ModelPrice":       backup.ModelPrice,
		"GroupRatio":       backup.GroupRatio,
		"CacheRatio":       backup.CacheRatio,
		"CreateCacheRatio": backup.CreateCacheRatio,
	}

	for key, value := range updates {
		if value == nil {
			continue
		}
		if err := updateOptionByKey(key, value); err != nil {
			details = append(details, fmt.Sprintf("❌ 恢复 %s 失败: %v", key, err))
		} else {
			details = append(details, fmt.Sprintf("✅ 恢复 %s 成功", key))
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("已从备份 %s 恢复配置", backup.Timestamp),
		"details": details,
	})
}

// Keep unused imports used
var _ = bytes.NewReader
var _ = context.Background
var _ = sort.Slice

package audit

import (
	"encoding/json"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

// ScanResult 扫描结果
type ScanResult struct {
	RiskLevel    int      // 最高风险等级
	RiskCategory string   // 最高风险的规则类型
	RiskTags     []string // 命中的关键词/规则名
	RiskDetail   string   // 详细说明
}

// compiledRule 编译后的规则（缓存正则）
type compiledRule struct {
	Rule     AuditRule
	Patterns []string
	Regexps  []*regexp.Regexp // rule_type=regex 时编译的正则
}

// RuleCache 规则缓存
type RuleCache struct {
	mu       sync.RWMutex
	rules    map[string][]compiledRule // key=group, value=编译后的规则列表
	lastLoad time.Time
	ttl      time.Duration
	db       *gorm.DB
}

var ruleCache *RuleCache

func InitScanner(db *gorm.DB) {
	ruleCache = &RuleCache{
		rules: make(map[string][]compiledRule),
		ttl:   2 * time.Minute, // 规则缓存 2 分钟
		db:    db,
	}
	common.SysLog("审计规则扫描器初始化成功")
}

// getRulesForGroup 获取某个分组的编译后规则（带缓存）
func (rc *RuleCache) getRulesForGroup(group string) []compiledRule {
	rc.mu.RLock()
	if rules, ok := rc.rules[group]; ok && time.Since(rc.lastLoad) < rc.ttl {
		rc.mu.RUnlock()
		return rules
	}
	rc.mu.RUnlock()

	// 缓存过期，重新加载
	rc.mu.Lock()
	defer rc.mu.Unlock()

	// 双重检查
	if rules, ok := rc.rules[group]; ok && time.Since(rc.lastLoad) < rc.ttl {
		return rules
	}

	dbRules, err := GetEnabledRules(rc.db, group)
	if err != nil {
		common.SysError("加载审计规则失败: " + err.Error())
		return nil
	}

	compiled := make([]compiledRule, 0, len(dbRules))
	for _, r := range dbRules {
		cr := compiledRule{Rule: r}

		// 解析 patterns JSON 数组
		var patterns []string
		if err := json.Unmarshal([]byte(r.Patterns), &patterns); err != nil {
			// 尝试当作单个字符串
			patterns = []string{r.Patterns}
		}
		cr.Patterns = patterns

		// 编译正则
		if r.RuleType == "regex" {
			for _, p := range patterns {
				re, err := regexp.Compile(p)
				if err != nil {
					common.SysError("审计规则正则编译失败 (id=" + string(rune(r.Id)) + "): " + err.Error())
					continue
				}
				cr.Regexps = append(cr.Regexps, re)
			}
		}

		compiled = append(compiled, cr)
	}

	rc.rules[group] = compiled
	rc.lastLoad = time.Now()

	return compiled
}

// InvalidateCache 清除规则缓存（规则变更时调用）
func InvalidateCache() {
	if ruleCache == nil {
		return
	}
	ruleCache.mu.Lock()
	defer ruleCache.mu.Unlock()
	ruleCache.rules = make(map[string][]compiledRule)
	ruleCache.lastLoad = time.Time{}
}

// ScanPrompt 扫描提问内容，返回风险结果
func ScanPrompt(group string, prompt string) *ScanResult {
	if ruleCache == nil || prompt == "" {
		return &ScanResult{RiskLevel: 0}
	}

	rules := ruleCache.getRulesForGroup(group)
	if len(rules) == 0 {
		return &ScanResult{RiskLevel: 0}
	}

	result := &ScanResult{RiskLevel: 0}
	promptLower := strings.ToLower(prompt)

	for _, cr := range rules {
		matched := false
		var matchedTag string

		switch cr.Rule.RuleType {
		case "keyword":
			for _, kw := range cr.Patterns {
				if kw == "" {
					continue
				}
				if strings.Contains(promptLower, strings.ToLower(kw)) {
					matched = true
					matchedTag = kw
					break
				}
			}
		case "regex":
			for i, re := range cr.Regexps {
				if re.MatchString(prompt) {
					matched = true
					if i < len(cr.Patterns) {
						matchedTag = cr.Patterns[i]
					}
					break
				}
			}
		}

		if matched {
			result.RiskTags = append(result.RiskTags, cr.Rule.Name+": "+matchedTag)
			if cr.Rule.RiskLevel > result.RiskLevel {
				result.RiskLevel = cr.Rule.RiskLevel
				result.RiskCategory = cr.Rule.Category
				result.RiskDetail = cr.Rule.Description + " (命中: " + matchedTag + ")"
			}
		}
	}

	return result
}

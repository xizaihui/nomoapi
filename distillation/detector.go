package distillation

import (
	"context"
	"fmt"
	"math"
	"strconv"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

const (
	// Redis key 前缀
	keyPrefix         = "distill:"
	keyIntervals      = keyPrefix + "intervals:"      // 请求间隔列表
	keyMaxTokens      = keyPrefix + "max_tokens:"      // max_tokens 值列表
	keyLastReqTime    = keyPrefix + "last_req_time:"   // 上次请求时间戳(ms)
	keyAlertCount     = keyPrefix + "alert_count:"     // 告警累计次数
	keyWhitelist      = keyPrefix + "whitelist"        // 白名单 set

	// 默认配置
	defaultIntervalStdThreshold = 500   // 请求间隔标准差阈值 (ms)
	defaultMaxTokensWindow      = 100   // max_tokens 检测窗口
	defaultIntervalsWindow      = 100   // 间隔检测窗口
	defaultAlertThreshold       = 3     // 累计告警次数后禁用
	defaultTTL                  = 2 * time.Hour // Redis key 过期时间
)

// Config 蒸馏检测配置
type Config struct {
	Enabled              bool  `json:"enabled"`
	IntervalStdThreshold int64 `json:"interval_std_threshold"` // 请求间隔标准差阈值 (ms)
	MaxTokensWindow      int   `json:"max_tokens_window"`      // max_tokens 检测窗口大小
	IntervalsWindow      int   `json:"intervals_window"`       // 间隔检测窗口大小
	AlertThreshold       int   `json:"alert_threshold"`        // 累计告警次数后禁用
}

var (
	config     Config
	configOnce sync.Once
	configMu   sync.RWMutex
)

// GetConfig 获取当前配置
func GetConfig() Config {
	configMu.RLock()
	defer configMu.RUnlock()
	return config
}

// UpdateConfig 更新配置
func UpdateConfig(c Config) {
	configMu.Lock()
	defer configMu.Unlock()
	config = c
}

// InitConfig 从 OptionMap 初始化配置
func InitConfig() {
	configMu.Lock()
	defer configMu.Unlock()

	common.OptionMapRWMutex.RLock()
	enabled := common.OptionMap["DistillationDetectionEnabled"]
	threshold := common.OptionMap["DistillationIntervalStdThreshold"]
	maxTokensWin := common.OptionMap["DistillationMaxTokensWindow"]
	intervalsWin := common.OptionMap["DistillationIntervalsWindow"]
	alertThreshold := common.OptionMap["DistillationAlertThreshold"]
	common.OptionMapRWMutex.RUnlock()

	config.Enabled = enabled == "true"
	
	if v, err := strconv.ParseInt(threshold, 10, 64); err == nil && v > 0 {
		config.IntervalStdThreshold = v
	} else {
		config.IntervalStdThreshold = defaultIntervalStdThreshold
	}

	if v, err := strconv.Atoi(maxTokensWin); err == nil && v > 0 {
		config.MaxTokensWindow = v
	} else {
		config.MaxTokensWindow = defaultMaxTokensWindow
	}

	if v, err := strconv.Atoi(intervalsWin); err == nil && v > 0 {
		config.IntervalsWindow = v
	} else {
		config.IntervalsWindow = defaultIntervalsWindow
	}

	if v, err := strconv.Atoi(alertThreshold); err == nil && v > 0 {
		config.AlertThreshold = v
	} else {
		config.AlertThreshold = defaultAlertThreshold
	}
}

// RecordRequest 记录一次请求的指标到 Redis
func RecordRequest(tokenId int, maxTokens uint) {
	cfg := GetConfig()
	if !cfg.Enabled || !common.RedisEnabled || common.RDB == nil {
		return
	}

	ctx := context.Background()
	tokenKey := strconv.Itoa(tokenId)

	// 检查白名单
	if isWhitelisted(ctx, tokenId) {
		return
	}

	nowMs := time.Now().UnixMilli()

	// 1. 计算并记录请求间隔
	lastTimeKey := keyLastReqTime + tokenKey
	lastTimeStr, err := common.RDB.Get(ctx, lastTimeKey).Result()
	if err == nil {
		lastTime, _ := strconv.ParseInt(lastTimeStr, 10, 64)
		if lastTime > 0 {
			interval := nowMs - lastTime
			intervalsKey := keyIntervals + tokenKey
			common.RDB.RPush(ctx, intervalsKey, interval)
			common.RDB.LTrim(ctx, intervalsKey, -int64(cfg.IntervalsWindow), -1)
			common.RDB.Expire(ctx, intervalsKey, defaultTTL)
		}
	}
	common.RDB.Set(ctx, lastTimeKey, nowMs, defaultTTL)

	// 2. 记录 max_tokens
	maxTokensKey := keyMaxTokens + tokenKey
	common.RDB.RPush(ctx, maxTokensKey, maxTokens)
	common.RDB.LTrim(ctx, maxTokensKey, -int64(cfg.MaxTokensWindow), -1)
	common.RDB.Expire(ctx, maxTokensKey, defaultTTL)
}

// CheckAndAlert 检查是否触发蒸馏告警（异步调用）
func CheckAndAlert(tokenId int, tokenName string, userId int, username string) {
	cfg := GetConfig()
	if !cfg.Enabled || !common.RedisEnabled || common.RDB == nil {
		return
	}

	ctx := context.Background()
	tokenKey := strconv.Itoa(tokenId)

	if isWhitelisted(ctx, tokenId) {
		return
	}

	// 检查指标1：请求间隔标准差
	intervalsUniform := false
	intervalsKey := keyIntervals + tokenKey
	intervals, err := common.RDB.LRange(ctx, intervalsKey, 0, -1).Result()
	if err == nil && len(intervals) >= 20 { // 至少20个样本才检测
		std := calcStdDev(intervals)
		if std >= 0 && std < float64(cfg.IntervalStdThreshold) {
			intervalsUniform = true
		}
	}

	// 检查指标2：max_tokens 完全一致
	maxTokensFixed := false
	maxTokensKey := keyMaxTokens + tokenKey
	maxTokensList, err := common.RDB.LRange(ctx, maxTokensKey, 0, -1).Result()
	if err == nil && len(maxTokensList) >= 20 { // 至少20个样本才检测
		maxTokensFixed = isAllSame(maxTokensList)
	}

	// 两个指标都触发才算告警
	if intervalsUniform && maxTokensFixed {
		alertKey := keyAlertCount + tokenKey
		count, _ := common.RDB.Incr(ctx, alertKey).Result()
		common.RDB.Expire(ctx, alertKey, 24*time.Hour)

		common.SysLog(fmt.Sprintf(
			"[蒸馏检测] 告警 #%d: token_id=%d token_name=%s user_id=%d username=%s 间隔标准差=%.1fms max_tokens全部一致=%v",
			count, tokenId, tokenName, userId, username, calcStdDev(intervals), maxTokensFixed,
		))

		if int(count) >= cfg.AlertThreshold {
			// 禁用 token
			err := model.DisableTokenById(tokenId)
			if err != nil {
				common.SysError(fmt.Sprintf(
					"[蒸馏检测] 禁用 token 失败: token_id=%d err=%v", tokenId, err,
				))
			} else {
				common.SysLog(fmt.Sprintf(
					"[蒸馏检测] 已禁用 token: token_id=%d token_name=%s user_id=%d username=%s 原因=蒸馏检测累计%d次告警",
					tokenId, tokenName, userId, username, count,
				))
				// 重置计数器
				common.RDB.Del(ctx, alertKey)
			}
		}
	}
}

// AddWhitelist 添加 token 到白名单
func AddWhitelist(tokenId int) error {
	if !common.RedisEnabled || common.RDB == nil {
		return fmt.Errorf("Redis not enabled")
	}
	ctx := context.Background()
	return common.RDB.SAdd(ctx, keyWhitelist, tokenId).Err()
}

// RemoveWhitelist 从白名单移除 token
func RemoveWhitelist(tokenId int) error {
	if !common.RedisEnabled || common.RDB == nil {
		return fmt.Errorf("Redis not enabled")
	}
	ctx := context.Background()
	return common.RDB.SRem(ctx, keyWhitelist, tokenId).Err()
}

// GetWhitelist 获取白名单
func GetWhitelist() ([]int, error) {
	if !common.RedisEnabled || common.RDB == nil {
		return nil, fmt.Errorf("Redis not enabled")
	}
	ctx := context.Background()
	members, err := common.RDB.SMembers(ctx, keyWhitelist).Result()
	if err != nil {
		return nil, err
	}
	var ids []int
	for _, m := range members {
		if id, err := strconv.Atoi(m); err == nil {
			ids = append(ids, id)
		}
	}
	return ids, nil
}

// isWhitelisted 检查 token 是否在白名单
func isWhitelisted(ctx context.Context, tokenId int) bool {
	ok, err := common.RDB.SIsMember(ctx, keyWhitelist, tokenId).Result()
	return err == nil && ok
}

// calcStdDev 计算标准差
func calcStdDev(values []string) float64 {
	if len(values) < 2 {
		return -1
	}
	var nums []float64
	var sum float64
	for _, v := range values {
		n, err := strconv.ParseFloat(v, 64)
		if err != nil {
			continue
		}
		nums = append(nums, n)
		sum += n
	}
	if len(nums) < 2 {
		return -1
	}
	mean := sum / float64(len(nums))
	var variance float64
	for _, n := range nums {
		diff := n - mean
		variance += diff * diff
	}
	variance /= float64(len(nums) - 1)
	return math.Sqrt(variance)
}

// isAllSame 检查列表中所有值是否相同
func isAllSame(values []string) bool {
	if len(values) == 0 {
		return false
	}
	first := values[0]
	for _, v := range values[1:] {
		if v != first {
			return false
		}
	}
	return true
}

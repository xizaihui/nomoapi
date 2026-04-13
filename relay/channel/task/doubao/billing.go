package doubao

import (
	"fmt"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

// seedanceTokenPrice 存储 Seedance 系列模型的真实 token 单价（USD / 1M tokens）。
// 这些价格不放在 DB ModelPrice 里，因为 ModelPrice 会影响预扣额度。
// 我们希望预扣保持最小（默认 $0.001），完成后按实际 token 数和此处的真实价格结算。
var seedanceTokenPrice = map[string]float64{
	"T0101006": 6.735, // doubao-seedance-2-0-260128: $6.735 / 1M tokens
}

// getActualModelPrice 获取模型的真实 token 单价。
// 优先查本地 seedanceTokenPrice 表，其次查 DB ModelPrice（ratio_setting），
// 最后从 BillingContext 读取。
func getActualModelPrice(modelName string, bcPrice float64) float64 {
	// 1. 本地硬编码价格（优先级最高）
	if p, ok := seedanceTokenPrice[modelName]; ok && p > 0 {
		return p
	}
	// 2. DB ModelPrice
	if p, ok := ratio_setting.GetModelPrice(modelName, false); ok && p > 0 {
		return p
	}
	// 3. BillingContext 快照
	if bcPrice > 0 {
		return bcPrice
	}
	return 0
}

// AdjustBillingOnComplete 覆盖 BaseBilling 默认实现：
// 基于上游返回的 completion_tokens/total_tokens 重新计算最终额度。
//
// 语义约定：
//   - 模型真实价格以 USD / 1M tokens 为单位（存储在 seedanceTokenPrice 或 DB ModelPrice）
//   - 若 BillingContext.OtherRatios 里存在 "ref_video" key，说明请求含参考视频，乘以对应折扣
//   - 若上游未返回 token 数，返回 0 表示保持预扣额度
//
// 计算公式：
//   quota = actualPrice × (tokens / 1_000_000) × GroupRatio × otherRatio × QuotaPerUnit
func (a *TaskAdaptor) AdjustBillingOnComplete(task *model.Task, taskResult *relaycommon.TaskInfo) int {
	if task == nil || taskResult == nil {
		return 0
	}
	tokens := taskResult.CompletionTokens
	if tokens <= 0 {
		tokens = taskResult.TotalTokens
	}
	if tokens <= 0 {
		return 0
	}
	bc := task.PrivateData.BillingContext
	if bc == nil {
		return 0
	}

	modelName := bc.OriginModelName
	if modelName == "" {
		modelName = task.Properties.OriginModelName
	}

	modelPrice := getActualModelPrice(modelName, bc.ModelPrice)
	if modelPrice <= 0 {
		return 0
	}

	groupRatio := bc.GroupRatio
	if groupRatio <= 0 {
		groupRatio = 1
	}
	otherRatio := 1.0
	if r, ok := bc.OtherRatios["ref_video"]; ok && r > 0 {
		otherRatio = r
	}
	usd := modelPrice * float64(tokens) / 1_000_000.0
	quota := int(usd * groupRatio * otherRatio * common.QuotaPerUnit)

	// 将真实价格回写到 BillingContext，供日志 other 字段展示（覆盖 fallback 的 $0.001）
	bc.ModelPrice = modelPrice

	common.SysLog(fmt.Sprintf("[doubao] AdjustBillingOnComplete task=%s model=%s tokens=%d price=%.4f group=%.2f other=%.2f -> quota=%d",
		task.TaskID, modelName, tokens, modelPrice, groupRatio, otherRatio, quota))
	if quota <= 0 {
		return 0
	}
	return quota
}

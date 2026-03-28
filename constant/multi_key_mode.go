package constant

type MultiKeyMode string

const (
	MultiKeyModeRandom  MultiKeyMode = "random"  // 随机
	MultiKeyModePolling MultiKeyMode = "polling" // 轮询
	MultiKeyModeHash    MultiKeyMode = "hash"    // 哈希亲和（按 token_id 固定分配 key，提高上游缓存命中率）
)

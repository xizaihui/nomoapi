package audit

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
)

// AuditLog ES 文档结构
type AuditLog struct {
	RequestId    string   `json:"request_id"`
	UserId       int      `json:"user_id"`
	Username     string   `json:"username"`
	Group        string   `json:"group"`
	TokenId      int      `json:"token_id"`
	TokenName    string   `json:"token_name"`
	ModelName    string   `json:"model_name"`
	Prompt       string   `json:"prompt"`
	Ip           string   `json:"ip"`
	IsStream     bool     `json:"is_stream"`
	RiskLevel    int      `json:"risk_level"`     // 0=正常 1=可疑 2=危险 3=高危
	RiskCategory string   `json:"risk_category"`  // 匹配的规则类型
	RiskTags     []string `json:"risk_tags"`      // 命中的关键词
	RiskDetail   string   `json:"risk_detail"`
	Reviewed     bool     `json:"reviewed"`
	ReviewedBy   string   `json:"reviewed_by"`
	ReviewedAt   int64    `json:"reviewed_at"`
	ReviewNote   string   `json:"review_note"`
	CreatedAt    int64    `json:"created_at"`
}

// ESClient Elasticsearch 客户端
type ESClient struct {
	baseURL    string
	httpClient *http.Client
	enabled    bool
	mu         sync.RWMutex
}

var esClient *ESClient

func InitES(baseURL string) error {
	if baseURL == "" {
		common.SysLog("ES_URL 未配置，审计日志将不会写入 Elasticsearch")
		esClient = &ESClient{enabled: false}
		return nil
	}

	esClient = &ESClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		enabled: true,
	}

	// 异步初始化 ES 连接（等待 ES 启动）
	go func() {
		for i := 0; i < 30; i++ {
			time.Sleep(5 * time.Second)
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			req, err := http.NewRequestWithContext(ctx, "GET", baseURL, nil)
			if err != nil {
				cancel()
				continue
			}
			resp, err := esClient.httpClient.Do(req)
			cancel()
			if err != nil {
				if i%6 == 0 { // 每 30 秒打印一次
					common.SysLog("等待 Elasticsearch 启动... (" + err.Error() + ")")
				}
				continue
			}
			resp.Body.Close()
			common.SysLog("Elasticsearch 连接成功: " + baseURL)

			if err := ensureIndexTemplate(); err != nil {
				common.SysError("ES 索引模板创建失败: " + err.Error())
			}
			return
		}
		common.SysError("Elasticsearch 连接超时（150秒），审计日志暂不可用")
	}()

	return nil
}

func GetESClient() *ESClient {
	return esClient
}

func IsESEnabled() bool {
	if esClient == nil {
		return false
	}
	esClient.mu.RLock()
	defer esClient.mu.RUnlock()
	return esClient.enabled
}

// ensureIndexTemplate 创建索引模板，按月自动创建索引
func ensureIndexTemplate() error {
	template := map[string]interface{}{
		"index_patterns": []string{"audit-logs-*"},
		"template": map[string]interface{}{
			"settings": map[string]interface{}{
				"number_of_shards":   1,
				"number_of_replicas": 0,
				"refresh_interval":   "5s",
			},
			"mappings": map[string]interface{}{
				"properties": map[string]interface{}{
					"request_id":    map[string]string{"type": "keyword"},
					"user_id":       map[string]string{"type": "integer"},
					"username":      map[string]string{"type": "keyword"},
					"group":         map[string]string{"type": "keyword"},
					"token_id":      map[string]string{"type": "integer"},
					"token_name":    map[string]string{"type": "keyword"},
					"model_name":    map[string]string{"type": "keyword"},
					"prompt":        map[string]string{"type": "text"},
					"ip":            map[string]string{"type": "keyword"},
					"is_stream":     map[string]string{"type": "boolean"},
					"risk_level":    map[string]string{"type": "integer"},
					"risk_category": map[string]string{"type": "keyword"},
					"risk_tags":     map[string]string{"type": "keyword"},
					"risk_detail":   map[string]string{"type": "text"},
					"reviewed":      map[string]string{"type": "boolean"},
					"reviewed_by":   map[string]string{"type": "keyword"},
					"reviewed_at":   map[string]string{"type": "long"},
					"review_note":   map[string]string{"type": "text"},
					"created_at":    map[string]string{"type": "long"},
				},
			},
		},
	}

	body, _ := json.Marshal(template)
	req, err := http.NewRequest("PUT", esClient.baseURL+"/_index_template/audit-logs-template", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := esClient.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("创建 ES 索引模板失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("创建 ES 索引模板失败 (%d): %s", resp.StatusCode, string(respBody))
	}

	common.SysLog("ES 索引模板 audit-logs-template 创建成功")
	return nil
}

// getIndexName 按月分索引
func getIndexName() string {
	return fmt.Sprintf("audit-logs-%s", time.Now().Format("2006.01"))
}

// IndexAuditLog 写入审计日志到 ES
func IndexAuditLog(log *AuditLog) error {
	if !IsESEnabled() {
		return nil
	}

	log.CreatedAt = time.Now().Unix()

	body, err := json.Marshal(log)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", esClient.baseURL+"/"+getIndexName()+"/_doc", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := esClient.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("ES 写入失败 (%d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// SearchAuditLogs 查询审计日志
type SearchParams struct {
	Page         int    `json:"page"`
	PageSize     int    `json:"page_size"`
	Username     string `json:"username"`
	TokenName    string `json:"token_name"`
	Group        string `json:"group"`
	UserId       int    `json:"user_id"`
	RiskLevel    *int   `json:"risk_level"`
	RiskCategory string `json:"risk_category"`
	Keyword      string `json:"keyword"`
	StartTime    int64  `json:"start_time"`
	EndTime      int64  `json:"end_time"`
	Reviewed     *bool  `json:"reviewed"`
}

type SearchResult struct {
	Total int64      `json:"total"`
	Logs  []AuditLog `json:"logs"`
}

func SearchAuditLogs(params SearchParams) (*SearchResult, error) {
	if !IsESEnabled() {
		return &SearchResult{}, nil
	}

	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 || params.PageSize > 100 {
		params.PageSize = 20
	}

	// 构建 ES 查询
	must := []map[string]interface{}{}

	if params.Username != "" {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"username": params.Username}})
	}
	if params.TokenName != "" {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"token_name": params.TokenName}})
	}
	if params.Group != "" {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"group": params.Group}})
	}
	if params.UserId > 0 {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"user_id": params.UserId}})
	}
	if params.RiskLevel != nil {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"risk_level": *params.RiskLevel}})
	}
	if params.RiskCategory != "" {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"risk_category": params.RiskCategory}})
	}
	if params.Keyword != "" {
		must = append(must, map[string]interface{}{"match": map[string]interface{}{"prompt": params.Keyword}})
	}
	if params.Reviewed != nil {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"reviewed": *params.Reviewed}})
	}
	if params.StartTime > 0 || params.EndTime > 0 {
		rangeQ := map[string]interface{}{}
		if params.StartTime > 0 {
			rangeQ["gte"] = params.StartTime
		}
		if params.EndTime > 0 {
			rangeQ["lte"] = params.EndTime
		}
		must = append(must, map[string]interface{}{"range": map[string]interface{}{"created_at": rangeQ}})
	}

	query := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": must,
			},
		},
		"sort": []map[string]interface{}{
			{"created_at": map[string]string{"order": "desc"}},
		},
		"from": (params.Page - 1) * params.PageSize,
		"size": params.PageSize,
	}

	if len(must) == 0 {
		query["query"] = map[string]interface{}{"match_all": map[string]interface{}{}}
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

	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("ES 查询失败 (%d): %s", resp.StatusCode, string(respBody))
	}

	// 解析 ES 响应
	var esResp struct {
		Hits struct {
			Total struct {
				Value int64 `json:"value"`
			} `json:"total"`
			Hits []struct {
				ID     string   `json:"_id"`
				Source AuditLog `json:"_source"`
			} `json:"hits"`
		} `json:"hits"`
	}

	if err := json.Unmarshal(respBody, &esResp); err != nil {
		return nil, err
	}

	logs := make([]AuditLog, len(esResp.Hits.Hits))
	for i, hit := range esResp.Hits.Hits {
		logs[i] = hit.Source
	}

	return &SearchResult{
		Total: esResp.Hits.Total.Value,
		Logs:  logs,
	}, nil
}

// GetAuditStats 获取审计统计
type AuditStats struct {
	Total     int64            `json:"total"`
	ByLevel   map[string]int64 `json:"by_level"`
	ByCategory map[string]int64 `json:"by_category"`
}

func GetAuditStats(group string, userId int, startTime, endTime int64) (*AuditStats, error) {
	if !IsESEnabled() {
		return &AuditStats{ByLevel: map[string]int64{}, ByCategory: map[string]int64{}}, nil
	}

	must := []map[string]interface{}{}
	if group != "" {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"group": group}})
	}
	if userId > 0 {
		must = append(must, map[string]interface{}{"term": map[string]interface{}{"user_id": userId}})
	}
	if startTime > 0 || endTime > 0 {
		rangeQ := map[string]interface{}{}
		if startTime > 0 {
			rangeQ["gte"] = startTime
		}
		if endTime > 0 {
			rangeQ["lte"] = endTime
		}
		must = append(must, map[string]interface{}{"range": map[string]interface{}{"created_at": rangeQ}})
	}

	queryPart := map[string]interface{}{"match_all": map[string]interface{}{}}
	if len(must) > 0 {
		queryPart = map[string]interface{}{"bool": map[string]interface{}{"must": must}}
	}

	query := map[string]interface{}{
		"size": 0,
		"query": queryPart,
		"aggs": map[string]interface{}{
			"by_level": map[string]interface{}{
				"terms": map[string]interface{}{"field": "risk_level"},
			},
			"by_category": map[string]interface{}{
				"terms": map[string]interface{}{"field": "risk_category", "missing": "normal"},
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
		Hits struct {
			Total struct {
				Value int64 `json:"value"`
			} `json:"total"`
		} `json:"hits"`
		Aggregations struct {
			ByLevel struct {
				Buckets []struct {
					Key      interface{} `json:"key"`
					DocCount int64       `json:"doc_count"`
				} `json:"buckets"`
			} `json:"by_level"`
			ByCategory struct {
				Buckets []struct {
					Key      string `json:"key"`
					DocCount int64  `json:"doc_count"`
				} `json:"buckets"`
			} `json:"by_category"`
		} `json:"aggregations"`
	}

	if err := json.Unmarshal(respBody, &esResp); err != nil {
		return nil, err
	}

	stats := &AuditStats{
		Total:      esResp.Hits.Total.Value,
		ByLevel:    map[string]int64{},
		ByCategory: map[string]int64{},
	}
	for _, b := range esResp.Aggregations.ByLevel.Buckets {
		stats.ByLevel[fmt.Sprintf("%v", b.Key)] = b.DocCount
	}
	for _, b := range esResp.Aggregations.ByCategory.Buckets {
		stats.ByCategory[b.Key] = b.DocCount
	}

	return stats, nil
}

// UpdateAuditLogReview 更新审计日志的审阅状态
func UpdateAuditLogReview(requestId string, reviewedBy string, reviewNote string) error {
	if !IsESEnabled() {
		return nil
	}

	// 先搜索找到文档
	query := map[string]interface{}{
		"script": map[string]interface{}{
			"source": "ctx._source.reviewed = true; ctx._source.reviewed_by = params.by; ctx._source.reviewed_at = params.at; ctx._source.review_note = params.note",
			"params": map[string]interface{}{
				"by":   reviewedBy,
				"at":   time.Now().Unix(),
				"note": reviewNote,
			},
		},
		"query": map[string]interface{}{
			"term": map[string]interface{}{"request_id": requestId},
		},
	}

	body, _ := json.Marshal(query)
	req, err := http.NewRequest("POST", esClient.baseURL+"/audit-logs-*/_update_by_query", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := esClient.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("ES 更新失败 (%d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}

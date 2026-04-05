#!/bin/bash
# 蒸馏检测测试脚本
# 模拟蒸馏特征：固定 max_tokens=4096 + 均匀间隔(200ms) 连续发送
#
# 用法: ./test_distillation.sh [请求次数] [API地址]
# 默认: 25次, http://localhost:3000

COUNT=${1:-25}
BASE_URL=${2:-"http://localhost:3000"}
API_KEY="sk-WIFIiVSmpOCuAyj572OPv6jcI20HlmOVxb1Uj38ivqBUCfwS"

echo "🧪 蒸馏检测测试"
echo "  目标: $BASE_URL"
echo "  请求数: $COUNT"
echo "  特征: max_tokens=4096 固定, 间隔=200ms 均匀"
echo "  预期: 20次后开始检测, 两个指标同时触发 → 告警"
echo ""
echo "开始发送..."

for i in $(seq 1 $COUNT); do
  RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d '{
      "model": "claude-sonnet-4-5-20250929",
      "max_tokens": 4096,
      "messages": [{"role": "user", "content": "Say hi"}],
      "stream": false
    }' 2>&1)
  
  HTTP_CODE=$(echo "$RESP" | tail -1)
  echo "[$i/$COUNT] HTTP $HTTP_CODE"
  
  # 均匀间隔 200ms（蒸馏特征：标准差极低）
  sleep 0.2
done

echo ""
echo "✅ 发送完毕！"
echo ""
echo "检查告警:"
echo "  1. 看 docker logs: docker logs new-api 2>&1 | grep '蒸馏检测'"
echo "  2. 看 Redis 计数: docker exec redis redis-cli keys 'distill:*'"
echo "  3. 看 API: curl $BASE_URL/api/distillation/alerts"

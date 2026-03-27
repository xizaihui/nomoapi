#!/bin/bash
# deploy.sh — 安全部署脚本（本机构建 + 远程部署）
# 用法:
#   ./scripts/deploy.sh              # 部署到所有环境
#   ./scripts/deploy.sh local        # 仅本地
#   ./scripts/deploy.sh test         # 仅测试
#   ./scripts/deploy.sh prod         # 仅生产
#   ./scripts/deploy.sh test prod    # 测试+生产

set -euo pipefail

# ==================== 配置 ====================
LOCAL_PROJECT="/opt/apps/newapis"
REMOTE_PROJECT="/opt/apps/opentoken"
DOCKER_IMAGE="newapi-aurora:latest"

TEST_HOST="154.36.173.198"
PROD_HOST="38.58.59.161"
SSH_PASS="Adm@xz527"

# ==================== 颜色 ====================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
fail()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ==================== SSH 辅助 ====================
remote_ssh() {
  local host=$1; shift
  sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15 "root@$host" "$@"
}

remote_scp() {
  sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no "$@"
}

# ==================== 本地构建 ====================
build_frontend() {
  info "清理旧构建产物..."
  cd "$LOCAL_PROJECT/web"
  rm -rf dist node_modules/.vite

  info "构建前端 (bun run build)..."
  export PATH="$HOME/.bun/bin:$PATH"
  NODE_OPTIONS="--max-old-space-size=4096" bun run build 2>&1 | tail -5

  if [ ! -f "dist/index.html" ]; then
    fail "前端构建失败: dist/index.html 不存在"
  fi

  local css_hash=$(ls dist/assets/index-*.css 2>/dev/null | head -1)
  info "前端构建成功: $(basename "$css_hash")"
}

build_local_docker() {
  info "构建本地 Docker 镜像..."
  cd "$LOCAL_PROJECT"

  if ! docker build --no-cache -t "$DOCKER_IMAGE" . 2>&1 | tee /tmp/docker-build-local.log | tail -3; then
    fail "本地 Docker 构建失败! 日志: /tmp/docker-build-local.log"
  fi

  info "本地 Docker 镜像构建成功"
}

deploy_local() {
  info "========== 部署本地环境 =========="
  build_local_docker

  cd "$LOCAL_PROJECT"
  docker compose up -d --force-recreate --no-deps new-api 2>&1 | tail -3

  sleep 8
  local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://localhost:3000/api/status)
  if [ "$status" = "200" ]; then
    info "本地部署成功 ✅ (HTTP $status)"
  else
    fail "本地部署异常! HTTP $status"
  fi
}

# ==================== 远程部署 ====================
deploy_remote() {
  local name=$1
  local host=$2
  local extra_build_args="${3:-}"

  info "========== 部署${name}环境 ($host) =========="

  # 1. 打包 dist
  cd "$LOCAL_PROJECT/web"
  tar czf /tmp/dist.tar.gz dist/
  info "dist 打包完成 ($(du -h /tmp/dist.tar.gz | cut -f1))"

  # 2. SCP 到远程
  info "传输 dist 到 $host..."
  remote_scp /tmp/dist.tar.gz "root@$host:/tmp/dist.tar.gz"

  # 3. 远程: git pull + 替换 dist + docker build + 验证
  info "远程构建部署..."
  local extra_build="$extra_build_args"
  remote_ssh "$host" "bash -c 'set -eo pipefail; EXTRA_BUILD=\"$extra_build\"; cd /opt/apps/opentoken; echo \"[1/5] Git pull...\"; git fetch --all 2>&1 | tail -2; git pull origin feat/shadcn-ui 2>&1 | tail -3; echo \"[2/5] 替换 dist...\"; rm -rf web/dist; tar xzf /tmp/dist.tar.gz -C web/; rm -f /tmp/dist.tar.gz; echo \"[3/5] Docker build...\"; if ! docker build --no-cache \$EXTRA_BUILD -t newapi-aurora:latest . 2>&1 | tee /tmp/docker-build.log | tail -5; then echo \"[✗] Docker 构建失败!\"; exit 1; fi; echo \"[4/5] 重启容器...\"; docker compose up -d --force-recreate --no-deps new-api 2>&1 | tail -3; echo \"[5/5] 健康检查...\"; for i in 1 2 3 4 5 6; do sleep 5; STATUS=\$(curl -s -o /dev/null -w \"%{http_code}\" --connect-timeout 5 http://localhost:3000/api/status 2>/dev/null || echo \"000\"); if [ \"\$STATUS\" = \"200\" ]; then echo \"[✓] 部署成功 (HTTP 200)\"; exit 0; fi; echo \"  等待启动... (\$i/6, HTTP \$STATUS)\"; done; echo \"[✗] 健康检查超时\"; docker logs --tail 20 new-api 2>&1; exit 1'"

  if [ $? -eq 0 ]; then
    info "${name}部署成功 ✅"
  else
    fail "${name}部署失败!"
  fi
}

deploy_test() {
  deploy_remote "测试" "$TEST_HOST" "--network=host"
}

deploy_prod() {
  deploy_remote "生产" "$PROD_HOST" ""
}

# ==================== 主流程 ====================
main() {
  local targets=("$@")

  # 默认全部
  if [ ${#targets[@]} -eq 0 ]; then
    targets=("local" "test" "prod")
  fi

  local commit=$(cd "$LOCAL_PROJECT" && git log --oneline -1)
  info "当前 commit: $commit"
  echo ""

  # 前端只构建一次
  local need_build=false
  for t in "${targets[@]}"; do
    case "$t" in local|test|prod) need_build=true ;; esac
  done

  if $need_build; then
    build_frontend
    echo ""
  fi

  # 逐个部署
  for t in "${targets[@]}"; do
    case "$t" in
      local) deploy_local ;;
      test)  deploy_test ;;
      prod)  deploy_prod ;;
      *) warn "未知目标: $t (可选: local/test/prod)" ;;
    esac
    echo ""
  done

  info "🎉 全部完成!"
}

main "$@"

#!/bin/bash
# ============================================================
# NomoAPI 上游同步脚本
# 同步 QuantumNous/new-api 的更新，保留自定义 UI
# ============================================================

set -e

APP_DIR="/opt/apps/newapis"
UPSTREAM_REMOTE="origin"
UPSTREAM_BRANCH="main"
LOCAL_BRANCH="feat/shadcn-ui"
DOCKER_IMAGE="newapi-aurora:latest"
BUN_PATH="$HOME/.bun/bin"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[同步]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

cd "$APP_DIR" || { err "目录不存在: $APP_DIR"; exit 1; }

# ---- 1. 检查工作区是否干净 ----
log "检查工作区状态..."
if [ -n "$(git status --porcelain)" ]; then
  warn "工作区有未提交的更改，先自动提交..."
  git add -A
  git commit -m "auto: 同步前保存本地更改 $(date +%Y%m%d-%H%M%S)"
  ok "本地更改已提交"
fi

# ---- 2. 确保在正确的分支 ----
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "$LOCAL_BRANCH" ]; then
  log "切换到 $LOCAL_BRANCH..."
  git checkout "$LOCAL_BRANCH"
fi

# ---- 3. 拉取上游更新 ----
log "拉取上游 $UPSTREAM_REMOTE/$UPSTREAM_BRANCH..."
git fetch "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH"

# 检查是否有新提交
LOCAL_HEAD=$(git rev-parse HEAD)
UPSTREAM_HEAD=$(git rev-parse "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH")
MERGE_BASE=$(git merge-base HEAD "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH")

if [ "$MERGE_BASE" = "$UPSTREAM_HEAD" ]; then
  ok "已经是最新的，无需同步"
  exit 0
fi

NEW_COMMITS=$(git log --oneline "$MERGE_BASE..$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" | wc -l)
log "发现 ${NEW_COMMITS} 个新提交"

# ---- 4. 合并上游（保留我们的修改优先） ----
log "合并上游更新..."
if git merge "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" --no-edit 2>/dev/null; then
  ok "合并成功，无冲突"
else
  warn "合并有冲突，尝试自动解决..."

  # 我们修改过的文件列表 — 冲突时保留我们的版本
  OUR_FILES=(
    "web/src/components/compat/"
    "web/src/components/ui/"
    "web/src/components/layout/"
    "web/src/lib/utils.js"
    "web/src/index.css"
    "web/vite.config.js"
    "web/tailwind.config.js"
    "web/components.json"
    "web/postcss.config.js"
  )

  CONFLICT_FILES=$(git diff --name-only --diff-filter=U)
  AUTO_RESOLVED=0
  MANUAL_NEEDED=0

  for file in $CONFLICT_FILES; do
    KEEP_OURS=false
    for pattern in "${OUR_FILES[@]}"; do
      if [[ "$file" == $pattern* ]]; then
        KEEP_OURS=true
        break
      fi
    done

    if $KEEP_OURS; then
      git checkout --ours "$file"
      git add "$file"
      ((AUTO_RESOLVED++))
    else
      # 检查是否只是 semi-icons import 冲突
      if grep -q "semi-icons\|semi-ui" "$file" 2>/dev/null && grep -q "compat/icons" "$file" 2>/dev/null; then
        git checkout --ours "$file"
        git add "$file"
        ((AUTO_RESOLVED++))
      else
        ((MANUAL_NEEDED++))
      fi
    fi
  done

  if [ "$MANUAL_NEEDED" -gt 0 ]; then
    err "还有 $MANUAL_NEEDED 个文件需要手动解决冲突："
    git diff --name-only --diff-filter=U
    echo ""
    err "请手动解决后运行: git add -A && git commit"
    err "然后重新运行此脚本完成构建部署"
    exit 1
  fi

  git commit --no-edit
  ok "所有冲突已自动解决 ($AUTO_RESOLVED 个文件)"
fi

# ---- 5. 检查新的 Semi 组件 ----
log "检查上游是否引入了新的 Semi 组件..."
NEW_SEMI=$(git diff "$LOCAL_HEAD..HEAD" --name-only | xargs grep -l "from '@douyinfe/semi-ui'" 2>/dev/null | grep -v node_modules | grep -v compat/ || true)

if [ -n "$NEW_SEMI" ]; then
  warn "以下文件引入了 Semi 组件（会通过 compat 层自动处理）："
  echo "$NEW_SEMI"

  # 检查是否有新的未映射组件
  NEW_COMPONENTS=$(git diff "$LOCAL_HEAD..HEAD" --name-only | xargs grep -oh "import {[^}]*} from '@douyinfe/semi-ui'" 2>/dev/null | grep -oh '[A-Z][a-zA-Z]*' | sort -u || true)
  COMPAT_EXPORTS=$(grep "^export" web/src/components/compat/index.js | grep -oh '[A-Z][a-zA-Z]*' | sort -u)

  MISSING=""
  for comp in $NEW_COMPONENTS; do
    if ! echo "$COMPAT_EXPORTS" | grep -q "^${comp}$"; then
      MISSING="$MISSING $comp"
    fi
  done

  if [ -n "$MISSING" ]; then
    warn "以下 Semi 组件在 compat 层中缺失，可能需要添加 wrapper："
    echo " $MISSING"
  fi
fi

# ---- 6. 检查新的 Semi Icons ----
NEW_ICONS=$(git diff "$LOCAL_HEAD..HEAD" --name-only | xargs grep -oh "Icon[A-Z][a-zA-Z]*" 2>/dev/null | sort -u || true)
MAPPED_ICONS=$(grep "export const" web/src/components/compat/icons.js | grep -oh "Icon[A-Z][a-zA-Z]*" | sort -u)

MISSING_ICONS=""
for icon in $NEW_ICONS; do
  if ! echo "$MAPPED_ICONS" | grep -q "^${icon}$"; then
    MISSING_ICONS="$MISSING_ICONS $icon"
  fi
done

if [ -n "$MISSING_ICONS" ]; then
  warn "以下 Semi Icons 需要在 icons.js 中添加映射："
  echo " $MISSING_ICONS"
fi

# ---- 7. 修复新文件的 semi-icons 导入 ----
log "修复新文件的 semi-icons 导入..."
FIXED=0
for file in $(git diff "$LOCAL_HEAD..HEAD" --name-only | grep -E '\.(jsx|js)$' | grep -v node_modules | grep -v compat/); do
  if [ -f "$file" ] && grep -q "from '@douyinfe/semi-icons'" "$file"; then
    sed -i "s|from '@douyinfe/semi-icons'|from '@/components/compat/icons'|g" "$file"
    ((FIXED++))
  fi
done
if [ "$FIXED" -gt 0 ]; then
  git add -A
  git commit -m "auto: 修复 $FIXED 个文件的 semi-icons 导入"
  ok "修复了 $FIXED 个文件的 semi-icons 导入"
fi

# ---- 8. 构建 ----
log "开始构建前端..."
export PATH="$BUN_PATH:$PATH"
cd "$APP_DIR/web"
NODE_OPTIONS="--max-old-space-size=4096" bun run build
ok "前端构建成功"

# ---- 9. Docker 构建 ----
cd "$APP_DIR"
log "构建 Docker 镜像..."
docker build --no-cache -t "$DOCKER_IMAGE" .
ok "Docker 镜像构建成功"

# ---- 10. 部署 ----
log "重新部署..."
docker compose down
docker compose up -d
ok "部署完成"

# ---- 11. 推送到 GitHub ----
read -p "是否推送到 GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push nomoapi "$LOCAL_BRANCH:main" --force
  ok "已推送到 GitHub"
fi

echo ""
ok "========================================="
ok "  同步完成！"
ok "  上游提交: $NEW_COMMITS 个"
ok "  访问: http://$(hostname -I | awk '{print $1}'):3000"
ok "========================================="

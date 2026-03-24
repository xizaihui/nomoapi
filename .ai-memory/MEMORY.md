# MEMORY.md — 长期记忆

> 每次新会话我会自动读这个文件，立刻知道所有项目状态。

---

## 🔑 核心项目：OpenToken (New API)

### 快速恢复
**一句话唤醒**: "继续 OpenToken" 或 "看看 newapi.md"
**项目状态文件**: `/opt/apps/newapis/newapi.md` ← **最完整的项目追踪文档，必读**
**上次更新**: 2026-03-24，commit `20baf1bf`

### 项目概要
- Go + React 全栈 Web 应用，API 管理平台
- 前端从 Semi UI 迁移到 shadcn/ui（通过 compat 兼容层，31个包装器）
- 包含安全审计系统 (Go + Elasticsearch 8.15.0)、多语言 i18n (7语言)、暗色模式
- 品牌: OpenToken (原 Aurora → 原 New API)
- Docker 镜像: `newapi-aurora:latest` (alpine, ~108MB)

### 三环境
| 环境 | 地址 | 部署方式 | 当前版本 |
|------|------|----------|----------|
| 开发 | 154.40.40.48:3000 | 本机 Docker | `20baf1bf` |
| 测试 | 154.36.173.198 (api.opentokens.net) | SSH deploy | `9c5e03fe` |
| 生产 | 38.58.59.161 (api.opentoken.io) | SSH deploy | `9c5e03fe` |

### 关键路径
- 项目: `/opt/apps/newapis` (本机), `/opt/apps/opentoken` (远程)
- 前端: `/opt/apps/newapis/web`
- 分支: `feat/shadcn-ui` (开发) / `main` (合并后)
- Git remotes: `nomoapi` + `opentoken` (GitHub: xizaihui/)
- 服务器密码: `***REDACTED***` (生产+测试)

### 部署流程
```
# 推荐用一键脚本:
./scripts/deploy.sh              # 全部三环境
./scripts/deploy.sh prod         # 仅生产
./scripts/deploy.sh test prod    # 测试+生产

# 手动部署:
rm -rf dist node_modules/.vite → bun run build → docker build --no-cache →
docker compose up -d --force-recreate --no-deps new-api
```
- **必须先 rm -rf dist 再 build，否则旧文件混入**
- **远程部署必须先 git pull 再 docker build**（Go embed 用工作树的 dist）
- 测试服务器 Docker 需要 `--network=host`
- deploy.sh 已固化以上所有要求，build 失败不重启容器

### 当前设计风格
- 黑白灰基调 + 钢蓝(hue 215)点缀
- Light primary: `hsl(215 25% 32%)` — **最终确定，用户否决过高饱和蓝 #3b82f6**
- Dark primary: `hsl(215 18% 68%)` ≈ `#9db0c0`
- 高端、现代、稳重、极简 — 禁止 AI 渐变、鲜艳彩色
- 视觉优化方向: 对比度/字重/阴影/间距，不要换主色

### 已完成核心里程碑
- ✅ Semi UI → shadcn/ui 迁移 (Phase 0-7)
- ✅ 安全审计模块 v1 (Go + ES + 前端)
- ✅ UI 差异化 + OpenToken 品牌重塑
- ✅ Dashboard 重设计 + 模型广场/充值页优化
- ✅ 系统优化 (PG调优/Redis加固/备份/包分割/Docker优化)
- ✅ Typography 统一规范 + i18n 审计翻译
- ✅ 色彩体系重构 (钢蓝灰)
- ✅ 侧栏菜单精简 (两轮)
- ✅ 保存策略合并到规则页面 Tab
- ✅ Form.Upload 完整重写 (修复 Vertex AI 文件上传崩溃)
- ✅ 安全部署脚本 (deploy.sh)
- ✅ 视觉清晰度优化 (文字加深/字重分层/边框阴影/布局层次) — `20baf1bf`

### 待办方向
- [ ] 移动端适配优化
- [ ] 暗色模式细节调整
- [ ] Chat 组件脱离 Semi（阻塞 Semi CSS 1.16MB 移除）
- [ ] 巨型文件拆分（EditChannelModal 4101行等）
- [ ] 上游同步 (QuantumNous/new-api)
- [ ] 香港服务器部署 (api.oneaiai.com)

### 恢复工作时的步骤
1. 先读 `/opt/apps/newapis/newapi.md` — 有完整进度、决策、commit 链
2. 看 `memory/` 最近日期文件 — 当日细节
3. 检查 `git log --oneline -5` — 确认当前位置
4. 不需要重新读全部代码，newapi.md 已记录所有关键文件位置

### 踩过的坑（关键教训）
- **Go embed**: 默认排除 `_` 和 `.` 开头文件，必须用 `all:` 前缀
- **VChart**: canvas 渲染不认 CSS 变量，必须传实际颜色值
- **FormField cloneElement**: 会给子组件注入 value prop，file input 会崩溃，用 `_noInject` 阻止
- **Docker build + SCP**: 只 SCP dist 不 git pull 会被旧代码覆盖
- **manualChunks**: 用对象模式更安全，函数模式容易循环依赖导致白屏
- **bun build**: 必须先 rm -rf dist node_modules/.vite，否则旧 CSS/JS 混入
- **高饱和蓝色主题被否决**: 用户试过 #3b82f6 后不满意，退回钢蓝灰 — 不要再建议类似方案
- **Docker 502**: 服务器重启后 docker-proxy 端口转发断裂，需 `systemctl restart docker`（不只是重启容器）

---

## 👤 用户信息

- **称呼**: 抱抱熊
- **沟通语言**: 中文
- **偏好**: 直接高效，不要废话，先做后问
- **项目合作者**: 小牧（可能接手继续优化）

---

## 📝 工作习惯备忘

- 每次改动先部署本地 dev 让用户看效果
- 满意后再推 git + 部署测试/生产
- 代码推送到 `nomoapi` 和 `opentoken` 两个 remote
- 推完 feat/shadcn-ui 后合并到 main 并推送
- 每次重大更新后同步 `newapi.md`
- 日常记录写 `memory/YYYY-MM-DD.md`
- deploy.sh 是标准部署流程，避免手动操作遗漏

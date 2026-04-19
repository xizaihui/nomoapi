# MEMORY.md — 长期记忆

> 每次新会话我会自动读这个文件，立刻知道所有项目状态。

---

## 🔑 核心项目：OpenToken (New API)

### 快速恢复
**一句话唤醒**: "继续 OpenToken" 或 "看看 newapi.md"
**项目状态文件**: `/opt/apps/newapis/newapi.md` ← **最完整的项目追踪文档，必读**
**上次更新**: 2026-04-14，Semi Form Switch 保存失效修复 (`onValueChange`)

### 项目概要
- Go + React 全栈 Web 应用，API 管理平台
- 前端从 Semi UI 迁移到 shadcn/ui（通过 compat 兼容层，31个包装器）
- 包含安全审计系统 (Go + Elasticsearch 8.15.0)、多语言 i18n (7语言)、暗色模式
- 品牌: OpenToken (原 Aurora → 原 New API)
- Docker 镜像: `newapi-aurora:latest` (alpine, ~108MB)

### 环境列表
| 环境 | 地址 | 部署方式 | 当前版本 |
|------|------|----------|----------|
| 开发 | 154.40.40.48:3000 | 本机 Docker | `f01f468a` |
| 测试 | 154.36.173.198 (api.opentokens.net) | SSH deploy | `9c5e03fe` |
| 生产(旧) | 38.58.59.161 (api.opentoken.io) | SSH deploy | `9c5e03fe` | 待下线，DNS 切换后保留 24-48h |
| 生产(新) | 154.36.173.70 (api.opentoken.io) | SSH deploy | 镜像自旧生产 | **2026-04-18 迁移完成，等 DNS 切换** |
| ccmax | 154.44.9.169 (api.ccmax.ai) | SSH + docker save/load | `f01f468a` | |

### SSH 凭据（所有远程统一）
- 用户: `root`
- 密码: `***REDACTED***`
- 工具: `sshpass -p '***REDACTED***' ssh -o StrictHostKeyChecking=no root@<IP>`

### ccmax 服务器专项说明（2026-04-14 新增）
- 远程路径: `/opt/apps/opentoken`
- 远程 git remote `origin` 为 `xizaihui/opentoken`，HEAD 可能落后本地
- **远程没有 `web/dist/`**（Dockerfile `COPY . .` 直接嵌入），本地构建后必须 `docker save | ssh | docker load` 传镜像，不能远程 `docker build`
- 本地修改: `docker-compose.yml` + `redis.conf` (stash/pop 保留环境配置)
- 标准部署: 本机 build 成功 → `docker save newapi-aurora:latest | gzip | sshpass ssh ... 'gunzip | docker load'` → 远程 `docker compose up -d --force-recreate new-api`

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
- ✅ Bedrock Beta Flags 配置化 (admin UI, DB-backed, 自动去重)
- ✅ 蒸馏检测引擎 (Redis, 两指标, 自动禁用, 白名单) — `89a35a33`
- ✅ Bedrock cache_control.scope 清理 (body 层过滤) — `f6238912`
- ✅ Seedance T0101006 动态 token 计费 — `a19eee6e`
  - billing.go: AdjustBillingOnComplete 按实际 tokens 结算 ($7.5/M tokens)
  - 有参考视频 ×0.6 折扣，预扣保持 $0.001/$0.0006
  - 删除 DB ModelPrice[T0101006]，注释 TASK_PRICE_PATCH
- ✅ Seedance 计费日志增强 — `3144b42b`
  - completion_tokens 写入日志表专用列，真实 modelPrice 回写 BillingContext
  - RecalculateTaskQuota 支持 extraOther，billing log 含完整计费明细

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
- **XML tool_call 自回复毒害**：绝对不要在回复文本中输出字面量 XML tool_call 标签（包括 tool_name、parameters、function_calls、invoke），会导致 OpenClaw 解析失败 → 对话中断 → compaction 污染。已写入 AGENTS.md 禁止规则。
- **Go embed**: 默认排除 `_` 和 `.` 开头文件，必须用 `all:` 前缀
- **VChart**: canvas 渲染不认 CSS 变量，必须传实际颜色值
- **FormField cloneElement**: 会给子组件注入 value prop，file input 会崩溃，用 `_noInject` 阻止
- **Docker build + SCP**: 只 SCP dist 不 git pull 会被旧代码覆盖
- **manualChunks**: 用对象模式更安全，函数模式容易循环依赖导致白屏
- **bun build**: 必须先 rm -rf dist node_modules/.vite，否则旧 CSS/JS 混入
- **高饱和蓝色主题被否决**: 用户试过 #3b82f6 后不满意，退回钢蓝灰 — 不要再建议类似方案
- **Docker 502**: 服务器重启后 docker-proxy 端口转发断裂，需 `systemctl restart docker`（不只是重启容器）
- **API /api/option/ 返回数组**: `[{key, value}]` 格式，不是对象 — 前端读取时需先转 map
- **Bedrock cache_control.scope**: 在请求体 body 中，不在 header — 过滤 header 的 beta flags 不够，需要遍历 body 删除
- **macOS 缩放适配失败**: zoom: 0.82 效果不好，用户还原 — Mac/Windows 差异暂不强制适配
- **Rust `regex` crate 不支持 look-ahead**: 用非贪婪匹配替代
- **Rust `LazyLock` panic poisons**: 一个 LazyLock init panic 后所有后续 access 都 panic
- **Rust 增量编译 ICE**: `cargo clean` 后重编可解决 `evaluate_obligation` 内部错误
- **Release build OOM**: 7.8G 内存机器上 `cargo build --release` 可能被 SIGTERM，用 `CARGO_BUILD_JOBS=2` 限制并行度

---

## 🔧 ClewdR 项目

### 快速恢复
**一句话唤醒**: "继续 clewdr" 或 "看看 clewdr.md"
**代码路径**: `/root/.openclaw/workspace/new-clewdr`
**部署服务器**: 38.150.32.190 (`/opt/clewdr/clewdr`)
**更新日志**: `/root/.openclaw/workspace/clewdr.md`

### 当前版本状态 (2026-04-09)
- 最新 commit: `a1c2806` on master
- 已部署到 38.150.32.190，服务 active
- 4 cookie valid，0 exhausted/invalid

### 企业高并发改造完成
- 目标: 300 个 Claude Max $200 账号，RPM 10k
- 结论: 单套 clewdr 足够，不需要分布式
- 配置化参数: rate limit/熔断/冻结全部可 toml 调整
- Prometheus metrics 已埋点

### 关键配置项 (clewdr.toml)
```toml
cookie_rate_limit_per_minute = 30   # Max 账号用 30, Free 用 10
cookie_rate_window_secs = 60
cookie_error_threshold = 8
cookie_error_window_secs = 60
cookie_freeze_base_secs = 60
cookie_freeze_max_secs = 1800
sanitize_xml_tool_calls = true      # XML 消毒器（默认开启）
```

### 三层 XML 防线（全部已部署）
| 层 | 状态 |
|---|---|
| 入站历史清洗 | ✅ 每轮触发 |
| 出站非流式 | ✅ tool_sim 升级 + fallback |
| 出站流式 | ✅ 三种变体全覆盖 |

### 第四层: Sentinel 出站过滤 (2026-04-13)
- 问题: 上游 (OpenClaw) 的 sentinel 标记 (`⟦CDR_TOOL_BEGIN/END⟧`) 被 Claude 回复模仿输出，clewdr 不识别就透传到用户
- 新增 `strip_sentinel_patterns()` 函数，按行过滤含 `CDR_TOOL_BEGIN/END` 的行
- 覆盖 6 处文本出口: 非流式 remaining + 全文、Claude 流式 remaining + flush、OAI 流式 remaining + flush
- Commits: `0115c27`, `77d87db` on `feat/tool-sim-hardening`

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

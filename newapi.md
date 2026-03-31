# OpenToken (原 New API Aurora) — UI 迁移项目追踪

> **快速恢复口令**: 跟我说「继续 OpenToken 项目」或「看看 /opt/apps/newapis/newapi.md」，我会先读这个文件，立刻知道做到哪了。

---

## 📍 项目信息

- **项目名称**: OpenToken（原 New API → Aurora → OpenToken）
- **项目路径**: `/opt/apps/newapis`
- **前端路径**: `/opt/apps/newapis/web`
- **分支**: `feat/shadcn-ui`
- **服务地址**: `http://154.40.40.48:3000`
- **Docker 镜像**: `newapi-aurora:latest`
- **GitHub**: `xizaihui/nomoapi` + `xizaihui/opentoken`
- **上游**: `QuantumNous/new-api` (origin/main)
- **同步指南**: `/opt/apps/newapis/UPSTREAM-SYNC.md`
- **最新 tag**: `v0.4.5-opentoken`

---

## ✅ 已完成里程碑

### Phase 0-7 — Semi UI → shadcn/ui 迁移（核心）
- 31 个 compat 包装器 + Vite alias 路由
- Table/Form/Modal/Dropdown/SideSheet/DatePicker/Calendar 全部重写
- 63 个图标映射（Semi → Lucide），88 个文件迁移
- 22 个页面 React.lazy() 懒加载，主 bundle 7.4MB → 5.4MB
- CSS 清理：73 个 .semi- 选择器移除（剩 23 个 .semi-chat-*）
- 250 个内联 --semi-color-* 变量替换

### 安全审计模块 v1
- 后端 audit/ 包（Go）：model, controller, router, scanner, elasticsearch, seed
- 前端 features/audit/：AuditLogsPage, AuditRulesPage, API hooks
- Elasticsearch 8.15.0 按月分索引，异步写入
- 12 条默认审计规则，4 个风险等级
- 异步中间件，不阻塞用户请求

### UI 差异化（Aurora → 极简灰度风格）
- Phase 1-6：品牌/配色/字体/表格/侧边栏/按钮/标签/表单/弹窗/图表/动画
- 386 处硬编码颜色 → 主题 token
- VChart 自定义灰度主题
- 7 个 Tailwind 动画 + 微交互

### Dashboard 重设计
- StatsCards 极简网格（OpenRouter 风格）
- UsageLogs 灰度 Pill 组件

### 品牌重塑 — OpenToken
- 系统名称 Aurora → OpenToken
- 新 SVG Logo（token 环 + 钥匙，monochrome）
- Favicon、Footer、HTML title 全部更新
- 侧栏菜单重命名：概况预览 / 密钥管理 / 日志详情
- 7 个语言包翻译

### 模型广场 / 充值页 / 首页优化
- PricingCardView：纯 Tailwind div 卡片，去掉 Card/Avatar/Tag
- RechargeCard：去掉蓝色渐变 banner，改为 3 列统计网格
- 首页 Hero：5xl semibold，去 shine-text，10 个供应商图标 40% 透明度
- 模型广场滚动修复 + 价格信息垂直排列

### 交互 & 对齐修复（v0.4.x 系列）
- 所有 SideSheet 弹窗统一从右侧滑出
- 语言选择器：重写为 Radix DropdownMenu（修复跳转空白页）
- 系统名称/Logo 设置：localStorage 即时同步（修复不生效）
- 顶部导航栏：统一 h-9 + text-sm，图标 16px
- 密钥管理页：按钮/输入框高度对齐（h-9）
- Ghost 按钮：加 border-border 边框（查询/重置可见性）
- CardPro header：移入 body 渲染（修复分隔线不对齐）
- Form.Input/TextArea：添加 id={field}（修复 OtherSetting 输入绑定）
- FormField：pure prop 正确传递（修复 mb-4 导致的高度差）

---

## 🔴 当前状态（v0.4.5-opentoken）

### 项目状态: ✅ 基本完善，可作为独立品牌产品使用

### 残留项
- 1 个真 Semi 引用（Chat 组件，必须保留）
- 23 个 .semi-chat-* CSS 选择器（Chat 组件需要）
- semi.css 仍在 index.jsx 加载（Chat 依赖，P3 移除尝试失败已回退）
- vite-plugin-semi 仍保留（P3 移除后白屏已回退）
- ModelTestModal 白屏（遗留 bug，未修复）
- 上游 test channel 502（nginx bad gateway，非代码问题）

### 三环境部署
| 环境 | 地址 | 域名 | 状态 |
|------|------|------|------|
| 开发 | 154.40.40.48:3000 | - | ✅ 已部署 `9c5e03fe` |
| 测试 | 154.36.173.198 | api.opentokens.net | ✅ 已部署 `9c5e03fe` |
| 生产 | 38.58.59.161 | api.opentoken.io | ✅ 已部署 `9c5e03fe` |

### 可继续优化的方向
- [ ] 更多页面的细节打磨（根据用户反馈）
- [ ] 移动端适配优化
- [ ] 暗色模式细节调整
- [ ] 浅色模式图表色彩优化（当前钢蓝灰色系，用户反馈待收集）
- [ ] 审计模块 v2（更多规则类型、导出功能）
- [ ] 上游同步（QuantumNous/new-api 新功能合并）
- [ ] Chat 组件脱离真实 Semi → 才能彻底移除 Semi CSS（1.16MB）
- [ ] 巨型文件拆分（EditChannelModal 4101行、ParamOverrideEditorModal 3511行、render.jsx 3027行）
- [ ] 官方定价配置（AWS Claude / OpenAI / Gemini ModelRatio + CompletionRatio）
- [ ] 香港服务器部署（api.oneaiai.com 待确认 IP 和域名）
- [ ] PG 重启生效：shared_buffers 8GB + max_connections 300 + wal_buffers 64MB

---

### 2026-03-21 — Typography 统一规范 + i18n 审计翻译 + 滚动条/固定列修复

#### Typography & Visual Hierarchy ✅ (commit: `2ce578de`, 75 files)
- **字号收敛**: 10种 → 5级标准 (H1=text-xl, H2=text-base, Body=text-sm, Caption=text-xs, Stat=text-2xl)
- **字重统一**: font-bold → font-semibold (仅保留1处红色价格 bold)
- **颜色层级**: 10种散乱透明度 → 3级 (text-foreground / text-foreground/80 / text-muted-foreground)
- **消灭 text-slate-***: 101处硬编码全部替换为语义 token
- **SideSheet 标题**: inline style → Tailwind class
- **Table 表头**: text-[11px] → text-xs
- **Typography.Title**: h1-h6 重映射到新标准
- **全局 --radius**: 0.5rem → 0.625rem (更圆润)
- **letter-spacing**: -0.011em (Inter 字体最佳紧凑度)
- **侧边栏**: 圆角 6px→8px, selected weight 600→500

#### 审计模块 i18n 完整翻译 ✅ (commit: `3e7b54b6`)
- 🇺🇸 English / 🇹🇼 繁體中文 / 🇯🇵 日本語 各 121 个翻译 key
- 修复: TIME_RANGE_PRESETS / RETENTION_PRESETS 硬编码中文 → t() 包裹
- 修复: constants.js RISK_LEVELS/CATEGORIES/RULE_TYPES label 引用加 t()
- 修复: 日期 toLocaleString('zh-CN') → toLocaleString(i18n.language)
- 覆盖: 安全审计 + 审计规则 + 日志保存策略 三个页面

#### 全局细滚动条 ✅ (commit: `3e7b54b6`)
- scrollbar-width: thin, 宽度 6px
- 滚动条轨道完全透明 (消除 SideSheet 右侧灰条)
- thumb 半透明前景色, hover 加深

#### 表格固定列背景修复 ✅ (commit: `3e7b54b6`)
- sticky 列 bg-background → bg-card
- 修复浅色主题下固定列灰条 (background=#f7f7f8 vs card=#fff 不匹配)

**Commit 链:**
```
da43ecec → e75a7f76 → 2ce578de → 3e7b54b6
```

| 环境 | 状态 | 版本 |
|------|------|------|
| 本地 dev (154.40.40.48:3000) | ✅ 已部署 | `8cc70d74` |
| 测试 (154.36.173.198) | ❌ SSH 密码变更，无法连接 | — |
| 生产 (38.58.59.161) | ✅ 已部署 | `8cc70d74` |

---

### 2026-03-20/21 — UI修复 + 审计保存策略 + 部署优化

#### 审计日志保存策略 ✅ (commit: `b79bf09c`)
- 新增 `audit/retention.go` — RetentionPolicy 模型、CRUD、每日3AM自动清理协程
- 新增 `audit/retention_controller.go` — API handlers (admin-only)
- 新增路由: `/api/audit/retention/policies`, `/retention/summary`, `/retention/cleanup`
- PG 表: `audit_retention_policies` (group unique key, retention_days)
- 全局默认 `*`: 30天（可自定义修改）
- 分组策略优先级 > 全局默认，retention_days=0 表示永久保存
- 清理方式: ES `_delete_by_query` 按分组粒度，非索引删除
- 前端页面: `AuditRetentionPage.jsx` at `/console/audit-retention`
- 预设天数: 30/60/90/180/365/永久/自定义

#### Lazy Import 自动重试 ✅ (commit: `a1f2347e`)
- `App.jsx`: 所有 `lazy()` → `lazyRetry()` 包装
- 部署新版本后用户旧页面自动刷新获取新资源（30秒防重复）
- 解决 "Failed to fetch dynamically imported module" 部署后报错

#### Cache-Control 优化 ✅ (commit: `a1f2347e`)
- `middleware/cache.go`: HTML → `no-cache, no-store, must-revalidate`; 带哈希资源 → `immutable, max-age=1年`
- `router/web-router.go`: SPA fallback 路由也设 `no-store`
- 移除无用的 `Cache-Version` header

#### Session 持久化 ✅ (commit: `a1f2347e`)
- `docker-compose.yml`: 添加 `SESSION_SECRET` 环境变量
- 容器重启后登录状态不再失效

#### Web 限流调整 ✅ (commit: `da43ecec`)
- `GLOBAL_WEB_RATE_LIMIT`: 60/180s → **500/60s** (per IP)
- SPA 单次加载 ~20 个 chunk 请求，原值太低

#### 其他修改
- `audit/retention.go`: 全局默认 90天 → 30天 (commit: `da43ecec`)
- 时间快捷筛选 (commit: `ec2f3432`): 审计日志页增加今天/近7天/本周/近30天/本月
- UI优化 (commit: `6e35b5e0`): textarea滚动条、分页器、配色方案

**Commit 链:**
```
6e35b5e0 → ec2f3432 → b79bf09c → a1f2347e → da43ecec
```

| 指标 | 说明 |
|------|------|
| 审计保存策略 | 按分组配置，默认30天，支持永久 |
| 部署体验 | lazy import 自动重试，用户无感更新 |
| 限流 | 500/min/IP，不影响正常SPA加载 |
| Session | 固定密钥，容器重启不掉线 |

---

### 2026-03-17 (下午) — P4-1 / P5-2 / 暗色模式修复 / Go embed 修复

#### P4-1: @lobehub/icons 隔离 ✅ (commit: `107ad9f1`)
- 32 个 named icon imports + getModelCategories/getChannelIcon/renderModelTag 从 render.jsx 移至 lobe-icons.jsx
- 16 个调用方更新为直接从 helpers/lobe-icons 导入
- 主入口: 1,744KB → 1,267KB (-27%)
- lobe-icons: 3,604KB 隔离为按需加载 chunk（仅后台管理页面加载）

#### P4-4: Playground 移除 ✅ (commit: `05189132`)
- 移除 Playground 页面（最后一个真实 Semi UI 运行时依赖）

#### P5-2: 闭包 Bug 修复 ✅ (commit: `f207a45f`)
- ModelRatioSettings.jsx / GroupRatioSettings.jsx 的 10+ 个 onChange 改为函数式更新

#### Go embed 修复 ✅ (commit: `107ad9f1`)
- `//go:embed web/dist` → `//go:embed all:web/dist`（修复下划线文件 _arrayReduce 等 404）
- 禁用 gin-contrib/gzip on web router（修复 Content-Length: 23 导致 JS 加载失败）
- **教训**: Go embed 默认排除 `_` 和 `.` 开头的文件，必须用 `all:` 前缀

#### 暗色模式图表修复 ✅ (commits: `8402a1d3` → `484c65c4` → `fbf9ef11`)
- VChart 暗色主题: 透明背景、柔和灰色色板
- 4 个图表 spec 显式设 `background: 'transparent'`（VChart 主题 background 不够）
- StatsCards 迷你折线图: CSS 变量 → 运行时检测暗色模式 + 硬编码颜色（VChart canvas 不解析 CSS 变量）
- **教训**: VChart 是 canvas 渲染，不认 CSS 变量，必须传实际颜色值

#### Dockerfile 同步 ✅
- 生产环境 Dockerfile 从旧版（容器内 bun build）更新为新版（pre-built dist + alpine）

#### PG 重启参数生效 ✅（生产环境）
- shared_buffers: 128MB → 8GB ✅
- max_connections: 100 → 300 ✅
- wal_buffers: 4MB → 64MB ✅

**当前 HEAD**: `9c5e03fe` on `feat/shadcn-ui` (`main` = `9c5e03fe`)

| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| 首屏 JS | ~1,650KB | ~1,267KB | **-23%** |
| lobe-icons | 主入口内 | 按需加载 | ✅ 隔离 |
| PG shared_buffers | 128MB | 8GB | ✅ 已重启生效 |
| 暗色图表 | 白色背景 | 透明+柔和 | ✅ |
| 闭包 Bug | 存在 | 已修复 | ✅ |

---

## 🧠 关键决策记录

| 决策 | 原因 |
|------|------|
| Vite 别名 + compat 层 | 上游代码零修改，merge 冲突最小化 |
| Chat 保留真实 Semi | API 太复杂，隔离到 lazy 页面 |
| 纯 Portal SideSheet | Radix Dialog 居中定位与侧面板冲突 |
| submitRef 模式 | formApi 在 useMemo 中创建，handleSubmit 还不存在 |
| 桥接变量而非源码替换 | 219 个文件引用 --semi-color-*，桥接更安全 |
| Calendar 纯 JS | date-fns v3/v4 与现有 date-fns-tz 冲突 |
| ES 异步审计 | 不阻塞用户请求，ES 故障不影响服务 |
| FormField id={field} | OtherSetting 的 handleInputChange 依赖 e.target.id |
| FormUpload `_noInject` | file input 禁止 JS 设 value，必须阻止 FormField 的 cloneElement 注入 |
| 部署先 git pull 再 build | Go embed 会用 git 工作树的 dist，SCP 的新 dist 会被旧代码覆盖 |
| 钢蓝灰色系 (hue 215) | 纯灰太单调，低饱和钢蓝兼顾专业感和视觉层次 |
| 保存策略合并到规则页 Tab | 都是审计规则策略类型，减少侧栏入口数量 |

---

## 🔧 构建 & 部署速查

```bash
# 构建前端（必须先清理！）
export PATH="$HOME/.bun/bin:$PATH"
cd /opt/apps/newapis/web
rm -rf dist node_modules/.vite    # ← 关键：防止旧文件混入
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Docker 构建部署（本地）
cd /opt/apps/newapis
docker build --no-cache -t newapi-aurora:latest .
docker compose up -d --force-recreate --no-deps new-api

# 一键三环境部署（推荐）
./scripts/deploy.sh              # 全部
./scripts/deploy.sh prod         # 仅生产
./scripts/deploy.sh test prod    # 测试+生产

# 推送代码 + 合并 main
git push nomoapi feat/shadcn-ui && git push opentoken feat/shadcn-ui
git checkout main && git merge feat/shadcn-ui --ff-only
git push nomoapi main && git push opentoken main
git checkout feat/shadcn-ui

# 打 tag
git tag v0.x.x-opentoken
git push nomoapi v0.x.x-opentoken
git push opentoken v0.x.x-opentoken
```

---

## 📅 更新日志

### 2026-03-24 — 靛蓝色彩体系 + 色彩精修 + Dropdown/Checkbox 修复

#### 色彩体系升级：钢蓝灰 → 靛蓝双色系统 ✅
- **设计理念**: 黑白灰基底保持不变，交互元素使用靛蓝 `hsl(220 60% 50%)` 作为信号色
- **主色**: `--primary: 220 60% 50%`（靛蓝），仅用于按钮/选中态/聚焦态
- **accent**: `220 30% 95%` 极淡靛蓝底色，用于 hover/选中背景
- **ring/sidebar-primary/sidebar-ring**: 统一靛蓝
- **chart 色板**: `220 55% 48%` → `215 10% 78%` 靛蓝到冷灰渐变
- **Semi hover/active**: 实色 `hsl(220 60% 45%)` / `hsl(220 60% 40%)`，不再用透明度

#### 色彩精修（5项） ✅
- **状态色色温统一**: success 纯绿→青绿 `#0d9488`(teal)，warning 亮橙→深琥珀 `#c2820a`，info 跟主色靛蓝统一
- **Semi 底层色板覆写**: `--semi-green-*` / `--semi-blue-*` / `--semi-orange-*` 全部重映射
- **图表色板优化**: 靛蓝→冷灰自然渐变，相邻色辨识度拉开
- **侧栏交互增强**: hover 极淡靛蓝底 `220 60% 50% / 0.06`，选中态靛蓝文字+图标
- **按钮阴影色调**: 投影从纯黑→靛蓝调 `rgba(51,85,153)`
- **sparkline 迷你图**: 颜色改为靛蓝 `#3355a0`

#### Dropdown 崩溃修复 ✅
- **问题**: 模型页→供应商 Tab→"操作"按钮点击报错 `React.Children.only expected to receive a single React element child`
- **原因**: Radix `DropdownMenuTrigger asChild` 内部 Slot 要求恰好一个 React element child，Semi compat Button 经两层包装后某些场景不满足
- **修复**: `Dropdown.jsx` 在传给 Trigger 前校验 children，非单元素则包 `<span>`；`Dropdown.Item` 的 `React.Children.only` 加 try-catch 防御

#### Form.Checkbox 保存失效修复 ✅
- **问题**: 系统设置→配置登录注册，勾选框无文字标签 + 勾选后不保存
- **原因1**: `FormCheckbox` 只接收 `label` prop，未处理 `children`（Semi 用 children 传文字）
- **原因2**: `FormCheckbox` 未透传外部 `onChange`，导致 `handleCheckboxChange` → `updateOptions()` 从未被调用
- **修复**: 新增 `children` 解构，`displayLabel = label || children`；显式解构 `onChange` 并在 input 事件中调用

**影响文件**: `index.css`, `Dropdown.jsx`, `Form.jsx`, `StatsCards.jsx`, `useDashboardCharts.jsx`

### 2026-03-24 — 视觉清晰度优化 + 布局层次增强

#### 文字清晰度修复 ✅
- **前景色加深**: `--foreground` 从 `0 0% 12%` → `0 0% 9%`（更黑更实）
- **muted-foreground 提亮**: 亮色 44%→36%，暗色 52%→60%（辅助文字不再"隐形"）
- **Semi text 层级优化**: text-1 opacity 0.88→0.92，text-3 0.75→0.85
- **暗色 text-1**: 0.92→0.95，text-3: 0.7→0.85
- **disabled-text 提亮**: 亮色 0.5→0.6，暗色 0.4→0.55
- **全局基准字号**: body 新增 `font-size: 14px; line-height: 1.5; font-weight: 400`

#### 字重层次分层 ✅
- 表头 `.semi-table-thead` → `font-weight: 500`
- 页面标题 h1-h3 → `font-weight: 600`
- 卡片标题 / h4-h6 → `font-weight: 500`
- 表格 Tag/Strong → `font-weight: 500`
- 侧边栏分组标签 → `font-weight: 600`（原 500）

#### 边框 & 阴影层次 ✅
- **边框加深**: 亮色 `--border` 90%→86%，暗色 16%→18%
- **卡片静态阴影**: `.semi-card` 添加轻微投影（亮/暗色不同强度）
- **Header 分层**: `header.fixed` 底部加 border + 微阴影
- **Header 透明度**: `bg-background/80` → `bg-background/95`（更实更清晰）
- **主按钮投影**: `.semi-button-primary` 添加轻微 box-shadow
- **shadow 变量**: `--semi-color-shadow` 0.06→0.08

#### 布局优化 ✅
- **内容区限宽**: `main.page-content-enter > * { max-width: 1600px }`
- **表格行间距**: 单元格 padding 12px，提升呼吸感
- **表格 hover**: 使用 `hsl(var(--accent))` 增强悬浮底色

#### 侧边栏清晰度 ✅
- 图标 opacity: 0.75→0.85（主图标），0.65→0.75（子图标）
- 文字颜色: `sidebar-foreground / 0.8` → `0.85`
- 分组标签: `sidebar-foreground / 0.5` → `0.55`

**影响文件**: `index.css`, `headerbar/index.jsx`
**影响范围**: 全站浅色 + 暗色主题

### 2026-03-22 — 色彩体系重构(钢蓝灰) + 侧栏精简 + 图标差异化 + 规则页合并

#### 色彩体系重构 ✅ (commit: `19cbc627`)
- **核心变更**: 全站色彩从紫灰色系 (hue 240) → 纯中性灰 + 钢蓝点缀 (hue 215)
- **设计理念**: 高端、现代、稳重 — 低饱和、高质感、极简风格
- 主色 (light): `215 20% 30%` 钢蓝深灰 | (dark): `215 18% 68%` 钢蓝浅色
- 背景/边框/muted: 纯中性灰 `0 0%`，零色相偏移
- **CSS 变量**: 浅色 + 暗色主题全部重写 (`index.css`)
- **VChart 图表**: 10色浅色 + 10色暗色色板重写 (`useDashboardCharts.jsx`)
- **模型色板**: 基础10色 + 扩展20色 + 30+ 模型映射全部迁移 (`render.jsx`)
- **Stats 卡片**: 趋势线颜色 + Avatar 颜色统一中性化 (`useDashboardStats.jsx`, `StatsCards.jsx`)
- **装饰元素**: blur-ball (indigo+teal → 钢蓝双色)、pastel-balls (马卡龙 → 钢蓝灰)、shine-text (金黄 → 银蓝)
- **Avatar 组件**: 所有彩色映射 → foreground 不透明度层级 (`Avatar.jsx`)
- **杂项**: PreferencesSettings violet→grey、ModelPricingEditor Tag→grey/white

#### 侧栏菜单名称精简 ✅ (commit: `19cbc627`)
| 旧名称 | 新名称 |
|--------|--------|
| 概况预览 | 概览 |
| 令牌管理 | 令牌 |
| 日志详情 | 日志 |
| 渠道管理 | 渠道 |
| 用户管理 | 用户 |
- 涉及: SiderBar, UserArea, SettingsSidebarModulesAdmin, NotificationSettings, UsersDescription, TokensDescription
- i18n: 7语言 (zh-CN/en/zh-TW/ja/ru/fr/vi) 全部新增短键翻译

#### 审计模块侧栏图标差异化 ✅ (commit: `18438b65`)
- 审计日志 → `FileSearch` (放大镜+文档)
- 审计规则 → `ShieldCheck` (盾牌+勾)
- 保存策略 → `Timer` (计时器)

**Commit 链:**
```
04963cd9 → 18438b65 → 19cbc627
```

| 环境 | 状态 | 版本 |
|------|------|------|
| 开发 (154.40.40.48:3000) | ✅ 已部署 | `19cbc627` |
| 测试 (154.36.173.198) | ✅ 已部署 | `19cbc627` |
| 生产 (38.58.59.161) | ✅ 已部署 | `19cbc627` |

#### 侧栏菜单名称精简 (第二轮) ✅ (commit: `fa8a08ea`)
| 旧名称 | 新名称 |
|--------|--------|
| 模型管理 | 模型 |
| 兑换码管理 | 兑换码 |
| 审计日志 | 日志 |
| 审计规则 | 规则 |
- 涉及: SiderBar, SettingsSidebarModulesAdmin, NotificationSettings, RedemptionsDescription, AuditRulesPage
- i18n: 7语言 (zh-CN/en/zh-TW/ja/ru/fr/vi) 新增 模型/兑换码/规则 短键翻译

#### 保存策略合并到规则页面 ✅ (commit: `fa8a08ea`)
- AuditRulesPage.jsx 重构为 Tab 页面: 「审计规则」|「保存策略」两个 Tab
- 保存策略代码从 AuditRetentionPage.jsx 整合到 AuditRulesPage.jsx 内 (`RetentionPanel`)
- 侧栏移除独立的"保存策略"入口
- App.jsx: 移除 AuditRetentionPage lazy import，`/console/audit-retention` → `Navigate` redirect 到 `/console/audit-rules`
- AuditRetentionPage.jsx 文件保留但不再引用（可后续清理）

#### Git main 分支合并 ✅
- `feat/shadcn-ui` fast-forward 合并到 `main`（122 commits）
- 推送 `main` 到 `nomoapi` + `opentoken` 两个 remote

**Commit 链:**
```
04963cd9 → 18438b65 → 19cbc627 → 904fc9ff → 5d8aac01 → 65e061c4 → fa8a08ea → 561a9ce5 → 5ac15797 → 9c5e03fe
```

| 环境 | 状态 | 版本 |
|------|------|------|
| 开发 (154.40.40.48:3000) | ✅ 已部署 | `9c5e03fe` |
| 测试 (154.36.173.198) | ✅ 已部署 | `9c5e03fe` |
| 生产 (38.58.59.161) | ✅ 已部署 | `9c5e03fe` |

#### Form.Upload 完整重写 ✅ (commit: `9c5e03fe`)
- **问题**: Vertex AI 渠道上传 JSON 密钥文件时，双击选文件后页面崩溃
- **根因**: 旧 `Form.Upload` 是占位组件，只有裸 `<input type="file">`。FormField 的 `cloneElement` 注入 `value` prop，但浏览器禁止 JS 设置 file input 的 value（安全限制），触发 `Failed to set the 'value' property on 'HTMLInputElement'`
- **修复**: 完整重写 FormUpload（146 行），功能包括：
  - 隐藏原生 input，用 `_noInject` 阻止 FormField 注入 value
  - 拖拽上传区 (`draggable` + `dragMainText/dragSubText`)
  - 多文件 / 单文件模式 (`multiple`)
  - 文件列表展示 + 删除按钮
  - `onChange({ fileList, currentFile })` 兼容 Semi Upload 回调格式
  - `fileList` 受控模式，兼容 `handleVertexUploadChange` 逻辑
  - 选择相同文件可重复触发（reset native input after change）
- **影响范围**: EditChannelModal.jsx 中 Vertex AI 的两处 `Form.Upload` 调用（批量/单个模式）

#### 安全部署脚本 ✅ (commit: `5ac15797`)
- 新增 `scripts/deploy.sh` — 一键三环境部署
- **核心改进**: Docker build 失败时不执行 `docker compose up`，旧容器继续运行
- 前端只本机构建一次，SCP dist 到远程
- 远程先 `git pull` 再 build（避免代码不同步）
- 部署后 30 秒健康检查循环（不是盲等 sleep）
- 失败时打印容器日志
- 用法: `./scripts/deploy.sh [local|test|prod]`

#### 生产环境事件记录
- **部署不生效排查**: 发现旧部署流程只 SCP dist 但不 git pull，Docker build 时 Go embed 用的旧代码覆盖了新 dist
- **生产服务器重启**: 15:38 UTC 服务器异常重启（原因未确定，疑似机房维护），ES 启动吃 120% CPU 导致约 2 分钟不可用，后自动恢复
- **教训**: 远程部署必须先 git pull 再 docker build；deploy.sh 脚本已固化此流程

---

### 2026-03-17 — 系统优化 P0-P3 轮

> 本轮目标：全面系统优化（备份、数据库、Redis、前端包体积、Docker镜像、Semi依赖清理）

#### Bug 修复（已部署生产）
| 项目 | 说明 | Commit |
|------|------|--------|
| Dashboard Settings 闭包 Bug | 5个设置页 onChange `{...form}` 互相覆盖，改为函数式 `prev => ({...prev})` | `ec0677e4` |
| 字体颜色全局优化 | 42个文件，统一四级透明度体系，侧栏/导航/图标全部加深 | `1aa1ed3f` |
| Form.Select 重复 extraText | 渠道编辑弹窗"填入相关模型"按钮两行→一行 | `0cadef18` |

#### P0: 自动数据库备份 ✅ (commit: `2f54c85d`)
- 脚本: `/opt/apps/newapis/scripts/pg-backup.sh`（`--production` 参数支持远程）
- 本机 cron: 每 6h（0/6/12/18 UTC）
- 生产 cron: 每 6h 自备 + 本机每 12h 拉取
- 策略: 30 天保留，最多 60 份，gzip 压缩（本机~12K/生产~20K）
- 状态: **本机+生产均已部署运行**

#### P1: PostgreSQL 调优 ✅（生产热加载）
| 参数 | 旧值 | 新值 | 状态 |
|------|------|------|------|
| effective_cache_size | 4GB | 24GB | ✅ 已生效 |
| work_mem | 4MB | 16MB | ✅ 已生效 |
| maintenance_work_mem | 64MB | 512MB | ✅ 已生效 |
| random_page_cost | 4 | 1.1 | ✅ 已生效 |
| effective_io_concurrency | 1 | 200 | ✅ 已生效 |
| max_parallel_workers_per_gather | 2 | 4 | ✅ 已生效 |
| max_wal_size | 1GB | 2GB | ✅ 已生效 |
| log_min_duration_statement | -1 | 1000ms | ✅ 已生效 |
| shared_buffers | 128MB | 8GB | ⏳ 待PG重启 |
| max_connections | 100 | 300 | ⏳ 待PG重启 |
| wal_buffers | 4MB | 64MB | ⏳ 待PG重启 |

#### P1: Swap ✅（生产已生效）
- 4GB swap `/swapfile`，swappiness=10，已写入 fstab

#### P1: 前端包分割 ⚠️ 部分回退 (commit: `b340d6b5` → `3e793e0e`)
- **原计划**: 函数式 `manualChunks`，主入口 5.4MB → 1.1MB
- **问题**: 函数式分包过于激进，`react-core` 与 `charts` 形成循环依赖，浏览器报 `Cannot access 'Ki' before initialization` TDZ 错误，**白屏**
- **修复**: 回退到对象式 `manualChunks`（只指定入口包名，Rollup 自动处理依赖图）
- **最终效果**: 主入口 ~1.6MB（仍比原始 5.4MB 小 70%），零运行时错误
- **保留的拆分**: react-core(164KB), semi-ui(1.4MB), shadcn-ui(115KB), charts(1.9MB), tools, i18n, react-components
- **教训**: manualChunks 用对象模式更安全；函数模式会强制切割依赖图，容易产生循环依赖

#### P2: Redis 安全加固 ✅ (commit: `3c8e9a1c`)
- 运行时已生效: `maxmemory 2GB` + `allkeys-lru`
- redis.conf: RDB 持久化 + 禁用 FLUSHDB/FLUSHALL + 超时/keepalive
- docker-compose: 挂载 redis.conf + redis_data volume（下次容器重启生效）

#### P2: 数据库索引审计 ✅
- 所有表数据量极小（<300行），已有完整索引，无需额外优化

#### P3: Semi CSS 移除 ❌ 已回退 (commit: `f8ee5035` → `d28203a1`)
- **尝试**: 移除 vite-plugin-semi + semi.css + locale + Chat stub，CSS 1.26MB→133KB
- **问题**: 移除后导致白屏（与 P1 循环依赖问题叠加）
- **回退**: 完全恢复 Semi 运行时（vite-plugin-semi + semi.css + locale + Chat 真实导出）
- **结论**: Semi 完全移除需要先去掉 Chat 组件对真实 Semi 的依赖，工作量较大

#### P3: Dockerfile 优化 ✅ (commit: `ef84c137`)
- 基础镜像: `debian:bookworm-slim` → `alpine:3.20`（更小）
- 构建方式: 不再在容器内运行 `bun install` + `bun run build`，改为使用本机 pre-built `web/dist`
- `.dockerignore` 移除 `/web/dist` 排除项
- Go 编译器通过 `//go:embed web/dist` 嵌入预构建前端
- 镜像大小: ~108MB

---

**本轮最终 commit 链:**
```
ec0677e4 → 1aa1ed3f → 0cadef18 → 2f54c85d → b340d6b5 → 3c8e9a1c
  → f8ee5035(❌回退) → ef84c137 → d28203a1(回退Semi) → 3e793e0e(修复分包)
```

**本轮总成果:**
| 指标 | 优化前 | 优化后 | 变化 |
|------|--------|--------|------|
| 首屏 JS (minified) | 5,400KB | ~1,650KB | **-70%** |
| Semi CSS | 1.16MB | 1.16MB | 未变（回退） |
| PG 缓存命中 | 低 | 高 | ✅ 8 项热加载 |
| Swap | 0 | 4GB | ✅ OOM 安全网 |
| 自动备份 | 无 | 每 6h | ✅ |
| Redis 保护 | 无限制 | 2GB+LRU | ✅ |
| Docker 镜像 | debian | alpine 108MB | ✅ |
| Docker 构建 | 容器内 bun build | pre-built dist | ✅ 一致性 |

### 2026-03-16 — OpenToken 品牌 + 交互修复
- **品牌重塑**: Aurora → OpenToken（名称/Logo/Favicon/Footer/侧栏菜单）
- **模型广场**: PricingCardView 纯 Tailwind 重写，滚动修复，价格垂直排列
- **充值页**: 去蓝色渐变 banner，3 列统计网格
- **首页 Hero**: 简化为 5xl semibold，10 个供应商图标
- **语言选择器**: 重写为 Radix DropdownMenu
- **SideSheet**: 全部统一右侧滑出
- **系统设置**: 修复系统名称/Logo 不生效（localStorage + input id 绑定）
- **对齐修复**: 导航栏 h-9 统一，密钥页按钮/输入框对齐，ghost 按钮加边框
- **FormField**: pure prop 传递修复
- **Tags**: v0.4.0 ~ v0.4.5-opentoken

### 2026-03-15 (晚间) — UI 差异化 Phase 1-6 + 收尾
- 品牌/配色/字体/表格/侧边栏/按钮/标签/表单/弹窗/图表/动画
- 386 处硬编码颜色 → 主题 token
- shadow/rounded/border 清理
- Tag: v0.2.0-aurora

### 2026-03-15 (下午) — 安全审计模块 v1
- 后端 + 前端 + ES 集成 + 默认规则 + 异步中间件

### 2026-03-15 (上午) — Bug 修复 + 文档
- Tailwind 颜色/Form.Select/TextArea/导航菜单修复
- UPSTREAM-SYNC.md + newapi.md 创建

### 2026-03-14 ~ 03-15 — SideSheet/Avatar/Typography/Tag 修复

### 2026-03-13 ~ 03-14 — Phase 0-7 主体迁移

### 2026-03-27 — Playground功能测试 + 上游价格同步修复 + Token亲和性 + 额度显示优化

**commit `85e160b9`**

#### Playground 功能测试页面 (新增)
- **6个测试场景** 分两组:
  - 基础功能: 基础对话、Function Calling、Streaming
  - 工具兼容性: Claude Code、Cursor、Cline/Continue
- **管理员渠道选择**: 选渠道后模型列表联动过滤(读渠道 models 字段)
- **渠道指定机制**: token后缀 `sk-xxx-channelId`，100%走指定渠道
- **API格式自动检测**: 模型名含 claude/anthropic → Anthropic，否则 → OpenAI
- **流式解析**: 真正解析 SSE 数据块，分析 tool_use/tool_calls
- **测试汇总面板**: 实时显示通过/失败统计 + 耗时
- **cURL一键复制 + 响应折叠展示**
- **PlaygroundEnabled 运营开关**: constants/option/status/localStorage/sidebar/设置UI 完整链路
- 文件: `web/src/pages/Playground/index.jsx` (~985行)
- 路由: `/console/playground`, 侧栏 FlaskConical 图标

#### 上游价格同步修复
- **复制模型名修复**: navigator.clipboard fallback 到 execCommand('copy')
- **对比预览修复**: 添加 debug logging, Tab 点击自动触发对比
- **对比功能**: 拿上游模型和系统现有倍率/价格比较，显示新增/变更/无变化

#### Channel Affinity — Token 亲和性规则
- 新增第3条默认规则: `token affinity`
- key source: `context_int:id` (token/用户维度)
- 匹配: 所有模型 `.*`, 路径 `/v1/chat/completions`, `/v1/messages`, `/v1/responses`
- TTL: 600s, 包含 using_group + rule_name
- 优先级: Codex CLI → Claude CLI → Token 通用

#### 令牌额度显示优化
- 隐藏进度条百分比文字，只显示剩余/总量

**关键文件:**
- `controller/upstream_pricing_sync.go` — 上游价格同步后端 (693行)
- `web/src/components/settings/UpstreamPricingSyncSetting.jsx` — 上游价格同步前端 (589行)
- `web/src/pages/Playground/index.jsx` — 功能测试页面 (985行)
- `setting/operation_setting/channel_affinity_setting.go` — 亲和性规则
- `web/src/pages/Setting/Operation/SettingsGeneral.jsx` — PlaygroundEnabled 开关

---

### 2026-03-27 ~ 2026-03-28: 模型鉴真功能 + 自动巡检

#### 模型鉴真页面 (Model Verify)
- **后端**: `POST /api/model/verify` — 5维度检测 (is_claude 70%, not_reverse 20%, thinking 3%, signature 3%, tools 4%)
- **前端**: `/console/model-verify` — admin-only 页面，评分环 + 检测详情 + 模型自述
- 渠道选择器显示所有渠道（标注类型标签），选择后动态加载渠道模型列表
- 侧栏 `useSidebar.js` DEFAULT_ADMIN_CONFIG 注册 `model-verify: true`

#### 模型鉴真自动巡检引擎
- **新增 `ChannelStatusVerifyDisabled = 4`**: 鉴真禁用状态，系统自带测试不会恢复
- **渠道新字段**: `auto_verify` (开关), `verify_model`, `last_verify_time`, `last_verify_score`
- **巡检逻辑**: 每1分钟扫描，每5分钟对开启 auto_verify 的渠道执行鉴真
  - 启用中 + 分数<70 + 连续2次 → 自动禁用(status=4) + 通知管理员
  - 鉴真禁用 + 分数≥70 → 自动恢复(status=1) + 通知管理员
  - 网络错误不算掺假，不触发禁用
- **防冲突**: 系统自带 `testAllChannels` 跳过 status=4 渠道，`ShouldEnableChannel` 只恢复 status=3
- **渠道编辑页**: 新增「自动鉴真」开关
- **渠道列表**: status=4 显示橙色「鉴真禁用」标签

#### SplitButtonGroup 按钮对齐修复
- `button.jsx` 新增 `icon-sm` 尺寸变体 (h-8 w-8)
- `Button.jsx` compat 层: icon-only + size=small → icon-sm，与 sm 按钮等高

**关键文件:**
- `controller/model_verify.go` — 鉴真检测 API (485行)
- `controller/model_verify_patrol.go` — 自动巡检引擎 (154行)
- `web/src/pages/ModelVerify/index.jsx` — 鉴真前端页面 (410行)
- `common/constants.go` — ChannelStatusVerifyDisabled = 4
- `model/channel.go` — auto_verify/verify_model/last_verify_time/last_verify_score 字段

**Commits:**
- `292da58a` feat: 添加模型鉴真功能页面
- `76ace910` fix: 模型鉴真侧栏可见性+渠道模型联动选择
- `c3f513fd` feat: 模型鉴真自动巡检 — status=4鉴真禁用，渠道auto_verify开关，5分钟巡检引擎
- `277b8979` fix: SplitButtonGroup icon-only按钮高度对齐 — 新增icon-sm尺寸

---

### 2026-03-28 — 上游关键修复同步 + 计费重构 + 审计安全修复

#### 上游 🔴 关键修复 cherry-pick (commit: `5ff73e35`)
从上游 QuantumNous/new-api 手动同步 5 个关键修复:
1. **`ded4a124`** — `dto/openai_request.go`: Detail 字段加 omitempty，防止空 detail 发到上游
2. **`62b9aaa5`** — `relay/channel/task/taskcommon/helpers.go`: metadata 删除 model 字段防计费模型覆盖
3. **`e520977e`** — `relay/channel/claude/adaptor.go`: Claude beta query 时序修复，在最终 URL 阶段追加
4. **`b09337e6`** — `middleware/distributor.go` + `service/channel_affinity.go`: affinity 首选渠道被禁用时 skip-retry → 403
5. **`926e1781`** — `service/convert.go`: OpenAI→Claude 转换保留 cache usage (CachedCreationTokens, CachedTokens, 5m/1h)

#### 上游计费重构合并 (commit: `5ead0d0b`)
- **`9ecad906`**: `PostClaudeConsumeQuota` + `postConsumeQuota` → 统一 `PostTextConsumeQuota` (新文件 `service/text_quota.go`, 427行)
- **`d4a470a6`**: OpenRouter 计费语义修复 — cache token 从 prompt 分离计费
- 12 个 handler 调用点迁移 (compatible/claude/gemini/embedding/rerank/image/audio/responses)
- `relay/compatible_handler.go` 从 512 → 227 行 (移除 postConsumeQuota 284 行)
- 新增字段: `dto.Usage.UsageSemantic/UsageSource`, `RelayInfo.ParamOverrideAudit`
- `service/log_info_generate.go`: appendFinalRequestFormat + appendParamOverrideInfo
- **7 个单元测试全部 PASS** (text_quota_test.go)

#### ⚠️ 审计日志安全修复 (commit: `af63cb08`)
- **漏洞**: 普通用户获得审计权限后可看到同 group 所有人的审计日志（含 prompt 内容）
- **修复**: SearchAuditLogsHandler/GetAuditStatsHandler 非管理员强制按 user_id 过滤
- **新增**: SearchParams.UserId 字段, GetAuditStats userId 参数
- 管理员不受影响

#### 审计日志覆盖不全修复 (commit: `91f02537`)
- **原因**: ExtractPromptFromRequest 只处理 *dto.GeneralOpenAIRequest
- Claude `/v1/messages` 走 *dto.ClaudeRequest → content 数组时提取为空 → 不记录
- Gemini 走 *dto.GeminiChatRequest → 结构不同 → 不记录
- **修复**: 新增 ClaudeRequest/GeminiChatRequest/multimodal 专用提取
- 辅助函数: extractClaudeMessageContent, extractGeminiParts, extractContentFromMap

#### UI: 审计侧栏命名优化 (commit: `59a98cad`)
- 安全审计下「日志」→「审计」，避免与请求日志混淆
- i18n 7 语言同步

**部署状态:**
| 环境 | 状态 | commit |
|------|------|--------|
| 开发 (154.40.40.48:3000) | ✅ 已部署 | `59a98cad` |
| 测试 (154.36.173.198) | ⏳ 待部署 | |
| 生产 (38.58.59.161) | ⏳ 待部署 | |

---

### 2026-03-31: AWS Bedrock Beta Flags 过滤 + LibreChat 移除

#### AWS Bedrock Beta Flags 过滤 (commit: `9bae049f`)
- **问题**: Claude Code/Desktop 发送 Bedrock 不支持的 beta flags 导致 400 错误
  - `context-management`, `prompt-caching-scope`, `prompt-caching`, `extended-thinking`
- **修复**: `relay/channel/aws/dto.go` 新增 `isBedrockSupportedBeta()` 白名单过滤
- **支持的 flags**: `computer-use-2025-01-24`, `tools-2024-*`, `messages-2023-12-15`, `max-tokens-3-5-sonnet-2022-07-15`
- **不支持的 flags**: 自动过滤，不发送给 Bedrock
- 修复 Claude Code 使用 OpenToken + Bedrock 的兼容性问题

#### LibreChat 集成移除 (commit: `894a48c9`)
- 移除 `controller/librechat.go` + `controller/librechat_proxy.go`
- 移除 `/chat/*` 路由和 `/api/librechat/*` API 端点
- 移除前端 Chat 页面 (`web/src/pages/Chat/index.jsx`)
- 清理侧栏聊天菜单项
- 保留: Bedrock beta flags 过滤功能

**部署状态:**
| 环境 | 状态 | commit |
|------|------|--------|
| 开发 (154.40.40.48:3000) | ✅ 已部署 | `894a48c9` |
| 测试 (154.36.173.198) | ⏳ 待部署 | |
| 生产 (38.58.59.161) | ⏳ 待部署 | |

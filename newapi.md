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
- `ModelRatioSettings.jsx` / `GroupRatioSettings.jsx` 存在同类闭包 bug（未修复）

### 可继续优化的方向
- [ ] 更多页面的细节打磨（根据用户反馈）
- [ ] 移动端适配优化
- [ ] 暗色模式细节调整
- [ ] 审计模块 v2（更多规则类型、导出功能）
- [ ] 上游同步（QuantumNous/new-api 新功能合并）
- [ ] Chat 组件脱离真实 Semi → 才能彻底移除 Semi CSS（1.16MB）
- [ ] 巨型文件拆分（EditChannelModal 4101行、ParamOverrideEditorModal 3511行、render.jsx 3027行）
- [ ] 官方定价配置（AWS Claude / OpenAI / Gemini ModelRatio + CompletionRatio）
- [ ] 香港服务器部署（api.oneaiai.com 待确认 IP 和域名）
- [ ] PG 重启生效：shared_buffers 8GB + max_connections 300 + wal_buffers 64MB

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

---

## 🔧 构建 & 部署速查

```bash
# 构建前端
export PATH="$HOME/.bun/bin:$PATH"
cd /opt/apps/newapis/web
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Docker 构建部署
cd /opt/apps/newapis
docker compose down
docker build -t newapi-aurora:latest .
docker compose up -d

# 推送代码
git push nomoapi feat/shadcn-ui
git push opentoken feat/shadcn-ui

# 打 tag
git tag v0.x.x-opentoken
git push nomoapi v0.x.x-opentoken
git push opentoken v0.x.x-opentoken
```

---

## 📅 更新日志

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

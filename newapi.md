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
- semi.css 仍在 index.jsx 加载（Chat 依赖）
- ModelTestModal 白屏（遗留 bug，未修复）
- 上游 test channel 502（nginx bad gateway，非代码问题）

### 可继续优化的方向
- [ ] 更多页面的细节打磨（根据用户反馈）
- [ ] 移动端适配优化
- [ ] 暗色模式细节调整
- [ ] 审计模块 v2（更多规则类型、导出功能）
- [ ] 上游同步（QuantumNous/new-api 新功能合并）
- [ ] 性能：进一步 chunk 拆分、图片懒加载
- [ ] Chat 组件脱离真实 Semi（难度高）

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

### 2026-03-17 — 系统优化（P0-P3）

#### Bug 修复
- **字体颜色全局优化**: 42 个文件，统一四级透明度体系（`foreground` 100%/70%/55-60%/45-50%），`--muted-foreground` 35%，侧栏/导航/图标全部加深 (commit: `1aa1ed3f`)
- **Form.Select 重复 extraText**: 渠道编辑弹窗"填入相关模型"按钮显示两行，移除 FormSelect 内部多余渲染，保留 FormField 统一渲染 (commit: `0cadef18`)
- **Dashboard Settings 闭包 Bug**: 5 个设置页 onChange 使用 `{...form}` 导致字段互相覆盖，改为函数式更新 `prev => ({...prev})` (commit: `ec0677e4`)

#### P0: 自动备份 (commit: `2f54c85d`)
- 备份脚本: `/opt/apps/newapis/scripts/pg-backup.sh`（支持 `--production` 参数）
- 本机 cron: 每 6 小时自动备份
- 生产 cron: 每 6 小时自动备份 + 本机每 12 小时拉取远程备份
- 30 天保留，最多 60 份，自动清理

#### P1: 性能调优
**PostgreSQL（生产已生效，无需重启）:**
- `effective_cache_size`: 4GB → 24GB
- `work_mem`: 4MB → 16MB
- `maintenance_work_mem`: 64MB → 512MB
- `random_page_cost`: 4 → 1.1（SSD 优化）
- `effective_io_concurrency`: 1 → 200
- `max_parallel_workers_per_gather`: 2 → 4
- `max_wal_size`: 1GB → 2GB
- 慢查询日志: >1 秒记录（`log_min_duration_statement = 1000`）
- ⏳ 待重启生效: `shared_buffers` 128MB→8GB, `max_connections` 100→300, `wal_buffers` 4MB→64MB

**Swap（生产已生效）:**
- 添加 4GB swap，swappiness=10，已写入 fstab

**首屏包体积优化 (commit: `b340d6b5`):**
- 主入口 JS: 5,400KB → 1,082KB（gzip 1,290KB → 515KB，减少 60%）
- Vite `manualChunks` 从静态对象改为函数，精细分包
- 拆分 `helpers/lobe-icons.jsx`（`import * as LobeIcons` 从 render.jsx 剥离，避免 3.8MB 图标污染主包）
- 新增独立 chunk: `lobe-icons`(3.8MB), `markdown-vendor`(3.1MB), `page-channels`(343KB), `page-settings`(308KB), `page-playground`(67KB), `compat-layer`(126KB), `lucide-icons`(57KB), `form-libs`

#### P2: Redis 安全加固 (commit: `3c8e9a1c`)
- 运行时已生效: `maxmemory 2GB`, `allkeys-lru` 淘汰策略
- 新增 `redis.conf`: RDB 持久化、禁用 FLUSHDB/FLUSHALL、连接超时/keepalive
- docker-compose 更新: 挂载 redis.conf + redis_data volume（下次重启生效）

#### P3: 代码结构优化
- 🔲 巨型文件拆分
- 🔲 Docker 镜像瘦身
- 🔲 Semi CSS 清理
- 🔲 监控告警

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

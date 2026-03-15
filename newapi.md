# New API Aurora — UI 迁移项目追踪

> **快速恢复口令**: 跟我说「继续 newapi 项目」或「看看 newapi.md」，我会先读这个文件，立刻知道做到哪了。

---

## 📍 项目信息

- **项目路径**: `/opt/apps/newapis`
- **前端路径**: `/opt/apps/newapis/web`
- **分支**: `feat/shadcn-ui`
- **服务地址**: `http://154.40.40.48:3000`
- **Docker 镜像**: `newapi-aurora:latest`
- **GitHub**: `xizaihui/nomoapi` + `xizaihui/opentoken`
- **上游**: `QuantumNous/new-api` (origin/main)
- **同步指南**: `/opt/apps/newapis/UPSTREAM-SYNC.md`

---

## ✅ 已完成

### Phase 0 — 基础设施 `2f4fe2ae`
- 安装 shadcn/ui 全套依赖（Radix UI、tailwindcss-animate、lucide-react、sonner 等）
- 创建 `src/components/ui/`（21 个基础组件）
- 创建 `src/lib/utils.js`（cn 工具函数）
- 配置 `components.json`、`tailwind.config.js` shadcn 色彩系统

### Phase 1 — 兼容层 `eef12e7c`
- 创建 `src/components/compat/`（31 个组件包装器）
- 桶文件 `index.js` 导出所有 Semi API 兼容组件

### Phase 2 — 激活别名 `cdd42836`
- Vite alias: `@douyinfe/semi-ui` → compat 层
- `@douyinfe/semi-ui__real` 逃生通道给 Chat 组件
- 构建通过，18277+ 模块

### Phase 2.5 — 复杂组件迁移 `fa117dcf`
- 9 个复杂组件脱离真实 Semi 直通

### Phase 3 — Table 迁移 `8d028e0a`
- 完整 Table compat，支持分页、展开行、排序

### Phase 4 — Form 迁移 `d7ac1a49`
- 自定义 formApi 实现（getValue/setValue/setValues/reset/validate/submitForm）
- Form.Input / Form.TextArea / Form.Select / Form.Switch / Form.Checkbox / Form.InputNumber / Form.DatePicker

### Phase 5 — 全局样式 `58f60f1b`
- shadcn 色彩系统覆盖
- 196 个 `--semi-color-*` 桥接变量指向 shadcn HSL 变量

### Phase 6 — 布局重构 `abc5ad3c`
- PageLayout / HeaderBar / SiderBar 全部重写

### Phase 7 — Tailwind 类迁移 `b321429d`
- 替换所有 75 个 `semi-color-*` Tailwind 类引用

### 图标迁移 `d0ed833c`
- 63 个 Semi → Lucide 图标映射
- 88 个文件从 `@douyinfe/semi-icons` 迁移到 `@/components/compat/icons`

### CSS 清理 `6caf52b3`
- 移除 73 个 `.semi-` 选择器（96 → 23，剩余全是 `.semi-chat-*`）
- 替换为 `data-slot` 属性选择器和自定义类名

### 性能优化 `e17b55c1` `6ce84cd3`
- 22 个页面 `React.lazy()` 懒加载
- 手动 chunk 分割（shadcn-ui、charts）
- 主 bundle 7.4MB → 5.4MB（gzip 1827KB → 1259KB）
- Calendar/DatePicker 纯 JS 实现（不依赖 react-day-picker）
- Semi UI chunk 隔离到 Playground 页面

### Bug 修复合集

| 问题 | 修复 | Commit |
|------|------|--------|
| Modal 命令式 API（confirm/info/warning） | createRoot portal 实现 | `0d3450e0` |
| Form.Input 显示 [object Object] | `_noInject` prop 跳过 cloneElement | `ab05b29b` |
| 使用日志页空白 | Table expandRowByClick + Form.Select.Option | `012673d9` |
| Dropdown 空白页 | 嵌套交互元素检测 + Dropdown.Title | `d0ed833c` |
| VChart 主题 | Semi 主题桥接 + ThemeManager 同步 | `ccca3aa7` |
| 250 个内联 semi-color 变量 | 全部替换为 shadcn 变量 | `ccca3aa7` |
| Select 空值崩溃 | EMPTY_SENTINEL 哨兵值 | `0d246b52` |
| SideSheet 只显示一半 | 纯 Portal 重写，z-index 10000 | `c241c59c` `bbf9dae1` |
| SideSheet 提交按钮无效 | submitRef 模式连接 formApi | `d4e69193` |
| SideSheet 白色页脚/透明背景 | hsl(var(--*)) 包装 + 移除 bg-white | `d4e69193` `f1ebf0e0` |
| Avatar 颜色太淡 | 移除 AvatarFallback 默认 bg-muted | `93ec7aad` |
| Typography 文字不可见 | 显式 gray 类替代 opacity 修饰符 | `11c31b99` |
| Tag 白字白底 | 自动检测 style.color='white' 切换变体 | `011d7a79` |
| Tailwind 标准颜色全部失效 | theme.colors 补全完整调色板 | `910bab39` |
| Form.Select multiple 崩溃 | 自定义多选下拉（搜索/标签/创建） | `92ea4a15` |
| Form.TextArea 高度太小 | autosize 支持 minRows/maxRows | `042fcbc7` |

### UI 调整
- 顶部导航菜单靠右 `2a3b699b`

---

## 🔴 当前状态

### 做到哪了
- UI 框架迁移主体完成（Phase 0-7 + 所有 bug 修复）
- **安全审计模块 v1 完成**：后端 audit/ 包 + 前端 features/audit/ + ES 集成 + 12 条默认规则
- 38 个 commits，262+ 文件变更
- 已部署运行：new-api + PostgreSQL + Redis + Elasticsearch
- 代码已推送到 GitHub 两个仓库

### 卡点
- **ES 初始化延迟**: ES 启动慢（~20秒），已改为异步等待连接，不阻塞主服务
- **审计侧边栏图标**: 目前用的是 renderNavItem 默认图标，后续可以换 Shield / BookOpen 图标
- **ModelTestModal 白屏**: 之前遗留的问题，点渠道测试按钮可能白屏
- **Chat 组件锁定真实 Semi**: 无法全面移除 semi.css

### 下一步
1. **测试审计功能** — 用户管理页给用户开启审计开关，然后用 API Key 调 chat completions 触发审计
2. **用户管理页集成审计开关** — 在用户列表加一列"审计开关"按钮
3. **逐页 UI 打磨** — 检查每个页面视觉效果
4. **ModelTestModal 白屏排查**
5. **Docker 镜像优化**

---

## 🧠 关键决策记录

| 决策 | 原因 |
|------|------|
| Vite 别名 + compat 层 | 上游代码零修改，merge 冲突最小化 |
| Chat 保留真实 Semi | API 太复杂，隔离到 lazy 页面 |
| 纯 Portal SideSheet | Radix Dialog 居中定位与侧面板冲突 |
| theme.colors 而非 extend | 需要同时包含 Semi 变量和 shadcn 变量 |
| submitRef 模式 | formApi 在 useMemo 中创建，handleSubmit 还不存在 |
| 桥接变量而非源码替换 | 219 个文件引用 --semi-color-*，桥接更安全 |
| Calendar 纯 JS | date-fns v3/v4 与现有 date-fns-tz 冲突 |
| 手动迁移 semi-icons | Chat 内部依赖阻止全局别名 |

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
```

---

## 📅 更新日志

### 2026-03-15 (下午)
- 安全审计模块 v1 完成
- 后端: audit/ 包（model, controller, router, scanner, elasticsearch, seed）
- 前端: features/audit/（AuditLogsPage, AuditRulesPage, API hooks, constants）
- ES 集成: 按月分索引、异步写入、聚合统计、全文搜索
- 12 条默认审计规则（5 大类）
- 异步审计中间件（不阻塞用户请求）
- 权限控制: 管理员默认有权限，普通用户按 audit_configs 表开关
- Docker: 新增 Elasticsearch 8.15.0 服务（512MB JVM heap）
- ES 连接改为异步等待（解决启动顺序问题）
- 上游入口改动仅 4 个文件（main.go, router/main.go, relay/compatible_handler.go, docker-compose.yml）

### 2026-03-15 (上午)
- 修复 Tailwind 标准颜色缺失（根因：theme.colors 完全替换）
- 修复 Form.Select multiple 崩溃（原生 select 不支持多选数组）
- 修复 Form.TextArea autosize 高度
- 导航菜单靠右
- 创建 UPSTREAM-SYNC.md 同步指南
- 创建 newapi.md 项目追踪文件
- 推送到 GitHub

### 2026-03-14 ~ 03-15（凌晨）
- SideSheet 完整重写（3 轮迭代）
- Avatar/Typography/Tag 颜色修复
- Form.submitForm() 修复
- CSS 清理、性能优化、图标迁移

### 2026-03-13 ~ 03-14
- Phase 0-7 主体迁移
- Modal/Dropdown/VChart/DatePicker 等复杂组件修复
- 布局重构、全局样式覆盖

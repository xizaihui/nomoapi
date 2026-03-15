# New API Aurora — UI 迁移架构文档 & 上游同步指南

## 📋 项目概述

本项目基于 [QuantumNous/new-api](https://github.com/QuantumNous/new-api)，将前端 UI 框架从 **Semi Design** 迁移至 **shadcn/ui**（Radix UI + Tailwind CSS），同时保留所有后端功能不变。

**分支**: `feat/shadcn-ui`  
**上游**: `origin/main` → `https://github.com/QuantumNous/new-api.git`  
**仓库**: `xizaihui/nomoapi` + `xizaihui/opentoken`

---

## 🏗️ 架构设计

### 核心策略：Vite 别名 + 兼容适配层

```
上游代码: import { Button, Modal } from '@douyinfe/semi-ui'
              ↓ (Vite alias)
实际加载: src/components/compat/index.js → 兼容层包装器
              ↓
底层渲染: shadcn/ui (Radix UI + Tailwind CSS)
```

**关键点**: 上游的 `import` 语句完全不需要修改。Vite 在构建时自动将 `@douyinfe/semi-ui` 重定向到我们的兼容层。

### 目录结构

```
web/src/components/
├── compat/          # 🔑 兼容适配层（54个文件）
│   ├── index.js     # 桶文件，导出所有 Semi API 兼容组件
│   ├── Button.jsx   # Semi Button → shadcn Button
│   ├── Modal.jsx    # Semi Modal → Radix Dialog
│   ├── Form.jsx     # Semi Form → 自定义 formApi 实现
│   ├── Table.jsx    # Semi Table → 自定义表格实现
│   ├── Select.jsx   # Semi Select → Radix Select
│   ├── SideSheet.jsx # Semi SideSheet → 纯 Portal 实现
│   ├── icons.js     # Semi Icons → Lucide React 映射（63个图标）
│   ├── illustrations.js # Semi Illustrations → Lucide 替代
│   └── ...          # 其他组件包装器
├── ui/              # shadcn/ui 基础组件（21个文件）
│   ├── button.jsx
│   ├── dialog.jsx
│   ├── select.jsx
│   └── ...
└── ...              # 其他业务组件
```

### Vite 别名配置（vite.config.js）

```js
alias: [
  { find: /^@douyinfe\/semi-ui$/, replacement: '/src/components/compat/index.js' },
  { find: '@douyinfe/semi-ui__real', replacement: '@douyinfe/semi-ui' },  // 逃生通道
  { find: '@', replacement: '/src' },
]
```

- `@douyinfe/semi-ui` → 兼容层（所有业务代码自动走这里）
- `@douyinfe/semi-ui__real` → 真实 Semi（仅 Chat 组件使用）
- `@douyinfe/semi-icons` → 不能别名（Chat 内部依赖），改为手动迁移 88 个文件

### CSS 层级

```
tailwind-base → semi → tailwind-components → tailwind-utils
```

- Semi CSS（`semi.css`）仍然加载，仅供 Chat 组件使用
- `--semi-color-*` 桥接变量（196个）指向 shadcn HSL 变量
- `tailwind.config.js` 包含完整 Tailwind 调色板 + shadcn 变量

### 唯一保留真实 Semi 的组件

**Chat 组件**（Playground 页面）— API 太复杂无法重写，通过 `React.lazy()` 隔离加载，Semi UI chunk（1.4MB）只在访问 Playground 时加载。

---

## 🔄 上游同步操作步骤

### 前提条件

```bash
cd /opt/apps/newapis
git remote -v
# origin = https://github.com/QuantumNous/new-api.git (上游)
# nomoapi = https://github.com/xizaihui/nomoapi.git (你的)
# opentoken = https://github.com/xizaihui/opentoken.git (你的)
```

### 步骤 1: 拉取上游最新代码

```bash
git fetch origin
```

### 步骤 2: 查看上游有哪些变更

```bash
# 查看上游 main 与我们 feat/shadcn-ui 的差异文件
git log --oneline origin/main --not feat/shadcn-ui | head -20

# 查看上游变更了哪些前端文件
git diff --name-only feat/shadcn-ui...origin/main -- web/
```

### 步骤 3: 合并上游代码

```bash
git checkout feat/shadcn-ui
git merge origin/main
```

### 步骤 4: 处理冲突

冲突大概率出现在以下文件，按优先级处理：

#### ⚠️ 高冲突风险（几乎每次都会冲突）

| 文件 | 处理方式 |
|------|----------|
| `web/package.json` | 保留双方依赖，确保 shadcn 依赖不丢失 |
| `web/bun.lock` | 冲突后执行 `cd web && bun install` 重新生成 |
| `web/vite.config.js` | **必须保留我们的 alias 配置**，合并上游其他改动 |
| `web/tailwind.config.js` | **必须保留我们的完整配置**，合并上游新增 |
| `web/src/index.css` | 保留我们的 shadcn CSS 变量 + 桥接变量 |

#### ⚡ 中等冲突风险

| 文件 | 处理方式 |
|------|----------|
| `web/src/App.jsx` | 保留我们的 lazy loading + ErrorBoundary 包装 |
| `web/src/components/layout/*` | 保留我们的 PageLayout/HeaderBar/SiderBar |
| `web/src/components/playground/*` | 保留 `__real` import |

#### ✅ 低冲突风险（大部分业务文件）

上游新增/修改的业务组件（如 `src/components/table/channels/modals/NewModal.jsx`）通常**不会冲突**，因为它们的 `import { xxx } from '@douyinfe/semi-ui'` 会自动被 Vite 别名重定向到我们的兼容层。

### 步骤 5: 检查新增的 Semi 组件

```bash
# 查看上游是否引入了我们兼容层还没有的 Semi 组件
cd web
grep -rh "from '@douyinfe/semi-ui'" src/ --include="*.jsx" --include="*.js" | \
  grep -v node_modules | sort -u
```

如果发现新组件（如 `import { NewComponent } from '@douyinfe/semi-ui'`），需要：
1. 在 `src/components/compat/` 创建对应的包装器
2. 在 `src/components/compat/index.js` 导出

### 步骤 6: 检查新增的 Semi Icons

```bash
grep -rh "@douyinfe/semi-icons" src/ --include="*.jsx" --include="*.js" | \
  grep -v node_modules | grep -v "compat/icons" | sort -u
```

如果有新图标引用，在 `src/components/compat/icons.js` 添加映射，并修改对应文件的 import。

### 步骤 7: 构建测试

```bash
export PATH="$HOME/.bun/bin:$PATH"
cd /opt/apps/newapis/web
NODE_OPTIONS="--max-old-space-size=4096" bun run build
```

如果构建失败，常见原因：
- 兼容层缺少组件导出 → 补充 `compat/index.js`
- 新的 Semi API 未实现 → 在对应 compat 文件添加 prop 支持
- 依赖冲突 → `bun install` 重新锁定

### 步骤 8: Docker 构建部署

```bash
cd /opt/apps/newapis
docker compose down
docker build -t newapi-aurora:latest .
docker compose up -d
```

### 步骤 9: 推送到 GitHub

```bash
git push nomoapi feat/shadcn-ui
git push opentoken feat/shadcn-ui
```

> ⚠️ 如果上游 merge 带入了 `.github/workflows/` 文件：
> ```bash
> git rm --cached -r .github/workflows/
> git commit -m "chore: remove workflow files"
> ```

---

## 🛡️ 绝对不能改的文件

以下文件是 UI 迁移的核心，合并冲突时**始终保留我们的版本**：

```
web/vite.config.js          # Vite 别名（alias 配置）
web/tailwind.config.js      # 完整调色板 + shadcn 变量
web/src/components/compat/* # 整个兼容层
web/src/components/ui/*     # shadcn 基础组件
web/src/lib/utils.js        # cn() 工具函数
web/components.json         # shadcn 配置
```

## 📦 我们新增的依赖（package.json 合并时保留）

```
@radix-ui/react-*        # Radix UI 原语（多个包）
class-variance-authority  # cva() 变体管理
clsx                      # 类名合并
tailwind-merge            # Tailwind 类名去重
tailwindcss-animate       # 动画插件
lucide-react              # 图标库（替代 semi-icons）
sonner                    # Toast 通知
cmdk                      # 命令面板
```

## 📊 变更统计

- **兼容层**: 54 个文件，覆盖 48+ 个 Semi 组件
- **UI 基础**: 21 个 shadcn/ui 组件
- **图标映射**: 63 个 Semi → Lucide 图标
- **总变更**: 243 文件, +6736 / -850 行
- **我们的 commits**: 34 个（在 `feat/shadcn-ui` 分支）

## 🔧 常见问题

### Q: 上游新增了一个页面，怎么办？
A: 什么都不用做。新页面的 `import { xxx } from '@douyinfe/semi-ui'` 会自动走兼容层。只需确认用到的 Semi 组件都在 compat 里有导出。

### Q: 合并后某个页面报错 "xxx is not exported"？
A: 上游用了新的 Semi 组件。在 `compat/index.js` 添加导出，必要时创建新的包装器文件。

### Q: 合并后样式不对？
A: 检查 `tailwind.config.js` 和 `index.css` 的冲突是否正确解决。确保 shadcn CSS 变量和桥接变量都在。

### Q: Chat/Playground 页面异常？
A: Chat 使用真实 Semi（`@douyinfe/semi-ui__real`），确保 `semi.css` 仍在 `index.jsx` 中加载。

### Q: 构建 OOM？
A: 确保 `NODE_OPTIONS="--max-old-space-size=4096"` 且系统有 swap（`/swapfile` 4GB）。

---

*最后更新: 2026-03-15*

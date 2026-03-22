# MEMORY.md — 长期记忆

> 每次新会话我会自动读这个文件，立刻知道所有项目状态。

---

## 🔑 核心项目：OpenToken (New API)

### 快速恢复
**一句话唤醒**: "继续 OpenToken" 或 "看看 newapi.md"
**项目状态文件**: `/opt/apps/newapis/newapi.md` ← **最完整的项目追踪文档，必读**
**上次更新**: 2026-03-22，commit `19cbc627`

### 项目概要
- Go + React 全栈 Web 应用，API 管理平台
- 前端从 Semi UI 迁移到 shadcn/ui（通过 compat 兼容层）
- 包含审计系统 (Elasticsearch)、多语言 i18n、暗色模式

### 三环境
| 环境 | 地址 | 部署方式 |
|------|------|----------|
| 开发 | 154.40.40.48:3000 | 本机 Docker |
| 测试 | 154.36.173.198 (api.opentokens.net) | SSH deploy |
| 生产 | 38.58.59.161 (api.opentoken.io) | SSH deploy |

### 关键路径
- 项目: `/opt/apps/newapis` (本机), `/opt/apps/opentoken` (远程)
- 前端: `/opt/apps/newapis/web`
- 分支: `feat/shadcn-ui`
- Git remotes: `nomoapi` + `opentoken`
- 服务器密码: `***REDACTED***` (生产+测试)

### 部署流程
```
rm -rf dist node_modules/.vite → bun run build → docker build --no-cache → 
docker compose up -d --force-recreate --no-deps new-api
```
- 测试服务器 Docker 需要 `--network=host`
- 远程部署: SCP dist → docker build → restart
- **必须先 rm -rf dist 再 build，否则旧文件混入**

### 当前设计风格
- 黑白灰基调 + 钢蓝(hue 215)点缀
- 高端、现代、稳重、极简
- 禁止 AI 渐变、鲜艳彩色

### 恢复工作时的步骤
1. 先读 `/opt/apps/newapis/newapi.md` — 有完整进度、决策、commit 链
2. 看 `memory/` 最近日期文件 — 当日细节
3. 检查 `git log --oneline -5` — 确认当前位置
4. 不需要重新读全部代码，newapi.md 已记录所有关键文件位置

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
- 部署三环境用并行 SSH 加速
- `newapi.md` 是项目的"大脑"，每次重大更新后必须同步
- 日常记录写 `memory/YYYY-MM-DD.md`

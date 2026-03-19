---
name: ClawHub Skill 中转同步方案
description: 当 ClawHub CLI 受限时，通过 GitHub 中转来获取和安装 skill 的完整流程
---

# ClawHub Skill 中转同步方案

## 问题背景

ClawHub CLI (`clawhub install <skill>`) 存在以下限制：
- API 速率限制
- 搜索/安装服务不稳定
- 某些网络环境下连接超时

## 解决方案：GitHub 中转

### 核心思路

```
ClawHub ──下载──→ 本地 ──推送──→ GitHub ──获取──→ OpenClaw
```

### 详细步骤

#### 步骤 1：从 ClawHub 直接下载

**API 端点**：
```
https://wry-manatee-359.convex.site/api/v1/download?slug=<skill-name>
```

**示例**：
```bash
# 下载 skill
curl -L -o sales-pipeline-tracker.zip \
  "https://wry-manatee-359.convex.site/api/v1/download?slug=sales-pipeline-tracker"

# 解压
unzip sales-pipeline-tracker.zip -d sales-pipeline-tracker
```

**Skill 结构**：
```
sales-pipeline-tracker/
├── _meta.json    # 元数据 (ownerId, slug, version, publishedAt)
├── README.md     # 使用说明
└── SKILL.md      # 核心技能定义 (YAML frontmatter + Markdown)
```

#### 步骤 2：推送到 GitHub

```bash
# 克隆你的中转仓库
git clone https://github.com/<你的账号>/clawagent.git
cd clawagent

# 复制 skill 到 skills 目录
cp -r /path/to/sales-pipeline-tracker clawfile/skills/

# 提交并推送
git add clawfile/skills/sales-pipeline-tracker/
git commit -m "Add sales-pipeline-tracker skill from ClawHub"
git push origin main
```

**需要 GitHub Token**：
```bash
# 使用 Token 推送（避免交互式登录）
git remote set-url origin https://<TOKEN>@github.com/<账号>/<仓库>.git
git push origin main
```

#### 步骤 3：从 GitHub 安装到 OpenClaw

**方式 A：直接下载 raw 文件**（推荐，轻量）
```bash
SKILL_NAME="sales-pipeline-tracker"
TARGET_DIR="/root/.openclaw/skills/$SKILL_NAME"
BASE_URL="https://raw.githubusercontent.com/<账号>/<仓库>/main/clawfile/skills/$SKILL_NAME"

mkdir -p "$TARGET_DIR"
curl -sL "$BASE_URL/SKILL.md" -o "$TARGET_DIR/SKILL.md"
curl -sL "$BASE_URL/README.md" -o "$TARGET_DIR/README.md"
curl -sL "$BASE_URL/_meta.json" -o "$TARGET_DIR/_meta.json"
```

**方式 B：Sparse Clone**（适合批量）
```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/<账号>/<仓库>.git
cd <仓库>
git sparse-checkout set clawfile/skills/<skill-name>
```

### 自动化脚本

```bash
#!/bin/bash
# sync-skill.sh - 同步单个 skill 从 ClawHub 到 GitHub

SKILL_NAME=$1
GITHUB_REPO="<你的账号>/clawagent"
TOKEN="<你的 GitHub Token>"

# 1. 从 ClawHub 下载
TMP_DIR=$(mktemp -d)
curl -L -o "$TMP_DIR/$SKILL_NAME.zip" \
  "https://wry-manatee-359.convex.site/api/v1/download?slug=$SKILL_NAME"
unzip -q "$TMP_DIR/$SKILL_NAME.zip" -d "$TMP_DIR/$SKILL_NAME"

# 2. 推送到 GitHub
git clone "https://$TOKEN@github.com/$GITHUB_REPO.git" "$TMP_DIR/repo"
cp -r "$TMP_DIR/$SKILL_NAME" "$TMP_DIR/repo/clawfile/skills/"
cd "$TMP_DIR/repo"
git add .
git commit -m "Add $SKILL_NAME from ClawHub"
git push

# 3. 清理
rm -rf "$TMP_DIR"
```

## 为什么需要 GitHub 中转？

虽然可以直接从 ClawHub 下载到本地，但 GitHub 中转有以下优势：

| 对比项 | 直接本地下载 | GitHub 中转 |
|--------|-------------|------------|
| **稳定性** | ClawHub API 可能限流/超时 | GitHub 全球 CDN，更稳定 |
| **版本管理** | 本地文件易丢失 | Git 历史可追溯 |
| **多机同步** | 每台机器单独下载 | 统一仓库，各机一致 |
| **备份恢复** | 无备份 | GitHub 作为云备份 |
| **团队协作** | 难以共享 | 团队成员共用仓库 |
| **审查机制** | 直接安装，无审核 | 可 PR review 后再合并 |
| **离线安装** | 需要联网到 ClawHub | 内网可部署 GitHub 私有仓库 |

### 适用场景

**直接用 ClawHub**：
- 临时测试单个 skill
- 网络环境良好
- 不需要长期维护

**用 GitHub 中转**：
- 生产环境长期使用
- 多机器部署
- 团队共享技能库
- 需要版本控制和审计
- ClawHub 访问受限

## 已知 Skill 下载链接

| Skill | Slug | 下载 URL |
|-------|------|----------|
| Sales Pipeline Tracker | sales-pipeline-tracker | `?slug=sales-pipeline-tracker` |
| Self-Improving Agent | self-improving-agent | `?slug=self-improving-agent` |
| Agent Browser | agent-browser | `?slug=agent-browser-clawdbot` |
| Find Skills | find-skills | `?slug=find-skills` |

> 注：更多 skill 可在 https://clawhub.ai/skills 搜索获取 slug

## 安全提醒

1. **Token 安全**：GitHub Token 不要硬编码在脚本中，使用环境变量
2. **Skill 审查**：安装前检查 SKILL.md 内容，避免恶意指令
3. **VirusTotal 扫描**：ClawHub 已集成扫描，优先选择 "Benign" 标记的 skill

## 参考资料

- ClawHub: https://clawhub.ai
- OpenClaw Docs: https://docs.openclaw.ai
- Skill 格式规范：见 SKILL.md 文件结构

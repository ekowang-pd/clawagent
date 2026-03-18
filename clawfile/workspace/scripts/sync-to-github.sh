#!/bin/bash
# ~/.openclaw/ 目录增量同步脚本
# 每天晚上 12 点增量同步到 GitHub: ekowang-pd/clawagent/clawfile

set -e

SOURCE_DIR="$HOME/.openclaw"
REPO_URL="https://github.com/ekowang-pd/clawagent.git"
REPO_DIR="/tmp/clawagent-sync"
TARGET_BRANCH="main"
TARGET_PATH="clawfile"
LOG_FILE="$SOURCE_DIR/logs/sync-$(date +%Y%m%d).log"
LOCK_FILE="/tmp/clawagent-sync.lock"

# 防重复执行
if [ -f "$LOCK_FILE" ]; then
    echo "同步进行中，退出..."
    exit 0
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

# 创建日志目录
mkdir -p "$SOURCE_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========== 开始增量同步 =========="
log "源目录: $SOURCE_DIR"

# 检查 GitHub Token
if [ -z "$GITHUB_TOKEN" ]; then
    # 尝试从配置文件读取
    if [ -f "$SOURCE_DIR/.github-token" ]; then
        export GITHUB_TOKEN=$(cat "$SOURCE_DIR/.github-token")
        log "已从配置文件读取 Token"
    else
        log "⚠️ 未设置 GITHUB_TOKEN，push 会失败"
        log "请设置环境变量或将 token 写入 ~/.openclaw/.github-token"
    fi
fi

# 如果仓库已存在，直接拉取更新（增量）
if [ -d "$REPO_DIR/.git" ]; then
    log "检测到已有仓库，执行增量更新..."
    cd "$REPO_DIR"
    
    # 重置任何本地变更
    git reset --hard HEAD 2>/dev/null || true
    git clean -fd 2>/dev/null || true
    
    # 拉取最新代码
    if [ -n "$GITHUB_TOKEN" ]; then
        git pull https://$GITHUB_TOKEN@github.com/ekowang-pd/clawagent.git $TARGET_BRANCH 2>&1 || {
            log "拉取失败，尝试重新克隆..."
            rm -rf "$REPO_DIR"
        }
    else
        git pull origin $TARGET_BRANCH 2>&1 || {
            log "拉取失败，尝试重新克隆..."
            rm -rf "$REPO_DIR"
        }
    fi
fi

# 如果仓库不存在或拉取失败，重新克隆
if [ ! -d "$REPO_DIR/.git" ]; then
    log "克隆仓库: $REPO_URL"
    rm -rf "$REPO_DIR"
    
    if [ -n "$GITHUB_TOKEN" ]; then
        git clone "https://$GITHUB_TOKEN@github.com/ekowang-pd/clawagent.git" "$REPO_DIR" 2>&1
    else
        git clone "$REPO_URL" "$REPO_DIR" 2>&1
    fi
fi

# 准备目标目录
mkdir -p "$REPO_DIR/$TARGET_PATH"

cd "$REPO_DIR"

# 获取上次同步的哈希（用于记录）
LAST_SYNC_HASH=$(git log --oneline -1 -- "$TARGET_PATH/" 2>/dev/null | awk '{print $1}' || echo "none")
log "上次同步版本: $LAST_SYNC_HASH"

# 增量复制文件（使用 rsync 的增量特性）
log "执行增量复制..."
rsync -av --delete \
    --exclude='logs/*' \
    --exclude='media/*' \
    --exclude='*.log' \
    --exclude='.git' \
    --exclude='delivery-queue/*' \
    --exclude='.github-token' \
    --exclude='*.bak' \
    --exclude='*.tmp' \
    --exclude='agents/*' \
    --exclude='completions/*' \
    --exclude='browser/*' \
    --exclude='cron/*' \
    --exclude='identity/*' \
    --exclude='*.jsonl' \
    "$SOURCE_DIR/" "$REPO_DIR/$TARGET_PATH/" 2>&1 | tee -a "$LOG_FILE" | tail -30

# 统计变更文件
CHANGED_FILES=$(git status --porcelain "$TARGET_PATH/" | wc -l)
log "变更文件数: $CHANGED_FILES"

# 检查是否有变更
if [ "$CHANGED_FILES" -eq 0 ]; then
    log "✅ 无变更，无需提交"
    exit 0
fi

# 显示变更摘要
log "变更摘要:"
git status --short "$TARGET_PATH/" | head -20 | while read line; do
    log "  $line"
done

# 配置 git
git config user.name "小七" 2>/dev/null || true
git config user.email "agent@claw.local" 2>/dev/null || true

# 添加变更
git add "$TARGET_PATH/"

# 提交
git commit -m "sync(clawfile): $(date '+%Y-%m-%d %H:%M')

增量同步 ~/.openclaw/ 目录
- 时间: $(date '+%Y-%m-%d %H:%M:%S')
- 主机: $(hostname)
- 变更文件: $CHANGED_FILES
- 上次版本: $LAST_SYNC_HASH
" 2>&1 | tee -a "$LOG_FILE"

# 推送
log "推送到远程..."
if [ -n "$GITHUB_TOKEN" ]; then
    git push "https://$GITHUB_TOKEN@github.com/ekowang-pd/clawagent.git" "$TARGET_BRANCH" 2>&1 | tee -a "$LOG_FILE"
else
    git push origin "$TARGET_BRANCH" 2>&1 | tee -a "$LOG_FILE"
fi

log "✅ 增量同步完成"
log "========== 同步结束 =========="

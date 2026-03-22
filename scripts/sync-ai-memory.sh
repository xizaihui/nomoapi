#!/bin/bash
# Sync AI memory files to git-tracked backup
# Run manually or via cron

SRC="/root/.openclaw/workspace"
DST="/opt/apps/newapis/.ai-memory"

mkdir -p "$DST"

# Copy core files
cp "$SRC/MEMORY.md" "$DST/MEMORY.md" 2>/dev/null
cp "$SRC/USER.md" "$DST/USER.md" 2>/dev/null

# Copy daily memory files
cp "$SRC/memory/"*.md "$DST/" 2>/dev/null

echo "$(date '+%Y-%m-%d %H:%M:%S') — synced to $DST"

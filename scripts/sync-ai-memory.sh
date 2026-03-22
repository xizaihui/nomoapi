#!/bin/bash
# Sync AI memory files to git-tracked backup (with secret redaction)
# Cron: 30 1,7,13,19 * * *

SRC="/root/.openclaw/workspace"
DST="/opt/apps/newapis/.ai-memory"

mkdir -p "$DST"

# Copy core files
cp "$SRC/MEMORY.md" "$DST/MEMORY.md" 2>/dev/null
cp "$SRC/USER.md" "$DST/USER.md" 2>/dev/null

# Copy daily memory files
cp "$SRC/memory/"*.md "$DST/" 2>/dev/null

# Redact secrets before git commit
sed -i 's/Adm@xz527/***REDACTED***/g' "$DST/"*.md 2>/dev/null
sed -i 's/OpenToken2026!/***REDACTED***/g' "$DST/"*.md 2>/dev/null
sed -i 's/github_pat_[A-Za-z0-9_]*/github_pat_***REDACTED***/g' "$DST/"*.md 2>/dev/null

# Auto commit & push if changed
cd /opt/apps/newapis
if git diff --quiet .ai-memory/; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') — no changes"
else
  git add .ai-memory/
  git commit -m "chore: auto-sync AI memory $(date '+%Y-%m-%d %H:%M')"
  git push nomoapi feat/shadcn-ui 2>/dev/null
  git push opentoken feat/shadcn-ui 2>/dev/null
  echo "$(date '+%Y-%m-%d %H:%M:%S') — synced and pushed"
fi

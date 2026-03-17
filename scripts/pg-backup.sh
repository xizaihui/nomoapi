#!/bin/bash
# PostgreSQL automatic backup script for OpenToken / new-api
# Usage: ./pg-backup.sh [--production]
#
# Local mode (default): backs up local Docker postgres
# Production mode: backs up production server postgres via SSH

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/apps/newapis/backups"
RETENTION_DAYS=30
MAX_BACKUPS=60
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CONTAINER="postgres"
DB_NAME="new-api"
DB_USER="root"

# Production config
PROD_HOST="38.58.59.161"
PROD_BACKUP_DIR="/opt/apps/opentoken/backups"

MODE="local"
if [[ "${1:-}" == "--production" ]]; then
    MODE="production"
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

cleanup_old() {
    local dir="$1"
    local prefix="$2"
    # Remove by age
    find "$dir" -name "${prefix}-*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    # Remove by count
    local count
    count=$(ls -1 "$dir"/${prefix}-*.sql.gz 2>/dev/null | wc -l)
    if [[ $count -gt $MAX_BACKUPS ]]; then
        ls -1t "$dir"/${prefix}-*.sql.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        log "Cleaned up old backups, keeping latest $MAX_BACKUPS"
    fi
}

if [[ "$MODE" == "local" ]]; then
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/newapi-local-${TIMESTAMP}.sql.gz"

    log "Starting local PostgreSQL backup..."
    docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" --no-owner --no-acl | gzip > "$BACKUP_FILE"

    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup created: $BACKUP_FILE ($SIZE)"
    cleanup_old "$BACKUP_DIR" "newapi-local"

elif [[ "$MODE" == "production" ]]; then
    log "Starting production PostgreSQL backup..."
    sshpass -p 'Adm@xz527' ssh root@$PROD_HOST "mkdir -p $PROD_BACKUP_DIR"
    sshpass -p 'Adm@xz527' ssh root@$PROD_HOST \
        "docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME --no-owner --no-acl | gzip > $PROD_BACKUP_DIR/newapi-prod-${TIMESTAMP}.sql.gz"

    SIZE=$(sshpass -p 'Adm@xz527' ssh root@$PROD_HOST "du -h $PROD_BACKUP_DIR/newapi-prod-${TIMESTAMP}.sql.gz | cut -f1")
    log "Production backup created: $PROD_BACKUP_DIR/newapi-prod-${TIMESTAMP}.sql.gz ($SIZE)"

    # Remote cleanup
    sshpass -p 'Adm@xz527' ssh root@$PROD_HOST "
        find $PROD_BACKUP_DIR -name 'newapi-prod-*.sql.gz' -mtime +$RETENTION_DAYS -delete 2>/dev/null
        cd $PROD_BACKUP_DIR && ls -1t newapi-prod-*.sql.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f 2>/dev/null || true
    "
    log "Production backup complete"
fi

log "Done."

#!/usr/bin/env bash
# ==============================================================================
# FindWorker - PostgreSQL Database Restore Script
# Restores database state from a compressed sql.gz backup dump
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <path_to_backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] Backup file '${BACKUP_FILE}' does not exist."
  exit 1
fi

echo "[WARNING] You are about to restore database from ${BACKUP_FILE}."
read -p "Are you sure you want to proceed? Existing data will be overwritten (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore aborted by user."
  exit 0
fi

echo "[INFO] Restoring database from ${BACKUP_FILE}..."

if [ -n "${DATABASE_URL:-}" ]; then
  gunzip -c "${BACKUP_FILE}" | psql "${DATABASE_URL}"
else
  DB_HOST="${DB_HOST:-127.0.0.1}"
  DB_PORT="${DB_PORT:-5432}"
  DB_USER="${DB_USER:-postgres}"
  DB_NAME="${DB_NAME:-findworker}"
  PGPASSWORD="${DB_PASSWORD:-password}" gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}"
fi

echo "[SUCCESS] Database restored successfully."


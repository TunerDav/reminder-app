#!/usr/bin/env bash
set -e

# Read config from Home Assistant options.json
CONFIG_PATH="/data/options.json"

if [ -f "$CONFIG_PATH" ]; then
    POSTGRES_HOST=$(jq -r '.postgres_host' "$CONFIG_PATH")
    POSTGRES_PORT=$(jq -r '.postgres_port' "$CONFIG_PATH")
    POSTGRES_DB=$(jq -r '.postgres_db' "$CONFIG_PATH")
    POSTGRES_USER=$(jq -r '.postgres_user' "$CONFIG_PATH")
    POSTGRES_PASSWORD=$(jq -r '.postgres_password' "$CONFIG_PATH")
    NODE_ENV=$(jq -r '.node_env' "$CONFIG_PATH")
    PORT=$(jq -r '.port' "$CONFIG_PATH")
else
    echo "[ERROR] Config file not found at $CONFIG_PATH"
    exit 1
fi

# Set environment variables
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
export NODE_ENV="${NODE_ENV}"
export PORT="${PORT}"

echo "[INFO] Starting Reminder App..."
echo "[INFO] Database: ${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

# Wait for PostgreSQL to be ready
echo "[INFO] Waiting for PostgreSQL..."
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" > /dev/null 2>&1; do
    sleep 1
done

echo "[INFO] PostgreSQL is ready!"

# Generate Prisma client with runtime database URL
echo "[INFO] Generating Prisma client..."
cd /app
pnpm prisma generate --schema=/app/prisma/schema.prisma

# Run database migrations
echo "[INFO] Running database migrations..."
pnpm prisma migrate deploy || echo "[WARNING] Migration failed or no migrations to run"

# Start the application
echo "[INFO] Starting Next.js application on port ${PORT}..."
exec pnpm start

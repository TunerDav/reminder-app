#!/usr/bin/env bash
set -e

# Read config from Home Assistant options.json using Node.js
CONFIG_PATH="/data/options.json"

if [ ! -f "$CONFIG_PATH" ]; then
    echo "[ERROR] Config file not found at $CONFIG_PATH"
    exit 1
fi

# Parse all config values at once using Node.js
eval $(node -e "
const config = require('$CONFIG_PATH');
console.log('POSTGRES_HOST=\"' + config.postgres_host + '\"');
console.log('POSTGRES_PORT=\"' + config.postgres_port + '\"');
console.log('POSTGRES_DB=\"' + config.postgres_db + '\"');
console.log('POSTGRES_USER=\"' + config.postgres_user + '\"');
console.log('POSTGRES_PASSWORD=\"' + config.postgres_password + '\"');
console.log('NODE_ENV=\"' + config.node_env + '\"');
console.log('PORT=\"' + config.port + '\"');
")

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

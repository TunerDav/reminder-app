#!/usr/bin/with-contenv bashio

# Get config options
POSTGRES_HOST=$(bashio::config 'postgres_host')
POSTGRES_PORT=$(bashio::config 'postgres_port')
POSTGRES_DB=$(bashio::config 'postgres_db')
POSTGRES_USER=$(bashio::config 'postgres_user')
POSTGRES_PASSWORD=$(bashio::config 'postgres_password')
NODE_ENV=$(bashio::config 'node_env')
PORT=$(bashio::config 'port')

# Set environment variables
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
export NODE_ENV="${NODE_ENV}"
export PORT="${PORT}"

bashio::log.info "Starting Reminder App..."
bashio::log.info "Database: ${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

# Wait for PostgreSQL to be ready
bashio::log.info "Waiting for PostgreSQL..."
until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" > /dev/null 2>&1; do
  sleep 1
done

bashio::log.info "PostgreSQL is ready!"

# Generate Prisma client with runtime database URL
bashio::log.info "Generating Prisma client..."
pnpm prisma generate --schema=/app/prisma/schema.prisma

# Run database migrations
bashio::log.info "Running database migrations..."
cd /app
pnpm prisma migrate deploy || bashio::log.warning "Migration failed or no migrations to run"

# Start the application
bashio::log.info "Starting Next.js application on port ${PORT}..."
exec pnpm start

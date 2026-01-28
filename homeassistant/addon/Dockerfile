ARG BUILD_FROM
FROM $BUILD_FROM

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install dependencies
RUN apk add --no-cache \
    git \
    nodejs \
    npm \
    bash \
    jq \
    postgresql-client

# Enable pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Clone the repository (use CACHEBUST to force fresh clone)
ARG CACHEBUST=1
ARG GITHUB_REPO="https://github.com/TunerDav/reminder-app.git"
ARG GITHUB_BRANCH="main"
RUN echo "Cache bust: ${CACHEBUST}" && \
    git clone --depth 1 --branch ${GITHUB_BRANCH} ${GITHUB_REPO} . || \
    git clone --depth 1 ${GITHUB_REPO} .

# Remove problematic prisma.config.ts (causes ESM issues during build)
RUN rm -f prisma.config.ts

# Install dependencies
RUN pnpm install --frozen-lockfile

# Override Prisma version to one compatible with Node.js 20.15
RUN pnpm add -D prisma@5.22.0 @prisma/client@5.22.0

# Generate Prisma client with dummy DATABASE_URL for build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

# Build Next.js application
RUN pnpm build

# Remove dummy DATABASE_URL
ENV DATABASE_URL=""

# Copy run script
COPY run.sh /run.sh
RUN chmod a+x /run.sh

# Expose port
EXPOSE 3000

# Run the addon
CMD ["/run.sh"]

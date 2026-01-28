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
    postgresql-client

# Enable pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Clone the repository
ARG GITHUB_REPO="https://github.com/TunerDav/reminder-app.git"
ARG GITHUB_BRANCH="main"
RUN git clone --depth 1 --branch ${GITHUB_BRANCH} ${GITHUB_REPO} . || \
    git clone --depth 1 ${GITHUB_REPO} .

# Remove problematic prisma.config.ts (causes ESM issues during build)
RUN rm -f prisma.config.ts

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client using the binary directly (skip pnpm wrapper to avoid ESM issues)
RUN node_modules/.bin/prisma generate --schema=./prisma/schema.prisma || \
    pnpm dlx prisma@latest generate --schema=./prisma/schema.prisma

# Build Next.js application
RUN pnpm build

# Copy run script from addon directory (now local to build context)
COPY run.sh /run.sh
RUN chmod a+x /run.sh

# Expose port
EXPOSE 3000

# Run the addon
CMD ["/run.sh"]

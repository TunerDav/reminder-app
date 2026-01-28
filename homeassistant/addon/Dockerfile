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

# Override Prisma version to one compatible with Node.js 20.15
RUN pnpm add -D prisma@5.22.0 @prisma/client@5.22.0

# Build Next.js application (Prisma generate will be done at runtime in run.sh)
RUN pnpm build

# Copy run script from addon directory (now local to build context)
COPY run.sh /run.sh
RUN chmod a+x /run.sh

# Expose port
EXPOSE 3000

# Run the addon
CMD ["/run.sh"]

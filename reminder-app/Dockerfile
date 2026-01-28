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

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate

# Build Next.js application
RUN pnpm build

# Copy run script from addon directory
COPY run.sh /run.sh
RUN chmod a+x /run.sh

# Expose port
EXPOSE 3000

# Run the addon
CMD ["/run.sh"]

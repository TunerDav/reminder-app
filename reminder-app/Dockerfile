ARG BUILD_FROM
FROM $BUILD_FROM

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install Node.js and dependencies
RUN apk add --no-cache \
    nodejs \
    npm \
    bash \
    postgresql-client

# Enable pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy application files
COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY lib ./lib
COPY prisma ./prisma
COPY public ./public
COPY styles ./styles
COPY next.config.mjs ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY components.json ./

# Generate Prisma client
RUN pnpm prisma generate

# Build Next.js application
RUN pnpm build

# Copy run script from addon directory
COPY reminder-app/run.sh /run.sh
RUN chmod a+x /run.sh

# Expose port
EXPOSE 3000

# Run the addon
CMD ["/run.sh"]

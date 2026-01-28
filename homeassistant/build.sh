#!/usr/bin/env bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building Reminder App Home Assistant Add-on${NC}"

# Get version from config.yaml
VERSION=$(grep "^version:" homeassistant/addon/config.yaml | cut -d'"' -f2)
echo -e "${YELLOW}Version: ${VERSION}${NC}"

# Supported architectures
ARCHITECTURES=("amd64" "aarch64" "armv7" "armhf" "i386")

# Build for all architectures
for ARCH in "${ARCHITECTURES[@]}"; do
  echo -e "${GREEN}Building for ${ARCH}...${NC}"
  
  docker build \
    --build-arg BUILD_FROM="homeassistant/${ARCH}-base:latest" \
    --platform linux/${ARCH} \
    -t "reminderapp/${ARCH}:${VERSION}" \
    -f homeassistant/addon/Dockerfile \
    .
    
  echo -e "${GREEN}✓ Built ${ARCH}${NC}"
done

echo -e "${GREEN}All architectures built successfully!${NC}"
echo -e "${YELLOW}To push images, run:${NC}"
for ARCH in "${ARCHITECTURES[@]}"; do
  echo "  docker push reminderapp/${ARCH}:${VERSION}"
done

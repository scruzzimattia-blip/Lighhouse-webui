#!/bin/bash

# Exit on error
set -e

echo "Fixing permissions and building Lighthouse WebUI..."

# Ensure we have LF line endings for key config files (Nextcloud can mess these up)
if command -v dos2unix &> /dev/null; then
  echo "Converting line endings to LF..."
  find . -type f \( -name "package.json" -o -name "Dockerfile" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" \) -exec dos2unix {} +
fi

# Fix general permissions
chmod -R 755 .

# Remove any existing build artifacts
rm -rf frontend/dist backend/dist

echo "Building containers (no-cache to ensure clean state)..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d

echo "Done! Dashboard should be at http://localhost:8085"

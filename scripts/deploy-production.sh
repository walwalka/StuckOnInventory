#!/bin/bash
set -e

echo "🚀 Deploying to production..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found"
    echo "Please create .env.production from .env.example"
    exit 1
fi

# Backup existing .env if it exists
if [ -f .env ]; then
    echo "📋 Backing up existing .env to .env.backup"
    cp .env .env.backup
fi

# Copy production env to .env for Docker Compose
echo "📝 Using .env.production for deployment"
cp .env.production .env

# Build containers
echo "📦 Building containers..."
docker compose -f docker-compose.yml -f docker-compose.production.yml build

# Start services
echo "🚢 Starting services..."
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

echo ""
echo "✅ Production deployment complete!"
echo ""
echo "View logs with:"
echo "  docker compose -f docker-compose.yml -f docker-compose.production.yml logs -f"
echo ""
echo "Stop services with:"
echo "  docker compose -f docker-compose.yml -f docker-compose.production.yml down"

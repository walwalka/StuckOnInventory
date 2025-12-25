#!/bin/bash
set -e

echo "🚀 Deploying to production..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found"
    echo "Please create .env.production from .env.example"
    exit 1
fi

# Build containers
echo "📦 Building containers..."
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml build

# Start services
echo "🚢 Starting services..."
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

echo ""
echo "✅ Production deployment complete!"
echo ""
echo "View logs with:"
echo "  docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml logs -f"
echo ""
echo "Stop services with:"
echo "  docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml down"

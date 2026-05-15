#!/usr/bin/env bash
set -e

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Edit .env with your credentials and rerun."
  exit 1
fi

echo "🚀 Building and deploying endpoint server..."
docker compose up --build -d

echo "✅ Deployment complete. API available at http://localhost:3000"

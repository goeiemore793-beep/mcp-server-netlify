#!/usr/bin/env bash

# MCP Server Deployment Script
# Usage: bash deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment configuration
ENVIRONMENT=${1:-"production"}
APP_NAME="mcp-server-paid"
IMAGE_NAME="${APP_NAME}:${ENVIRONMENT}"
CONTAINER_NAME="${APP_NAME}-${ENVIRONMENT}"

echo -e "${BLUE}🚀 Starting MCP Server Deployment${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check if command exists
command_exists() {
    command -v "$@" > /dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Docker
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed.${NC}"
    echo -e "${YELLOW}Please install Docker first:${NC}"
    echo "   - Ubuntu: sudo apt-get install docker.io"
    echo "   - macOS: brew install docker"
    echo "   - Windows: Install Docker Desktop"
    exit 1
fi

# Check Docker Compose
if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    echo -e "${YELLOW}Please install Docker Compose:${NC}"
    echo "   - Ubuntu: sudo apt-get install docker-compose"
    echo "   - macOS: brew install docker-compose"
    echo "   - Windows: Docker Desktop includes Compose"
    exit 1
fi

# Check environment file
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found.${NC}"
    echo -e "${YELLOW}Please create .env file from .env.example:${NC}"
    echo "   cp .env.example .env"
    echo "   Edit .env with your credentials"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites satisfied${NC}"

# Load environment variables
source .env

# Validate required environment variables
echo -e "${BLUE}🔑 Validating environment variables...${NC}"

if [ -z "$PADDLE_VENDOR_ID" ]; then
    echo -e "${RED}❌ PADDLE_VENDOR_ID is not set${NC}"
    exit 1
fi

if [ -z "$PADDLE_VENDOR_AUTH_CODE" ]; then
    echo -e "${RED}❌ PADDLE_VENDOR_AUTH_CODE is not set${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ JWT_SECRET is not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required environment variables are set${NC}"

# Build Docker image
echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

# Stop existing container if running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${BLUE}🛑 Stopping existing container...${NC}"
    docker stop $CONTAINER_NAME
    
    # Wait for container to stop
    sleep 3
    
    # Remove existing container
    echo -e "${BLUE}🗑️ Removing existing container...${NC}"
    docker rm $CONTAINER_NAME
fi

# Create Docker network if it doesn't exist
if ! docker network inspect mcp-network > /dev/null 2>&1; then
    echo -e "${BLUE}🌐 Creating Docker network...${NC}"
    docker network create mcp-network
fi

# Run the container
echo -e "${BLUE}🚀 Running container...${NC}"

# For production, we'll use docker-compose
# But for simple deployments, we can run directly
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}Using docker-compose for production deployment...${NC}"
    
    # Create docker-compose.yml if it doesn't exist
    if [ ! -f docker-compose.yml ]; then
        echo "version: '3.8'" > docker-compose.yml
        echo "" >> docker-compose.yml
        echo "services:" >> docker-compose.yml
        echo "  mcp-server:" >> docker-compose.yml
        echo "    build: ." >> docker-compose.yml
        echo "    ports:" >> docker-compose.yml
        echo "      - '8080:8080'" >> docker-compose.yml
        echo "    environment:" >> docker-compose.yml
        echo "      - PADDLE_VENDOR_ID=${PADDLE_VENDOR_ID}" >> docker-compose.yml
        echo "      - PADDLE_VENDOR_AUTH_CODE=${PADDLE_VENDOR_AUTH_CODE}" >> docker-compose.yml
        echo "      - JWT_SECRET=${JWT_SECRET}" >> docker-compose.yml
        echo "      - NODE_ENV=production" >> docker-compose.yml
        echo "    restart: always" >> docker-compose.yml
        echo "    healthcheck:" >> docker-compose.yml
        echo "      test: ['CMD', 'curl', '-f', 'http://localhost:8080/health']" >> docker-compose.yml
        echo "      interval: 30s" >> docker-compose.yml
        echo "      timeout: 10s" >> docker-compose.yml
        echo "      retries: 3" >> docker-compose.yml
        echo "      start_period: 40s" >> docker-compose.yml
        echo "    networks:" >> docker-compose.yml
        echo "      default:" >> docker-compose.yml
        echo "        name: mcp-network" >> docker-compose.yml
    fi

    # Start with docker-compose
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Container started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        exit 1
    fi
else
    # Development deployment
    docker run -d \
        --name $CONTAINER_NAME \
        -p 8080:8080 \
        -e PADDLE_VENDOR_ID=$PADDLE_VENDOR_ID \
        -e PADDLE_VENDOR_AUTH_CODE=$PADDLE_VENDOR_AUTH_CODE \
        -e JWT_SECRET=$JWT_SECRET \
        -e NODE_ENV=$ENVIRONMENT \
        --network mcp-network \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Container started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start container${NC}"
        exit 1
    fi
fi

# Wait for container to start
echo -e "${BLUE}⏳ Waiting for server to start...${NC}"
sleep 5

# Check if container is running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${GREEN}✓ Container is running${NC}"
    
    # Test health endpoint
    echo -e "${BLUE}🏥 Checking server health...${NC}"
    local_health=$(docker exec $CONTAINER_NAME curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>/dev/null || echo "000")
    
    if [ "$local_health" = "200" ]; then
        echo -e "${GREEN}✓ Server is healthy${NC}"
        
        # Get public IP
        public_ip=$(curl -s ifconfig.me)
        echo -e "${GREEN}🎉 Server deployed successfully!${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo -e "${GREEN}Server URL: http://localhost:8080${NC}"
        echo -e "${GREEN}Health check: http://localhost:8080/health${NC}"
        echo -e "${GREEN}API endpoints:${NC}"
        echo "  - POST /api/auth/create"
        echo "  - POST /api/auth/refresh"
        echo "  - POST /webhooks/paddle"
        echo -e "${BLUE}========================================${NC}"
    else
        echo -e "${YELLOW}⚠️ Server may still be starting...${NC}"
        echo -e "${GREEN}✓ Container is running${NC}"
        echo -e "${BLUE}Check logs with: docker logs $CONTAINER_NAME${NC}"
    fi
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo -e "${BLUE}Check logs with: docker logs $CONTAINER_NAME${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Deployment complete!${NC}\n"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure Paddle webhooks"
echo "2. Test with MCP clients"
echo "3. Monitor usage and analytics"
echo "4. Scale as needed"

exit 0
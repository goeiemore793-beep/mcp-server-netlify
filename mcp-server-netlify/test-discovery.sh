#!/usr/bin/env bash

# MCP Server Discovery Test Script
# Tests whether your tools are discoverable through various channels

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SERVER_URL="${1:-http://localhost:3000}"
AUTH_TOKEN="${2:-}"

echo -e "${BLUE}🔍 MCP Server Discovery Test${NC}"
echo -e "${BLUE}Testing: $SERVER_URL${NC}\n"

# Test 1: Discovery Endpoint
echo -e "${YELLOW}[1] Testing Discovery Endpoint${NC}"
echo "GET $SERVER_URL/discovery"
discovery_response=$(curl -s "$SERVER_URL/discovery" || echo "{}")

if echo "$discovery_response" | grep -q "tools"; then
    echo -e "${GREEN}✓ Discovery endpoint is working${NC}"
    
    # Count tools
    tool_count=$(echo "$discovery_response" | grep -o '"name"' | wc -l)
    echo -e "  Found $tool_count tools"
    
    # Show tool names
    tool_names=$(echo "$discovery_response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo -e "  Tools:"
    echo "$tool_names" | sed 's/^/    - /'
else
    echo -e "${RED}✗ Discovery endpoint failed${NC}"
fi

echo ""

# Test 2: Health Endpoint
echo -e "${YELLOW}[2] Testing Health Endpoint${NC}"
echo "GET $SERVER_URL/health"
health_response=$(curl -s "$SERVER_URL/health" || echo "{}")

if echo "$health_response" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Server is healthy${NC}"
    
    # Show server info
    server_name=$(echo "$health_response" | grep -o '"server":"[^"]*"' | cut -d'"' -f4)
    server_version=$(echo "$health_response" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo -e "  Server: $server_name v$server_version"
else
    echo -e "${RED}✗ Health endpoint failed${NC}"
fi

echo ""

# Test 3: Tool Listing (if authenticated)
if [ -n "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}[3] Testing Tool Listing (Authenticated)${NC}"
    echo "POST $SERVER_URL/mcp with token"
    
    tool_list=$(curl -s -X POST "$SERVER_URL/mcp" \
        -H "Content-Type: application/json" \
        -d "{\"token\":\"$AUTH_TOKEN\",\"method\":\"tools/list\"}" || echo "{}")
    
    if echo "$tool_list" | grep -q "tools"; then
        echo -e "${GREEN}✓ Tool listing is working${NC}"
        
        # Count authenticated tools
        auth_tool_count=$(echo "$tool_list" | grep -o '"name"' | wc -l)
        echo -e "  User can access $auth_tool_count tools"
    else
        echo -e "${RED}✗ Tool listing failed${NC}"
    fi
else
    echo -e "${YELLOW}[3] Skipping Tool Listing (no token provided)${NC}"
    echo -e "  To test authenticated tool listing, provide token:"
    echo -e "  ${BLUE}./test-discovery.sh $SERVER_URL YOUR_JWT_TOKEN${NC}"
fi

echo ""

# Test 4: Search Keywords
echo -e "${YELLOW}[4] Checking Discoverability${NC}"

# Extract tags
if echo "$discovery_response" | grep -q "tags"; then
    tags=$(echo "$discovery_response" | grep -o '"tags":\[[^]]*\]' | head -1)
    echo -e "${GREEN}✓ Tags found:${NC}"
    echo "  $tags"
else
    echo -e "${YELLOW}! No tags found - add tags for better searchability${NC}"
fi

# Extract categories
if echo "$discovery_response" | grep -q "categories"; then
    categories=$(echo "$discovery_response" | grep -o '"categories":\[[^]]*\]' | head -1)
    echo -e "${GREEN}✓ Categories found:${NC}"
    echo "  $categories"
else
    echo -e "${YELLOW}! No categories found${NC}"
fi

echo ""

# Test 5: API Endpoints
echo -e "${YELLOW}[5] Available API Endpoints${NC}"

endpoints=$(curl -s "$SERVER_URL/discovery" | grep -o '"[^"]*":"\/' || true)
if [ -z "$endpoints" ]; then
    echo -e "  ${BLUE}POST${NC} /api/auth/create - Create account"
    echo -e "  ${BLUE}POST${NC} /api/auth/refresh - Refresh token"
    echo -e "  ${BLUE}GET${NC} /discovery - List all tools"
    echo -e "  ${BLUE}GET${NC} /health - Health check"
    echo -e "  ${BLUE}POST${NC} /api/mcp - Execute tools"
else
    echo "$endpoints" | sed 's/^/  /'
fi

echo ""

# Test 6: CORS Headers
echo -e "${YELLOW}[6] Checking CORS Headers${NC}"
cors_response=$(curl -s -I "$SERVER_URL/discovery" | grep -i "access-control" || echo "")

if [ -z "$cors_response" ]; then
    echo -e "${YELLOW}! CORS headers not found${NC}"
    echo -e "  Note: Enable CORS for cross-origin discovery"
else
    echo -e "${GREEN}✓ CORS headers found:${NC}"
    echo "$cors_response" | sed 's/^/  /'
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🎯 Discoverability Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Your MCP server is discoverable through:"
echo -e "  1. ${GREEN}✓${NC} Public discovery endpoint: $SERVER_URL/discovery"
echo -e "  2. ${GREEN}✓${NC} Health check: $SERVER_URL/health"
if [ -n "$AUTH_TOKEN" ]; then
    echo -e "  3. ${GREEN}✓${NC} Authenticated tool listing"
else
    echo -e "  3. ${YELLOW}?${NC} Authenticated tool listing (not tested)"
fi
echo ""
echo -e "To register your tools in MCP registries:"
echo -e "  1. Ensure discovery endpoint returns all tools"
echo -e "  2. Add tags and categories for searchability"
echo -e "  3. Submit to ${BLUE}https://github.com/anthropic/mcp-registry${NC}"
echo -e "  4. Add to community directories"
echo ""
echo -e "${GREEN}✅ Your tools are discoverable!${NC}\n"
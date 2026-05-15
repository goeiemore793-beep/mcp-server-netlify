# MCP Tool Discovery & Visibility Guide

## 🔍 How Your Tools Are Found

Your MCP server's tools can be discovered through multiple channels:

### 1. **Direct Discovery Endpoint** (Primary)
```
GET https://mcp-server-netlify-20260513.netlify.app/.netlify/functions/discovery
```
Returns JSON with all available tools, subscriptions, and endpoints:
```json
{
  "type": "mcp-discovery",
  "name": "Paid MCP Server",
  "version": "1.0.0",
  "tags": ["paid", "mcp", "tools", "api"],
  "categories": ["utilities", "productivity"],
  "tools": [
    {
      "name": "basic",
      "description": "Basic utility tools",
      "inputSchema": { ... }
    }
  ],
  "plans": {
    "FREE": { "maxCalls": 10 },
    "PRO": { "maxCalls": 1000 },
    "ENTERPRISE": { "maxCalls": 10000 }
  },
  "endpoints": { ... }
}
```

### 2. **MCP Tool Listing** (Authenticated)
When a client authenticates with your JWT token, they can list available tools:

```bash
POST https://mcp-server-netlify-20260513.netlify.app/.netlify/functions/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {
    "token": "your_jwt_token_here"
  }
}
```

**Response varies by subscription plan:**
- **FREE**: Shows only `basic.*` tools (greet, time, echo)
- **PRO**: Shows `basic.*` + `advanced.*` tools (calculate, weather, transform)
- **ENTERPRISE**: Shows all tools including `analytics.*` and `admin.*`

### 3. **MCP Registry/Directory Listings**

Your tools will appear in these locations if registered:

| Registry | How to Register |
|----------|-----------------|
| **Anthropic MCP Registry** | Submit via GitHub PR to `anthropic/mcp-registry` |
| **Community MCP Directory** | List at `mcp-tools.dev` or similar |
| **Claude Desktop** | Add to `claude_desktop_config.json` |
| **Cursor IDE** | Configure in settings.json |
| **Custom Integrations** | API clients can query your discovery endpoint |

### 4. **Tool Visibility by Plan**

```
┌─────────────────────────────────────────────────────────┐
│ Unauthenticated User                                    │
├─────────────────────────────────────────────────────────┤
│ Tools Available: None (must create account)            │
│ Can see: Public discovery endpoint                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FREE Plan ($0/month)                                    │
├─────────────────────────────────────────────────────────┤
│ Tools: basic.greet, basic.time, basic.echo             │
│ Calls: 10/month                                         │
│ Status: ✅ Visible on public listing                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PRO Plan ($9.99/month)                                  │
├─────────────────────────────────────────────────────────┤
│ Tools: basic.* + advanced.*                             │
│ Calls: 1,000/month                                      │
│ Status: ✅ Visible on public listing (premium badge)  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ENTERPRISE Plan ($99.99/month)                          │
├─────────────────────────────────────────────────────────┤
│ Tools: basic.* + advanced.* + analytics.* + admin.*    │
│ Calls: 10,000/month                                     │
│ Status: ✅ Visible on public listing (enterprise badge)│
└─────────────────────────────────────────────────────────┘
```

## 🎯 Making Your Tools Discoverable

### Step 1: Update Discovery Configuration

Create `.env` with custom metadata:
```env
BASE_URL=https://mcp-server-netlify-20260513.netlify.app
SERVER_NAME=My Awesome MCP Server
SERVER_DESCRIPTION=Advanced tools for productivity and data analysis
SERVER_VERSION=1.0.0
SERVER_TAGS=productivity,data,analysis,automation
SERVER_CATEGORIES=utilities,data-science,productivity
```

### Step 2: Register in Directories

1. **Anthropic MCP Registry**
   ```bash
   # Fork https://github.com/anthropic/mcp-registry
   # Add your server to manifest.json
   git add manifest.json
   git commit -m "Add My MCP Server"
   git push origin feature/add-my-server
   # Create Pull Request
   ```

2. **Claude Desktop Config** (for personal use)
   ```json
   // ~/.config/claude/claude_desktop_config.json (macOS/Linux)
   // %APPDATA%\Claude\claude_desktop_config.json (Windows)
   {
     "mcpServers": {
       "paid-mcp": {
         "url": "https://your-netlify-site.netlify.app/.netlify/functions/mcp",
         "metadata": {
           "name": "My MCP Server",
           "description": "Paid access MCP tools",
           "auth_required": true
         }
       }
     }
   }
   ```

3. **Cursor IDE Configuration**
   ```json
   // .cursor/settings.json
   {
     "mcp": {
       "servers": [
         {
           "name": "paid-mcp",
           "url": "https://your-netlify-site.netlify.app/.netlify/functions/mcp",
           "auth_type": "jwt",
           "token_endpoint": "https://your-netlify-site.netlify.app/.netlify/functions/create-account"
         }
       ]
     }
   }
   ```

### Step 3: Create Marketing Content

```markdown
# My MCP Server

**Features:**
- ✅ 4 Categories of Tools (Basic, Advanced, Analytics, Admin)
- ✅ 3 Subscription Tiers (FREE, PRO, ENTERPRISE)
- ✅ Global Payment Support (Paddle)
- ✅ Usage Limits & Tracking
- ✅ Easy Authentication

**Available Tools:**
1. **Basic** (FREE) - Utilities, time, echo
2. **Advanced** (PRO+) - Math, weather, data transformation
3. **Analytics** (ENTERPRISE) - Usage reports, data export
4. **Admin** (ENTERPRISE) - User management, server stats

**Pricing:**
- FREE: $0/month, 10 calls
- PRO: $9.99/month, 1,000 calls
- ENTERPRISE: $99.99/month, 10,000 calls

**Quick Start:**
1. Create account: POST /api/auth/create
2. Get JWT token
3. Call tools with token
4. Track usage in dashboard

**Demo:**
```

## 📊 API Endpoints for Discovery

### Get All Tools (Unauthenticated)
```bash
curl https://your-netlify-site/.netlify/functions/discovery
```

### List Tools by Plan (Authenticated)
```bash
curl -X POST https://your-netlify-site/.netlify/functions/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {"token": "eyJhbGc..."}
  }'
```

### Create Account & Get Token
```bash
curl -X POST https://your-netlify-site/.netlify/functions/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "subscriptionPlan": "FREE",
    "paymentId": "test_payment"
  }'
```

### Check Server Health
```bash
curl https://your-netlify-site/.netlify/functions/health
```

## 🔐 Search Engine Optimization for MCP Tools

To make your tools easier to find:

1. **Add metadata tags**
   ```json
   {
     "tags": ["mcp", "api", "paid", "tools", "automation"],
     "searchKeywords": ["productivity", "api", "integration"]
   }
   ```

2. **Use descriptive tool names**
   - ❌ `tool_1`, `action_2`
   - ✅ `advanced.calculate`, `analytics.usage`

3. **Include rich descriptions**
   - ❌ "Tool"
   - ✅ "Advanced mathematical expression calculator with support for complex operations"

4. **Create documentation**
   - README with examples
   - API reference
   - Pricing table
   - Quick start guide

## 📈 Tracking Discovery Traffic

Monitor which tools/plans are most accessed:

```typescript
// Add to analytics.usage
return {
  toolDiscoveryStats: {
    toolsRequested: [...],
    popularTools: ['basic.time', 'advanced.calculate', ...],
    planDistribution: {
      FREE: 45,
      PRO: 35,
      ENTERPRISE: 20
    }
  }
};
```

## ✅ Checklist for Maximum Visibility

- [ ] Discovery endpoint returns complete tool metadata
- [ ] All tools have clear descriptions and examples
- [ ] Registered in Anthropic MCP Registry
- [ ] Added to community directories (mcp-tools.dev, etc.)
- [ ] Claude Desktop config created
- [ ] Cursor IDE integration configured
- [ ] README with examples published
- [ ] Tags and categories optimized for search
- [ ] Health check endpoint working
- [ ] Authentication flow documented
- [ ] Pricing clearly displayed
- [ ] Demo account available (FREE tier)
# 20 Professional MCP Tools - Complete Reference

## Overview

Your server now includes **20 of the most commonly used MCP tools**, organized into 3 subscription tiers:

- ✅ **FREE**: 2 tools (100 calls/month)
- ✅ **PRO**: 10 tools (5,000 calls/month)
- ✅ **ENTERPRISE**: All 20 tools (50,000 calls/month)

---

## 🟢 FREE Tier Tools (2)

### 1. **Basic Utilities** (`basic.*`)
Essential tools available to all users.

**Actions:**
- `greet` - Returns greeting with usage stats
- `time` - Current timestamp
- `echo` - Echo back message
- `version` - Server version info
- `ping` - Health check

**Example:**
```bash
POST /api/mcp
{
  "token": "jwt_token",
  "name": "basic.greet",
  "arguments": {"action": "greet"}
}
```

**Response:**
```json
{
  "message": "Hello! Calls: 1/100"
}
```

---

### 2. **Text Processing** (`text.*`)
Manipulate and analyze text strings.

**Actions:**
- `uppercase` - Convert to uppercase
- `lowercase` - Convert to lowercase
- `reverse` - Reverse string
- `count` - Count chars, words, lines
- `split` - Split by delimiter

**Example:**
```bash
{
  "name": "text.uppercase",
  "arguments": {"action": "uppercase", "text": "hello world"}
}
```

**Response:**
```json
{
  "result": "HELLO WORLD"
}
```

---

## 🔵 PRO Tier Tools (8 additional)

### 3. **Advanced Math & Analytics** (`advanced.*`)
Complex calculations and data analysis.

**Actions:**
- `calculate` - Evaluate math expressions
- `weather` - Simulated weather data
- `sort` - Sort arrays ascending/descending
- `filter` - Filter even/odd numbers

**Example:**
```bash
{
  "name": "advanced.calculate",
  "arguments": {"action": "calculate", "expression": "2 + 2 * 10"}
}
```

---

### 4. **JSON Processing** (`json.*`)
Parse, validate, and transform JSON.

**Actions:**
- `parse` - Parse JSON string
- `stringify` - Convert object to JSON
- `validate` - Check if valid JSON
- `merge` - Merge objects

**Example:**
```bash
{
  "name": "json.parse",
  "arguments": {"action": "parse", "jsonString": "{\"name\":\"John\"}"}
}
```

---

### 5. **Data Processing** (`data.*`)
Array and collection operations.

**Actions:**
- `merge` - Combine arrays
- `filter` - Remove falsy values
- `map` - Apply transformations
- `reduce` - Aggregate values
- `group` - Group and count

**Example:**
```bash
{
  "name": "data.reduce",
  "arguments": {"action": "reduce", "array": [1, 2, 3, 4, 5]}
}
```

**Response:**
```json
{
  "sum": 15
}
```

---

### 6. **API Utilities** (`api.*`)
HTTP operations and API helpers.

**Actions:**
- `call` - Make HTTP request
- `validate` - Validate URL
- `headers` - Get standard headers
- `build` - Build API endpoint

**Example:**
```bash
{
  "name": "api.validate",
  "arguments": {"action": "validate", "url": "https://api.example.com"}
}
```

---

### 7. **CSV Processing** (`csv.*`)
Handle CSV files and data.

**Actions:**
- `parse` - Parse CSV string
- `stringify` - Convert data to CSV
- `validate` - Check CSV format
- `convert` - Convert formats

**Example:**
```bash
{
  "name": "csv.parse",
  "arguments": {"action": "parse", "csvString": "name,age\nJohn,30"}
}
```

---

### 8. **Search & Filtering** (`search.*`)
Find and filter data efficiently.

**Actions:**
- `find` - Check if exists
- `filter` - Filter by term
- `query` - Complex queries
- `regex` - Pattern matching

**Example:**
```bash
{
  "name": "search.filter",
  "arguments": {"action": "filter", "array": ["apple", "banana", "apricot"], "term": "ap"}
}
```

---

### 9. **Data Transformation** (`transform.*`)
Convert between formats and encodings.

**Actions:**
- `encode` - Base64 encoding
- `decode` - Base64 decoding
- `compress` - Data compression
- `serialize` - Serialize objects

**Example:**
```bash
{
  "name": "transform.encode",
  "arguments": {"action": "encode", "text": "hello"}
}
```

**Response:**
```json
{
  "encoded": "aGVsbG8="
}
```

---

### 10. **Formatting** (`format.*`)
Format data for display.

**Actions:**
- `date` - Format dates
- `number` - Format numbers
- `currency` - Format currency
- `percentage` - Format percentages

**Example:**
```bash
{
  "name": "format.currency",
  "arguments": {"action": "currency", "number": 1234.56}
}
```

**Response:**
```json
{
  "formatted": "$1234.56"
}
```

---

## 🟣 ENTERPRISE Tier Tools (10 advanced)

### 11. **Database Operations** (`database.*`)
Access and manage data stores.

**Actions:**
- `query` - Execute queries
- `insert` - Add records
- `update` - Modify records
- `delete` - Remove records

---

### 12. **Email Operations** (`email.*`)
Send and manage emails.

**Actions:**
- `send` - Send email
- `validate` - Validate email
- `template` - Use templates

---

### 13. **File Management** (`files.*`)
Read, write, and manage files.

**Actions:**
- `read` - Read file content
- `write` - Write files
- `list` - List directory
- `delete` - Delete files

---

### 14. **Security & Encryption** (`security.*`)
Hash, encrypt, and validate data.

**Actions:**
- `hash` - Hash passwords/data
- `encrypt` - Encrypt sensitive data
- `decrypt` - Decrypt data
- `validate` - Validate tokens/signatures

---

### 15. **Analytics & Reporting** (`analytics.*`)
Track usage and generate reports.

**Actions:**
- `usage` - Get usage stats
- `stats` - Server statistics
- `reports` - Generate reports
- `export` - Export data

---

### 16. **Admin Tools** (`admin.*`)
System administration and management.

**Actions:**
- `list_users` - Get all users
- `reset_calls` - Reset user quotas
- `system` - System status
- `logs` - View logs

---

### 17. **Webhook Management** (`webhook.*`)
Create and manage webhooks.

**Actions:**
- `create` - Create webhook
- `update` - Update webhook
- `delete` - Delete webhook
- `test` - Test webhook

---

### 18. **Caching** (`cache.*`)
Cache data for performance.

**Actions:**
- `get` - Retrieve from cache
- `set` - Store in cache
- `delete` - Remove from cache
- `clear` - Clear all cache

---

### 19. **Monitoring & Observability** (`monitor.*`)
Monitor performance and health.

**Actions:**
- `metrics` - CPU, memory, disk
- `alerts` - Active alerts
- `health` - System health
- `performance` - Performance stats

---

### 20. **Batch Processing** (`batch.*`)
Process large datasets efficiently.

**Actions:**
- `process` - Batch process items
- `schedule` - Schedule batch jobs
- `queue` - Queue items

---

## 📊 Pricing & Access Matrix

| Tool | FREE | PRO | ENTERPRISE |
|------|------|-----|------------|
| basic | ✅ | ✅ | ✅ |
| text | ✅ | ✅ | ✅ |
| advanced | ❌ | ✅ | ✅ |
| json | ❌ | ✅ | ✅ |
| data | ❌ | ✅ | ✅ |
| api | ❌ | ✅ | ✅ |
| csv | ❌ | ✅ | ✅ |
| search | ❌ | ✅ | ✅ |
| transform | ❌ | ✅ | ✅ |
| format | ❌ | ✅ | ✅ |
| database | ❌ | ❌ | ✅ |
| email | ❌ | ❌ | ✅ |
| files | ❌ | ❌ | ✅ |
| security | ❌ | ❌ | ✅ |
| analytics | ❌ | ❌ | ✅ |
| admin | ❌ | ❌ | ✅ |
| webhook | ❌ | ❌ | ✅ |
| cache | ❌ | ❌ | ✅ |
| monitor | ❌ | ❌ | ✅ |
| batch | ❌ | ❌ | ✅ |

---

## 🚀 Usage Examples

### Example 1: FREE User - Basic Operations
```bash
# Create account
curl -X POST https://your-site.netlify.app/api/auth/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "subscriptionPlan": "FREE",
    "paymentId": "free_trial"
  }'

# Response
{
  "token": "eyJhbGc...",
  "plan": "FREE"
}

# Use basic tool
curl -X POST https://your-site.netlify.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGc...",
    "name": "text.uppercase",
    "arguments": {"action": "uppercase", "text": "hello"}
  }'

# Response
{
  "result": "HELLO"
}
```

### Example 2: PRO User - Data Analysis
```bash
# Create PRO account (after Paddle payment)
curl -X POST https://your-site.netlify.app/api/auth/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pro@example.com",
    "subscriptionPlan": "PRO",
    "paymentId": "paddle_subscription_123"
  }'

# Use advanced tools
curl -X POST https://your-site.netlify.app/api/mcp \
  -d '{
    "token": "eyJhbGc...",
    "name": "data.reduce",
    "arguments": {"action": "reduce", "array": [1,2,3,4,5]}
  }'

# Response
{
  "sum": 15
}
```

### Example 3: ENTERPRISE - Full System Access
```bash
# Create ENTERPRISE account
curl -X POST https://your-site.netlify.app/api/auth/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "enterprise@company.com",
    "subscriptionPlan": "ENTERPRISE",
    "paymentId": "paddle_enterprise_456"
  }'

# Access admin tools
curl -X POST https://your-site.netlify.app/api/mcp \
  -d '{
    "token": "eyJhbGc...",
    "name": "admin.list_users",
    "arguments": {"action": "list_users"}
  }'

# Get system analytics
curl -X POST https://your-site.netlify.app/api/mcp \
  -d '{
    "token": "eyJhbGc...",
    "name": "analytics.usage",
    "arguments": {"action": "usage"}
  }'
```

---

## 📈 Call Limits by Plan

| Plan | Calls/Month | Tools | Price |
|------|------------|-------|-------|
| **FREE** | 100 | 2 | $0 |
| **PRO** | 5,000 | 10 | $9.99 |
| **ENTERPRISE** | 50,000 | 20 | $99.99 |

---

## ✅ Deployment Checklist

- [ ] All 20 tools implemented
- [ ] Discovery endpoint returns all tools
- [ ] Subscription tiers working
- [ ] JWT authentication functional
- [ ] Usage limits enforced
- [ ] Paddle webhooks configured
- [ ] Deployed to Netlify
- [ ] Tests passing
- [ ] Documentation complete

---

## 🆘 Troubleshooting

### Tool returns "PRO required"
- Your account is FREE tier
- Upgrade to PRO to use advanced tools
- Visit: your-site.netlify.app/pricing

### "Subscription limit reached"
- You've used all allocated calls for this month
- Billing cycle resets monthly
- Upgrade to higher tier for more calls

### Authentication error
- Check JWT token is valid
- Refresh token if expired
- Create new account if needed

---

## 📞 Support

For issues with specific tools:
1. Check this documentation
2. View error message for hint
3. Contact support with tool name and error
4. Include your subscription plan
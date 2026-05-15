# MCP Server for Netlify

This is a Model Context Protocol (MCP) server with self-hosted subscription management, optimized for deployment on Netlify.

## Features

- **Tiered Subscriptions**: FREE, PRO, and ENTERPRISE plans
- **Tool Access Control**: Different tools available based on subscription tier
- **Usage Tracking**: Call counting and limits per subscription
- **Self-hosted purchase flow**: no external payment provider required for the prototype
- **JWT Authentication**: Secure token-based authentication
- **Netlify Functions**: Serverless deployment on Netlify

## Installation

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the project root:

```env
JWT_SECRET=your_jwt_secret_at_least_32_chars_long
BASE_URL=https://your-site.netlify.app
SERVER_NAME=My MCP Server
SERVER_TAGS=paid,mcp,tools,productivity
SERVER_CATEGORIES=utilities,data,productivity
```

## Netlify Configuration

Create a `netlify.toml` file:

```toml
[build]
  functions = "functions-build"
  publish = "."

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/.netlify/functions/mcp"
  to = "/.netlify/functions/mcp"
  status = 200

[[redirects]]
  from = "/api/mcp"
  to = "/.netlify/functions/mcp"
  status = 200

[[redirects]]
  from = "/api/auth/create"
  to = "/.netlify/functions/create-account"
  status = 200

[[redirects]]
  from = "/api/subscribe"
  to = "/.netlify/functions/create-account"
  status = 200

[[redirects]]
  from = "/api/auth/refresh"
  to = "/.netlify/functions/refresh-token"
  status = 200

[[redirects]]
  from = "/health"
  to = "/.netlify/functions/health"
  status = 200
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Test functions locally
netlify dev
```

## Deployment

1. Push your code to a GitHub repository
2. Connect Netlify to your repository
3. Set environment variables in Netlify dashboard
4. Deploy!

## MCP Tools

### Basic Tools (FREE)
- `basic.greet` - Greet the user
- `basic.time` - Get current time

### Advanced Tools (PRO+)
- `advanced.calculate` - Calculate mathematical expressions
- `advanced.weather` - Get weather information

### Analytics Tools (ENTERPRISE)
- `analytics.usage` - Get usage analytics
- `analytics.export` - Export usage data

### Admin Tools (ENTERPRISE)
- `admin.list_users` - List all users
- `admin.reset_calls` - Reset call count for a user

## API Endpoints

### MCP Endpoint
- `POST /.netlify/functions/mcp` - Main MCP tool execution
- `POST /api/mcp` - Redirect to MCP function

### Authentication
- `POST /.netlify/functions/create-account` - Create account and get JWT token
- `POST /api/subscribe` - Alias for account creation and plan signup
- `POST /.netlify/functions/refresh-token` - Refresh JWT token

### Health Check
- `GET /.netlify/functions/health` - Server health status

## Security Notes

- Always use HTTPS in production
- Store secrets securely (Netlify environment variables)
- Implement rate limiting
- Use a real database instead of in-memory storage for production

## License

MIT
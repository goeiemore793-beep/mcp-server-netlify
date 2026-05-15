# MCP Server Paid Access

This is a Model Context Protocol (MCP) server with paid access control using Paddle checkout. It provides tiered subscription plans with different tool access levels.

## Features

- **Tiered Subscriptions**: FREE, PRO, and ENTERPRISE plans
- **Tool Access Control**: Different tools available based on subscription tier
- **Usage Tracking**: Call counting and limits per subscription
- **Paddle Integration**: Payment processing and subscription validation
- **JWT Authentication**: Secure token-based authentication
- **Webhooks**: Real-time subscription event handling

## Installation

```bash
npm install
npm run build
```

## Environment Configuration

Create a `.env` file in the project root:

```env
PADDLE_VENDOR_ID=your_paddle_vendor_id
PADDLE_VENDOR_AUTH_CODE=your_paddle_vendor_auth_code
JWT_SECRET=your_jwt_secret_at_least_32_chars_long
PORT=8080
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Paddle Integration

### 1. Create Paddle Products & Plans
Set up your subscription products in Paddle with these plans:
- FREE: $0/month (limit 10 calls)
- PRO: $9.99/month (limit 1000 calls)
- ENTERPRISE: $99.99/month (limit 10000 calls)

### 2. Configure Paddle Webhooks
Set up the following webhook URL in your Paddle dashboard:
```
https://your-server.com/webhooks/paddle
```

### 3. Generate Paddle Vendor Credentials
Get your Vendor ID and Vendor Auth Code from Paddle dashboard.

## API Endpoints

### Authentication
- `POST /api/auth/create` - Create account and get JWT token
- `POST /api/auth/refresh` - Refresh JWT token

### Webhooks
- `POST /webhooks/paddle` - Paddle subscription events

### Health Check
- `GET /health` - Server health status

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

## Deployment

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

### Environment Variables
Make sure to set all required environment variables in production.

## Security Notes

- Always verify Paddle webhook signatures in production
- Use HTTPS in production
- Store secrets securely (use secret manager in production)
- Implement proper database instead of in-memory storage for production
- Add rate limiting and additional security measures

## License

MIT
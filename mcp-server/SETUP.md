# MCP Server Paid Access

## Environment Configuration

Create a `.env` file in the project root with your credentials:

```env
# Paddle Credentials
PADDLE_VENDOR_ID=your_vendor_id_here
PADDLE_VENDOR_AUTH_CODE=your_vendor_auth_code_here

# JWT Settings
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long

# Server Configuration
PORT=8080
NODE_ENV=production
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Configure Environment
Copy the `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
notepad .env  # Edit with your values
```

### 4. Run the Server
```bash
npm start
```

## Docker Deployment

### 1. Build Docker Image
```bash
docker build -t mcp-server-paid .
```

### 2. Run Docker Container
```bash
docker run -d -p 8080:8080 -e PADDLE_VENDOR_ID -e PADDLE_VENDOR_AUTH_CODE -e JWT_SECRET mcp-server-paid
```

### 3. Deploy to Production
For production deployment, consider using:
- **AWS**: ECS, Elastic Beanstalk, or Lambda
- **Google Cloud**: Cloud Run or Cloud Functions
- **Azure**: App Service or Container Instances
- **Vercel/Netlify**: For serverless deployment

## Paddle Setup

### 1. Create Paddle Account
Sign up at [Paddle](https://paddle.com) and verify your account.

### 2. Create Subscription Plans
In your Paddle dashboard:
1. Go to Products → Subscriptions
2. Create three plans:
   - **FREE**: $0/month, 10 calls limit
   - **PRO**: $9.99/month, 1000 calls limit  
   - **ENTERPRISE**: $99.99/month, 10000 calls limit

### 3. Get Vendor Credentials
In Paddle dashboard:
1. Go to Sellers → Developer Tools
2. Get your Vendor ID and Vendor Auth Code

### 4. Configure Webhooks
Set up webhook URL in Paddle dashboard:
```
https://your-domain.com/webhooks/paddle
```

## Testing

### 1. Start with FREE Plan
```bash
# Get FREE access token
curl -X POST http://localhost:8080/api/auth/create \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "subscriptionPlan": "FREE", "paymentId": "free_test_id"}'

# Use the token with MCP client
```

### 2. Upgrade to PRO
```bash
# After payment, get PRO access token
curl -X POST http://localhost:8080/api/auth/create \
  -H "Content-Type: application/json" \
  -d '{"email": "pro@example.com", "subscriptionPlan": "PRO", "paymentId": "paddle_subscription_id"}'
```

## Monitoring

### Health Check
```bash
curl http://localhost:8080/health
```

### Usage Analytics (ENTERPRISE only)
```bash
# With valid ENTERPRISE token
curl -X POST http://localhost:8080/ -d '{
  "action": "analytics.usage",
  "token": "your_token"
}'
```

## Troubleshooting

### Common Issues

#### Webhook Not Received
- Check Paddle webhook configuration
- Verify server is running and accessible
- Check firewall/security group settings

#### Invalid Credentials
- Verify Paddle Vendor ID and Auth Code
- Check JWT Secret length (should be at least 32 characters)

#### Subscription Not Validating
- Verify payment ID with Paddle API
- Check subscription status in Paddle dashboard

### Logging
Enable detailed logging by setting:
```env
LOG_LEVEL=debug
```

## Security Considerations

### Production Security
- Always use HTTPS in production
- Verify Paddle webhook signatures
- Store secrets in environment variables or secret manager
- Implement rate limiting
- Use proper database instead of in-memory storage
- Add input validation and sanitization

### Paddle Webhook Security
```javascript
// In production, verify webhook signature
const crypto = require('crypto');
const publicKey = `-----BEGIN PUBLIC KEY-----\n${PADDLE_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

const verifySignature = (signature, data) => {
  return crypto.verify(
    'sha256',
    Buffer.from(data, 'utf8'),
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(signature, 'base64')
  );
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
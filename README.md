# Paid MCP Server

A comprehensive Paid Model Context Protocol (MCP) server built with Node.js, Express, and TypeScript.

## Features

- **MCP Tools**: Includes calculator, weather, and a secure payment processor out-of-the-box.
- **Authentication**: JWT-based authentication system.
- **Monetization**: Integrated with Solana Pay and Ethereum for decentralized crypto payments.
- **Security**: Helmet middleware for HTTP headers, Redis for rate limiting.
- **Robust Logging**: Winston integration for structured logging.
- **Deploy Ready**: Configured for Docker and Netlify deployments.

## Installation

```bash
# Clone the repository
git clone https://github.com/mcp-server/paid-mcp-server.git
cd paid-mcp-server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## Configuration

Update your `.env` file:
- `PORT`: Server port (default: 3000)
- `AUTH_SECRET`: Secret key for JWT
- `SOLANA_RPC_URL`: Solana RPC endpoint (default: devnet)
- `ETH_RPC_URL`: Ethereum RPC endpoint
- `MERCHANT_WALLET_ADDRESS_SOL`: Your Solana wallet address (default: EW6cbRu9t5dtD6QHgiyjqrdv36fhp9DAFyGJaPZQp8My)
- `MERCHANT_WALLET_ADDRESS_ETH`: Your Ethereum wallet address (default: 0x2Ba73558fA3A07aCC63A14d7E0ad37B5055AEd57)
- `REDIS_URL`: Redis connection URL
- `RATE_LIMIT`: Max requests per hour
- `LOG_LEVEL`: Logging level (info, debug, error)

## Usage

Start the server in development mode:
```bash
npm run dev
```

Build and run in production:
```bash
npm run build
npm start
```

## Testing

This project uses Jest and Supertest.
```bash
npm run test
```

## Deployment

### Docker
```bash
npm run docker:up
```

### Netlify
The project is configured for Netlify deployment via `netlify.toml`. Push to a connected GitHub repository to deploy automatically.

## Contribution Guidelines
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
MIT

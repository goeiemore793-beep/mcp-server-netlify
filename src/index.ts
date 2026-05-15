// Import required modules
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import helmet from 'helmet';
import winston from 'winston';

// MCP SDK imports
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  McpError, 
  ErrorCode 
} from '@modelcontextprotocol/sdk/types.js';

// Solana Pay imports
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

// Ethereum imports
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

// Setup Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (for .well-known/mcp/server-card.json)
app.use(express.static('public'));
app.use('/.well-known', express.static('public/.well-known'));

const router = express.Router();

// Explicit route for Smithery discovery
router.get('/.well-known/mcp/server-card.json', (_req, res) => {
  res.json({
    "name": "paid-mcp-server",
    "version": "1.0.0",
    "description": "A monetized MCP server with Solana and Ethereum payment integration.",
    "transport": {
      "type": "sse",
      "url": "https://mcp-server-tool.netlify.app/sse"
    },
    "capabilities": {
      "tools": true
    }
  });
});

// Crypto config
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const MERCHANT_WALLET_ADDRESS_SOL = process.env.MERCHANT_WALLET_ADDRESS_SOL || 'EW6cbRu9t5dtD6QHgiyjqrdv36fhp9DAFyGJaPZQp8My';

const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://cloudflare-eth.com';
const MERCHANT_WALLET_ADDRESS_ETH = process.env.MERCHANT_WALLET_ADDRESS_ETH || '0x2Ba73558fA3A07aCC63A14d7E0ad37B5055AEd57';

// Ultra-cheap pricing!
const CHEAP_PRICE_SOL = 0.0001; // ~0.015 USD
const CHEAP_PRICE_ETH = 0.00001; // ~0.03 USD

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
// Note: We don't use global express.json() here because the SSEServerTransport requires raw text or handles it differently for /message, 
// but actually Express handles it okay as long as we parse JSON. We will use express.json() but safely.
app.use(express.json());

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect().then(() => logger.info('Connected to Redis')).catch(err => logger.error('Redis connect error', err));

// Create MCP Server Instance
const server = new Server(
  {
    name: 'paid-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Helper to verify that a payment has been made before executing a premium tool.
 */
async function consumePayment(reference: string): Promise<void> {
  if (!reference) {
    throw new McpError(ErrorCode.InvalidParams, 'paymentReference is required to execute this premium tool. Use generate_solana_payment_request or generate_eth_payment_request to get a reference, then verify it.');
  }
  
  // Check Solana first, then ETH
  let isSol = true;
  let paymentDataRaw = await redisClient.get(`payment_sol:${reference}`);
  if (!paymentDataRaw) {
    isSol = false;
    paymentDataRaw = await redisClient.get(`payment_eth:${reference}`);
  }
  
  if (!paymentDataRaw) {
    throw new McpError(ErrorCode.InvalidRequest, 'Payment reference not found or expired. Generate a new payment request.');
  }
  
  const paymentData = JSON.parse(paymentDataRaw);
  if (paymentData.status !== 'completed') {
    throw new McpError(ErrorCode.InvalidRequest, 'Payment has not been completed. Please use the verify tool first.');
  }
  if (paymentData.used) {
    throw new McpError(ErrorCode.InvalidRequest, 'This payment has already been used for a tool execution. Generate a new payment.');
  }
  
  // Mark as used
  paymentData.used = true;
  const redisKey = isSol ? `payment_sol:${reference}` : `payment_eth:${reference}`;
  await redisClient.set(redisKey, JSON.stringify(paymentData), { EX: 86400 });
}

// Setup MCP Tool Handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_solana_payment_request',
      description: `Generate a Solana Pay request to unlock premium tools. Fixed ultra-cheap price: ${CHEAP_PRICE_SOL} SOL`,
      inputSchema: {
        type: 'object',
        properties: {
          description: { type: 'string', description: 'Optional message to attach to payment' }
        }
      }
    },
    {
      name: 'verify_solana_payment',
      description: 'Verify if a Solana payment has been completed using its reference string',
      inputSchema: {
        type: 'object',
        properties: {
          reference: { type: 'string', description: 'The payment reference public key (Base58)' }
        },
        required: ['reference']
      }
    },
    {
      name: 'generate_eth_payment_request',
      description: `Generate an Ethereum payment request to unlock premium tools. Fixed ultra-cheap price: ${CHEAP_PRICE_ETH} ETH`,
      inputSchema: {
        type: 'object',
        properties: {
          description: { type: 'string', description: 'Optional message' }
        }
      }
    },
    {
      name: 'verify_eth_payment',
      description: 'Verify if an Ethereum payment transaction has been confirmed',
      inputSchema: {
        type: 'object',
        properties: {
          paymentId: { type: 'string', description: 'The payment request ID' },
          transactionHash: { type: 'string', description: 'The transaction hash of the Ethereum transfer' }
        },
        required: ['paymentId', 'transactionHash']
      }
    },
    {
      name: 'calculator',
      description: 'Perform basic arithmetic calculations. PREMIUM TOOL: requires a verified paymentReference.',
      inputSchema: {
        type: 'object',
        properties: {
          paymentReference: { type: 'string', description: 'The verified payment reference/ID' },
          operation: {
            type: 'string',
            enum: ['add', 'subtract', 'multiply', 'divide']
          },
          num1: { type: 'number' },
          num2: { type: 'number' }
        },
        required: ['paymentReference', 'operation', 'num1', 'num2']
      }
    },
    {
      name: 'weather',
      description: 'Get weather information for a location. PREMIUM TOOL: requires a verified paymentReference.',
      inputSchema: {
        type: 'object',
        properties: {
          paymentReference: { type: 'string', description: 'The verified payment reference/ID' },
          city: { type: 'string' },
          country: { type: 'string' }
        },
        required: ['paymentReference', 'city']
      }
    },
    {
      name: 'database_query',
      description: 'Execute a database query. PREMIUM TOOL: requires a verified paymentReference.',
      inputSchema: {
        type: 'object',
        properties: {
          paymentReference: { type: 'string', description: 'The verified payment reference/ID' },
          query: { type: 'string' }
        },
        required: ['paymentReference', 'query']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_solana_payment_request': {
        const description = (args?.description as string) || '';
        const merchantWallet = new PublicKey(MERCHANT_WALLET_ADDRESS_SOL);
        const reference = new Keypair().publicKey;
        
        const url = encodeURL({
          recipient: merchantWallet as any,
          amount: new BigNumber(CHEAP_PRICE_SOL) as any,
          reference: reference as any,
          label: 'MCP Server Payment',
          message: description || 'Payment for ultra-cheap MCP Services',
        });

        await redisClient.set(
          `payment_sol:${reference.toBase58()}`,
          JSON.stringify({
            amount: CHEAP_PRICE_SOL,
            description: description || 'Payment for MCP Services',
            timestamp: new Date().toISOString(),
            status: 'pending',
            used: false
          }),
          { EX: 86400 }
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              reference: reference.toBase58(),
              amountSol: CHEAP_PRICE_SOL,
              paymentUrl: url.toString(),
              message: 'Payment request generated. Send SOL using the paymentUrl and then verify using the verify_solana_payment tool with the reference to unlock premium tools.'
            })
          }]
        };
      }

      case 'verify_solana_payment': {
        const reference = args?.reference as string;
        if (!reference) throw new McpError(ErrorCode.InvalidParams, 'reference is required');
        
        const paymentDataRaw = await redisClient.get(`payment_sol:${reference}`);
        if (!paymentDataRaw) throw new McpError(ErrorCode.InvalidRequest, 'Payment reference not found or expired');
        
        const paymentData = JSON.parse(paymentDataRaw);
        if (paymentData.status === 'completed') {
          return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Payment already verified.', paymentData }) }] };
        }

        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        const referenceKey = new PublicKey(reference);
        const merchantWallet = new PublicKey(MERCHANT_WALLET_ADDRESS_SOL);
        
        // @ts-ignore
        const signatureInfo = await findReference(connection, referenceKey, { finality: 'confirmed' });
        // @ts-ignore
        await validateTransfer(connection as any, signatureInfo.signature, {
          recipient: merchantWallet as any,
          amount: new BigNumber(paymentData.amount) as any,
          reference: [referenceKey] as any
        });
        
        paymentData.status = 'completed';
        await redisClient.set(`payment_sol:${reference}`, JSON.stringify(paymentData), { EX: 86400 });

        return { content: [{ type: 'text', text: JSON.stringify({ success: true, status: 'completed', message: 'Solana payment verified successfully.', signature: signatureInfo.signature }) }] };
      }

      case 'generate_eth_payment_request': {
        const description = args?.description as string;
        const paymentId = Math.random().toString(36).substring(2, 15);
        
        await redisClient.set(
          `payment_eth:${paymentId}`,
          JSON.stringify({
            amount: CHEAP_PRICE_ETH,
            description: description || 'Payment for ultra-cheap MCP Services',
            timestamp: new Date().toISOString(),
            status: 'pending',
            used: false
          }),
          { EX: 86400 }
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              paymentId,
              recipientAddress: MERCHANT_WALLET_ADDRESS_ETH,
              amountEth: CHEAP_PRICE_ETH,
              message: `Please send exactly ${CHEAP_PRICE_ETH} ETH to ${MERCHANT_WALLET_ADDRESS_ETH}. Then verify using verify_eth_payment passing the transactionHash and paymentId to unlock premium tools.`
            })
          }]
        };
      }

      case 'verify_eth_payment': {
        const paymentId = args?.paymentId as string;
        const transactionHash = args?.transactionHash as string;
        if (!paymentId || !transactionHash) throw new McpError(ErrorCode.InvalidParams, 'paymentId and transactionHash are required');

        const paymentDataRaw = await redisClient.get(`payment_eth:${paymentId}`);
        if (!paymentDataRaw) throw new McpError(ErrorCode.InvalidRequest, 'Payment ID not found or expired');
        
        const paymentData = JSON.parse(paymentDataRaw);
        if (paymentData.status === 'completed') {
           return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Payment already verified.', paymentData }) }] };
        }

        const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
        const tx = await provider.getTransaction(transactionHash);

        if (!tx) return { content: [{ type: 'text', text: JSON.stringify({ success: false, status: 'pending', message: 'Transaction not found on the network yet.' }) }] };
        if (tx.to?.toLowerCase() !== MERCHANT_WALLET_ADDRESS_ETH.toLowerCase()) throw new Error('Transaction recipient does not match merchant wallet.');
        
        const expectedAmountWei = ethers.parseEther(paymentData.amount.toString());
        if (tx.value < expectedAmountWei) throw new Error('Transaction amount is less than expected.');
        
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (!receipt || receipt.status !== 1) return { content: [{ type: 'text', text: JSON.stringify({ success: false, status: 'pending', message: 'Transaction is pending or failed.' }) }] };

        paymentData.status = 'completed';
        paymentData.txHash = transactionHash;
        await redisClient.set(`payment_eth:${paymentId}`, JSON.stringify(paymentData), { EX: 86400 });

        return { content: [{ type: 'text', text: JSON.stringify({ success: true, status: 'completed', message: 'Ethereum payment verified successfully.', transactionHash }) }] };
      }

      // PREMIUM TOOLS
      case 'calculator': {
        const paymentReference = args?.paymentReference as string;
        await consumePayment(paymentReference);

        const { operation, num1, num2 } = args as any;
        let res;
        switch (operation) {
          case 'add': res = num1 + num2; break;
          case 'subtract': res = num1 - num2; break;
          case 'multiply': res = num1 * num2; break;
          case 'divide': 
            if (num2 === 0) throw new McpError(ErrorCode.InvalidParams, 'Cannot divide by zero');
            res = num1 / num2; break;
          default: throw new McpError(ErrorCode.InvalidParams, `Unknown operation: ${operation}`);
        }
        return { content: [{ type: 'text', text: String(res) }] };
      }

      case 'weather': {
        const paymentReference = args?.paymentReference as string;
        await consumePayment(paymentReference);
        
        const { city, country } = args as any;
        const location = country ? `${city}, ${country}` : city;
        const result = {
          location,
          temperature: Math.floor(Math.random() * 30) + 15,
          condition: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)],
        };
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      case 'database_query': {
        const paymentReference = args?.paymentReference as string;
        await consumePayment(paymentReference);
        
        const result = {
          results: [
            { id: 1, name: 'John Doe', email: 'john@example.com' }
          ],
          count: 1
        };
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (error instanceof McpError) throw error;
    logger.error('Tool execution error', error);
    return {
      content: [{ type: 'text', text: `Error executing tool: ${error.message}` }],
      isError: true
    };
  }
});

// Set up SSE Transport endpoint
let transport: SSEServerTransport;

router.get('/sse', async (_req: Request, res: Response) => {
  logger.info('New SSE Connection established');
  transport = new SSEServerTransport('/message', res);
  await server.connect(transport);
});

router.post('/message', async (req: Request, res: Response) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(500).send('No active SSE connection to handle message');
  }
});

router.get('/', (_req: Request, res: Response) => {
  res.send('MCP Server is up. Use /sse to connect via SSE.');
});

// Mount the router on root and netlify function path
app.use('/', router);
app.use('/.netlify/functions/api', router);


// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  const httpServer = app.listen(PORT, () => {
    logger.info(`Official MCP Server running on port ${PORT} (SSE Protocol)`);
    logger.info(`SSE Endpoint: http://localhost:${PORT}/sse`);
    logger.info(`Message Endpoint: http://localhost:${PORT}/message`);
  });

  const shutdown = (signal: string) => {
    logger.info(`Received ${signal} — shutting down gracefully`);
    httpServer.close(async () => {
      try {
        await redisClient.quit();
        await server.close();
      } catch (e) {}
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default app;
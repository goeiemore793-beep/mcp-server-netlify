import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequest, EvaluateRequest } from '@modelcontextprotocol/sdk/types.js';
import { Server as FastifyServer } from 'fastify';
import * as dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  // Paddle credentials
  PADDLE_VENDOR_ID: process.env.PADDLE_VENDOR_ID!,
  PADDLE_VENDOR_AUTH_CODE: process.env.PADDLE_VENDOR_AUTH_CODE!,
  PADDLE_API_URL: 'https://vendors.paddle.com/api/2.0',
  
  // JWT settings
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: '7d',
  
  // Pricing tiers
  PLANS: {
    FREE: { maxCalls: 10, tools: ['basic'] },
    PRO: { maxCalls: 1000, tools: ['basic', 'advanced', 'analytics'] },
    ENTERPRISE: { maxCalls: 10000, tools: ['basic', 'advanced', 'analytics', 'admin'] }
  },
  
  // Server port
  PORT: process.env.PORT || 8080
};

// Initialize Paddle API client
const paddleApi = axios.create({
  baseURL: CONFIG.PADDLE_API_URL,
  params: {
    vendorid: CONFIG.PADDLE_VENDOR_ID,
    vendorauthcode: CONFIG.PADDLE_VENDOR_AUTH_CODE
  }
});

// In-memory storage for demo purposes
// In production, use a real database
const users = new Map<string, {
  userId: string;
  email: string;
  passwordHash: string;
  subscriptionPlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  paymentId?: string;
  maxCalls: number;
  callsMade: number;
}>();

const sessions = new Map<string, {
  userId: string;
  expiresAt: number;
}>();

// Helper functions
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });
}

async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

async function getSubscriptionStatus(userId: string): Promise<{
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  maxCalls: number;
  callsMade: number;
  expiresAt?: string;
}> {
  const user = users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    plan: user.subscriptionPlan,
    maxCalls: user.maxCalls,
    callsMade: user.callsMade,
    expiresAt: user.paymentId ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined // 30 days from now
  };
}

// MCP Tools
const tools = {
  // Basic tools available to all users
  basic: {
    name: 'basic',
    description: 'Basic utility tools for everyday tasks',
    async execute({ arguments: args, token }: any) {
      const userId = await verifyToken(token);
      if (!userId) {
        throw new Error('Authentication required');
      }
      
      const status = await getSubscriptionStatus(userId);
      if (status.callsMade >= status.maxCalls) {
        throw new Error(`Subscription limit reached. Plan: ${status.plan}, Max calls: ${status.maxCalls}, Calls made: ${status.callsMade}`);
      }
      
      // Update call count
      const user = users.get(userId)!;
      user.callsMade++;
      
      // Basic tool implementations
      switch (args.action) {
        case 'greet':
          return { message: `Hello! You've used ${user.callsMade} out of ${status.maxCalls} calls this period.` };
        case 'time':
          return { time: new Date().toISOString() };
        case 'echo':
          return { result: args.message };
        default:
          throw new Error('Unknown basic action');
      }
    }
  },
  
  // Advanced tools for PRO users
  advanced: {
    name: 'advanced',
    description: 'Advanced tools for power users',
    async execute({ arguments: args, token }: any) {
      const userId = await verifyToken(token);
      if (!userId) {
        throw new Error('Authentication required');
      }
      
      const status = await getSubscriptionStatus(userId);
      if (status.plan !== 'PRO' && status.plan !== 'ENTERPRISE') {
        throw new Error('Advanced tools require PRO subscription');
      }
      
      if (status.callsMade >= status.maxCalls) {
        throw new Error(`Subscription limit reached. Plan: ${status.plan}, Max calls: ${status.maxCalls}, Calls made: ${status.callsMade}`);
      }
      
      // Update call count
      const user = users.get(userId)!;
      user.callsMade++;
      
      // Advanced tool implementations
      switch (args.action) {
        case 'calculate':
          if (!args.expression) {
            throw new Error('Expression required');
          }
          try {
            // Simple expression evaluation (in production, use a math parser)
            const result = eval(args.expression); // eslint:ignore
            return { result };
          } catch (error) {
            throw new Error('Invalid expression');
          }
        case 'weather':
          // Mock weather data
          return {
            city: args.city || 'Unknown',
            temperature: 20 + Math.random() * 10,
            condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
          };
        default:
          throw new Error('Unknown advanced action');
      }
    }
  },
  
  // Analytics tools for ENTERPRISE users
  analytics: {
    name: 'analytics',
    description: 'Usage analytics and reporting tools',
    async execute({ arguments: args, token }: any) {
      const userId = await verifyToken(token);
      if (!userId) {
        throw new Error('Authentication required');
      }
      
      const status = await getSubscriptionStatus(userId);
      if (status.plan !== 'ENTERPRISE') {
        throw new Error('Analytics tools require ENTERPRISE subscription');
      }
      
      if (status.callsMade >= status.maxCalls) {
        throw new Error(`Subscription limit reached. Plan: ${status.plan}, Max calls: ${status.maxCalls}, Calls made: ${status.callsMade}`);
      }
      
      // Update call count
      const user = users.get(userId)!;
      user.callsMade++;
      
      // Analytics tool implementations
      switch (args.action) {
        case 'usage':
          return {
            userId,
            period: 'current_billing_cycle',
            callsMade: user.callsMade,
            toolsUsed: Object.keys(tools).filter(tool => tool !== 'admin'),
            subscriptionPlan: status.plan
          };
        case 'export':
          return {
            format: args.format || 'json',
            data: {
              exportedAt: new Date().toISOString(),
              records: user.callsMade
            }
          };
        default:
          throw new Error('Unknown analytics action');
      }
    }
  },
  
  // Admin tools for ENTERPRISE users
  admin: {
    name: 'admin',
    description: 'Server administration and management tools',
    async execute({ arguments: args, token }: any) {
      const userId = await verifyToken(token);
      if (!userId) {
        throw new Error('Authentication required');
      }
      
      const status = await getSubscriptionStatus(userId);
      if (status.plan !== 'ENTERPRISE') {
        throw new Error('Admin tools require ENTERPRISE subscription');
      }
      
      if (status.callsMade >= status.maxCalls) {
        throw new Error(`Subscription limit reached. Plan: ${status.plan}, Max calls: ${status.maxCalls}, Calls made: ${status.callsMade}`);
      }
      
      // Update call count
      const user = users.get(userId)!;
      user.callsMade++;
      
      // Admin tool implementations
      switch (args.action) {
        case 'list_users':
          // Return all users (excluding passwords)
          return {
            users: Array.from(users.values()).map(u => ({
              userId: u.userId,
              email: u.email,
              subscriptionPlan: u.subscriptionPlan,
              callsMade: u.callsMade,
              maxCalls: u.maxCalls
            }))
          };
        case 'reset_calls':
          if (!args.targetUserId) {
            throw new Error('Target user ID required');
          }
          const targetUser = users.get(args.targetUserId);
          if (!targetUser) {
            throw new Error('User not found');
          }
          targetUser.callsMade = 0;
          return { success: true, message: `Calls reset for user ${args.targetUserId}` };
        default:
          throw new Error('Unknown admin action');
      }
    }
  }
};

// Authentication endpoints for Paddle webhook
const authRoutes = {
  // Create user account and subscription
  async createSubscription(payload: any): Promise<{ token: string; user: any }> {
    // Verify Paddle webhook signature (simplified)
    // In production, use proper signature verification
    
    const { email, subscription_plan } = payload;
    
    // Create or update user
    const userId = uuidv4();
    const passwordHash = await hashPassword(uuidv4() + email); // Random password
    
    const user = {
      userId,
      email,
      passwordHash,
      subscriptionPlan: subscription_plan as any,
      paymentId: payload.payment_id,
      maxCalls: CONFIG.PLANS[subscription_plan as keyof typeof CONFIG.PLANS].maxCalls,
      callsMade: 0
    };
    
    users.set(userId, user);
    
    // Generate JWT token
    const token = generateToken(userId);
    
    return { token, user };
  },
  
  // Validate subscription with Paddle
  async validateSubscription(paymentId: string): Promise<boolean> {
    try {
      const response = await paddleApi.get('/subscription/users', {
        params: {
          subscription_id: paymentId
        }
      });
      
      if (response.data.success && response.data.response.users.length > 0) {
        const user = response.data.response.users[0];
        return user.status === 'active';
      }
      
      return false;
    } catch (error) {
      console.error('Paddle validation error:', error);
      return false;
    }
  }
};

// Main MCP server
async function main() {
  const server = new Server(
    { name: 'paid-mcp-server', version: '1.0.0' },
    { capabilities: { tools: true } }
  );

  // Handle ListTools request
  server.setRequestHandler('tools/list', async (request: ListToolsRequest) => {
    const userId = request.params?.token ? await verifyToken(request.params.token as string) : null;
    
    if (!userId) {
      // Return only free tools for unauthenticated users
      return {
        tools: [
          {
            name: 'basic.greet',
            description: 'Greet the user',
            inputSchema: {
              type: 'object',
              properties: {
                action: { type: 'string', enum: ['greet'] },
                message: { type: 'string' }
              }
            }
          },
          {
            name: 'basic.time',
            description: 'Get current time',
            inputSchema: {
              type: 'object',
              properties: {
                action: { type: 'string', enum: ['time'] }
              }
            }
          }
        ]
      };
    }
    
    const status = await getSubscriptionStatus(userId);
    const availableTools = [];
    
    // Always include basic tools
    availableTools.push({
      name: 'basic.greet',
      description: 'Greet the user',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['greet'] },
          message: { type: 'string' }
        }
      }
    });
    
    availableTools.push({
      name: 'basic.time',
      description: 'Get current time',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['time'] }
        }
      }
    });
    
    // Include advanced tools for PRO and ENTERPRISE
    if (status.plan === 'PRO' || status.plan === 'ENTERPRISE') {
      availableTools.push({
        name: 'advanced.calculate',
        description: 'Calculate mathematical expressions',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['calculate'] },
            expression: { type: 'string' }
          }
        }
      });
      
      availableTools.push({
        name: 'advanced.weather',
        description: 'Get weather information',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['weather'] },
            city: { type: 'string' }
          }
        }
      });
    }
    
    // Include analytics tools for ENTERPRISE
    if (status.plan === 'ENTERPRISE') {
      availableTools.push({
        name: 'analytics.usage',
        description: 'Get usage analytics',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['usage'] }
          }
        }
      });
      
      availableTools.push({
        name: 'analytics.export',
        description: 'Export usage data',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['export'] },
            format: { type: 'string', enum: ['json', 'csv'] }
          }
        }
      });
    }
    
    // Include admin tools for ENTERPRISE
    if (status.plan === 'ENTERPRISE') {
      availableTools.push({
        name: 'admin.list_users',
        description: 'List all users',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['list_users'] }
          }
        }
      });
      
      availableTools.push({
        name: 'admin.reset_calls',
        description: 'Reset call count for a user',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['reset_calls'] },
            targetUserId: { type: 'string' }
          }
        }
      });
    }
    
    return { tools: availableTools };
  });

  // Handle Evaluate request for tool execution
  server.setRequestHandler('tools/evaluate', async (request: EvaluateRequest) => {
    const { name, arguments: args } = request.params;
    const token = request.params.token as string;
    
    const [toolCategory, toolAction] = name.split('.');
    
    if (!tools[toolCategory as keyof typeof tools]) {
      throw new Error(`Unknown tool category: ${toolCategory}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(await tools[toolCategory as keyof typeof tools].execute({ arguments: args, token }))
        }
      ]
    };
  });

  // HTTP server for Paddle webhooks and JWT issuance
  const fastify = FastifyServer();
  
  // Endpoint to create account and get JWT token (for new subscribers)
  fastify.post('/api/auth/create', async (request, reply) => {
    try {
      const { email, subscriptionPlan, paymentId } = request.body;
      
      if (!email || !subscriptionPlan || !paymentId) {
        return reply.code(400).send({ error: 'Missing required fields' });
      }
      
      // Validate subscription with Paddle
      const isValid = await authRoutes.validateSubscription(paymentId);
      if (!isValid) {
        return reply.code(400).send({ error: 'Invalid or inactive subscription' });
      }
      
      // Create account
      const result = await authRoutes.createSubscription({ email, subscription_plan: subscriptionPlan, payment_id: paymentId });
      
      return { success: true, token: result.token, user: result.user };
    } catch (error) {
      console.error('Auth create error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // Endpoint to refresh JWT token
  fastify.post('/api/auth/refresh', async (request, reply) => {
    try {
      const { token } = request.body;
      const userId = await verifyToken(token);
      
      if (!userId) {
        return reply.code(401).send({ error: 'Invalid token' });
      }
      
      const newToken = generateToken(userId);
      const user = users.get(userId)!;
      
      return { success: true, token: newToken, user };
    } catch (error) {
      console.error('Auth refresh error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // Paddle webhook endpoint (for subscription events)
  fastify.post('/webhooks/paddle', async (request, reply) => {
    try {
      const signature = request.headers['x-paddle-signature'];
      const postData = JSON.stringify(request.body);
      
      // In production, verify signature using Paddle public key
      // For now, just process the event
      const event = request.body;
      
      console.log('Paddle webhook received:', event);
      
      // Handle subscription events
      switch (event.alert_name) {
        case 'subscription-payment-failed':
          // Mark user as inactive or send notification
          console.log(`Payment failed for subscription ${event.subscription_id}`);
          break;
        case 'subscription-cancelled':
          // Mark user as inactive
          console.log(`Subscription cancelled for ${event.email}`);
          break;
        case 'subscription-payment-processed':
          // Update user subscription
          console.log(`Payment processed for ${event.email}, new status: ${event.status}`);
          break;
      }
      
      return reply.code(200).send({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });

  // Start HTTP server
  await fastify.listen({ port: CONFIG.PORT, host: '0.0.0.0' });
  console.log(`HTTP server running on http://localhost:${CONFIG.PORT}`);
  console.log(`MCP server endpoints:`);
  console.log(`  - Tools: basic.greet, basic.time (all users)`);
  console.log(`  - Tools: advanced.calculate, advanced.weather (PRO & ENTERPRISE)`);
  console.log(`  - Tools: analytics.usage, analytics.export, admin.* (ENTERPRISE only)`);
  console.log(`  - Authentication: POST /api/auth/create`);
  console.log(`  - Webhook: POST /webhooks/paddle`);

  // Handle graceful shutdown
  const cleanup = async () => {
    await fastify.close();
    console.log('Server stopped');
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Run MCP server
  await server.run(new StdioServerTransport());
}

main().catch(console.error);
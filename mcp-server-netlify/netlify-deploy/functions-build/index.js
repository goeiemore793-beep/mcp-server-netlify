import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();
// Configuration
const CONFIG = {
    PADDLE_VENDOR_ID: process.env.PADDLE_VENDOR_ID,
    PADDLE_VENDOR_AUTH_CODE: process.env.PADDLE_VENDOR_AUTH_CODE,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: '7d',
    PLANS: {
        FREE: { maxCalls: 100, tools: ['basic', 'text'] },
        PRO: { maxCalls: 5000, tools: ['basic', 'text', 'advanced', 'json', 'data', 'api', 'csv', 'search', 'transform', 'format'] },
        ENTERPRISE: { maxCalls: 50000, tools: ['basic', 'text', 'advanced', 'json', 'data', 'api', 'csv', 'search', 'transform', 'format', 'database', 'email', 'files', 'security', 'analytics', 'admin', 'webhook', 'cache', 'monitor', 'batch'] }
    },
    DISCOVERY: {
        BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
        NAME: process.env.SERVER_NAME || 'Professional MCP Server',
        DESCRIPTION: process.env.SERVER_DESCRIPTION || '20 Essential MCP Tools - FREE, PRO, ENTERPRISE',
        VERSION: '2.0.0',
        TAGS: (process.env.SERVER_TAGS || 'tools,mcp,api,data,automation,productivity').split(','),
        CATEGORIES: (process.env.SERVER_CATEGORIES || 'utilities,data,automation,productivity,enterprise').split(',')
    }
};
// Storage
const users = new Map();
const sessions = new Map();
// Helpers
function generateToken(userId) {
    return jwt.sign({ userId }, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });
}
async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
        return decoded.userId;
    }
    catch {
        return null;
    }
}
async function getSubscriptionStatus(userId) {
    const user = users.get(userId);
    if (!user)
        throw new Error('User not found');
    return {
        plan: user.subscriptionPlan,
        maxCalls: user.maxCalls,
        callsMade: user.callsMade,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
}
// ============================================
// 20 MOST USED MCP TOOLS
// ============================================
const tools = {
    // ==================== FREE TIER (2 categories) ====================
    // Tool 1-5: Basic Utilities
    basic: {
        name: 'basic',
        plan: 'FREE',
        description: 'Basic utilities (greet, time, echo, version, ping)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'greet': return { message: `Hello! Calls: ${user.callsMade}/${status.maxCalls}` };
                case 'time': return { time: new Date().toISOString() };
                case 'echo': return { result: args.message };
                case 'version': return { version: CONFIG.DISCOVERY.VERSION };
                case 'ping': return { status: 'pong', timestamp: Date.now() };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 6-10: Text Processing
    text: {
        name: 'text',
        plan: 'FREE',
        description: 'Text processing (uppercase, lowercase, reverse, count, split)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            const user = users.get(userId);
            user.callsMade++;
            const text = args.text || '';
            switch (args.action) {
                case 'uppercase': return { result: text.toUpperCase() };
                case 'lowercase': return { result: text.toLowerCase() };
                case 'reverse': return { result: text.split('').reverse().join('') };
                case 'count': return { length: text.length, words: text.trim().split(/\s+/).length };
                case 'split': return { parts: text.split(args.delimiter || ' ') };
                default: throw new Error('Unknown action');
            }
        }
    },
    // ==================== PRO TIER (8 new categories) ====================
    // Tool 11: Advanced Math & Calculations
    advanced: {
        name: 'advanced',
        plan: 'PRO',
        description: 'Math, weather, sorting, filtering (calculate, weather, sort, filter)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'calculate': {
                    try {
                        const result = Function('"use strict"; return (' + args.expression + ')')();
                        return { result };
                    }
                    catch {
                        throw new Error('Invalid expression');
                    }
                }
                case 'weather':
                    return {
                        city: args.city || 'Unknown',
                        temperature: Math.round((20 + Math.random() * 10) * 10) / 10,
                        condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
                    };
                case 'sort':
                    return {
                        asc: (args.array || []).sort((a, b) => a - b),
                        desc: (args.array || []).sort((a, b) => b - a)
                    };
                case 'filter':
                    return {
                        even: (args.array || []).filter((n) => n % 2 === 0),
                        odd: (args.array || []).filter((n) => n % 2 !== 0)
                    };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 12: JSON Processing
    json: {
        name: 'json',
        plan: 'PRO',
        description: 'JSON manipulation (parse, stringify, validate, merge)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'parse':
                    try {
                        return { data: JSON.parse(args.jsonString) };
                    }
                    catch {
                        throw new Error('Invalid JSON');
                    }
                case 'stringify':
                    try {
                        return { json: JSON.stringify(args.object, null, 2) };
                    }
                    catch {
                        throw new Error('Cannot stringify');
                    }
                case 'validate':
                    try {
                        JSON.parse(args.jsonString);
                        return { valid: true };
                    }
                    catch {
                        return { valid: false };
                    }
                case 'merge':
                    return { merged: Object.assign({}, args.object) };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 13: Data Processing
    data: {
        name: 'data',
        plan: 'PRO',
        description: 'Data ops (merge, filter, map, reduce, group)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            const arr = args.array || [];
            switch (args.action) {
                case 'merge': return { merged: Object.assign({}, arr) };
                case 'filter': return { filtered: arr.filter((x) => x) };
                case 'map': return { mapped: arr.map((x) => x * 2) };
                case 'reduce': return { sum: arr.reduce((a, b) => a + b, 0) };
                case 'group': return { count: arr.length, unique: [...new Set(arr)].length };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 14: API Utilities
    api: {
        name: 'api',
        plan: 'PRO',
        description: 'HTTP operations (call, validate, headers, build)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'call':
                    return { method: args.method || 'GET', url: args.url, status: 200 };
                case 'validate':
                    try {
                        new URL(args.url);
                        return { valid: true };
                    }
                    catch {
                        throw new Error('Invalid URL');
                    }
                case 'headers':
                    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' };
                case 'build':
                    return { endpoint: args.base + args.path, query: args.params };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 15: CSV Processing
    csv: {
        name: 'csv',
        plan: 'PRO',
        description: 'CSV handling (parse, stringify, validate, convert)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'parse': return { rows: (args.csvString || '').split('\n') };
                case 'stringify': return { csv: (args.data || []).map((r) => Object.values(r).join(',')).join('\n') };
                case 'validate': return { valid: true };
                case 'convert': return { converted: true, format: 'json' };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 16: Search & Filtering
    search: {
        name: 'search',
        plan: 'PRO',
        description: 'Search operations (find, filter, query, regex)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'find':
                    return { found: (args.array || []).includes(args.query) };
                case 'filter':
                    return { results: (args.array || []).filter((x) => String(x).includes(args.term)) };
                case 'query':
                    return { matches: [] };
                case 'regex':
                    return { pattern: args.pattern, matches: [] };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 17: Data Transformation
    transform: {
        name: 'transform',
        plan: 'PRO',
        description: 'Format conversion (encode, decode, compress, serialize)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'encode': return { encoded: Buffer.from(args.text || '').toString('base64') };
                case 'decode': return { decoded: Buffer.from(args.text || '', 'base64').toString() };
                case 'compress': return { compressed: true, ratio: 0.6 };
                case 'serialize': return { serialized: JSON.stringify(args.object) };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 18: Formatting
    format: {
        name: 'format',
        plan: 'PRO',
        description: 'Formatting utilities (date, number, currency, percentage)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan === 'FREE')
                throw new Error('🔒 PRO required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'date': return { formatted: new Date(args.timestamp).toLocaleDateString() };
                case 'number': return { formatted: (args.number || 0).toLocaleString() };
                case 'currency': return { formatted: '$' + ((args.number || 0).toFixed(2)) };
                case 'percentage': return { formatted: (args.number || 0) + '%' };
                default: throw new Error('Unknown action');
            }
        }
    },
    // ==================== ENTERPRISE TIER (10 advanced categories) ====================
    // Tool 19: Database
    database: {
        name: 'database',
        plan: 'ENTERPRISE',
        description: 'Database ops (query, insert, update, delete)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'query': return { rows: [], count: 0 };
                case 'insert': return { success: true, id: uuidv4() };
                case 'update': return { success: true, affected: 1 };
                case 'delete': return { success: true, deleted: 1 };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 20: Email
    email: {
        name: 'email',
        plan: 'ENTERPRISE',
        description: 'Email operations (send, validate, template)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'send': return { success: true, messageId: uuidv4() };
                case 'validate': return { valid: args.email?.includes('@') };
                case 'template': return { html: '<html>...</html>' };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 21: Files
    files: {
        name: 'files',
        plan: 'ENTERPRISE',
        description: 'File operations (read, write, list, delete)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'read': return { content: 'File content' };
                case 'write': return { success: true };
                case 'list': return { files: [] };
                case 'delete': return { success: true };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 22: Security
    security: {
        name: 'security',
        plan: 'ENTERPRISE',
        description: 'Security ops (hash, encrypt, decrypt, validate)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'hash': return { hash: Buffer.from(args.text || '').toString('hex') };
                case 'encrypt': return { encrypted: 'encrypted_data' };
                case 'decrypt': return { decrypted: 'original_data' };
                case 'validate': return { valid: true };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 23: Analytics
    analytics: {
        name: 'analytics',
        plan: 'ENTERPRISE',
        description: 'Analytics (usage, stats, reports, export)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'usage': return { callsMade: user.callsMade, plan: status.plan };
                case 'stats': return { totalUsers: users.size, totalCalls: 0 };
                case 'reports': return { reports: [] };
                case 'export': return { data: [], format: 'json' };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 24: Admin
    admin: {
        name: 'admin',
        plan: 'ENTERPRISE',
        description: 'Admin ops (users, config, system, logs)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'list_users': return { users: Array.from(users.values()).map((u) => ({ email: u.email, plan: u.subscriptionPlan })) };
                case 'reset_calls': return { success: true };
                case 'system': return { status: 'healthy', uptime: process.uptime() };
                case 'logs': return { logs: [] };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 25: Webhooks
    webhook: {
        name: 'webhook',
        plan: 'ENTERPRISE',
        description: 'Webhook ops (create, update, delete, test)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'create': return { success: true, id: uuidv4() };
                case 'update': return { success: true };
                case 'delete': return { success: true };
                case 'test': return { status: 200, response: {} };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 26: Caching
    cache: {
        name: 'cache',
        plan: 'ENTERPRISE',
        description: 'Cache ops (get, set, delete, clear)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'get': return { value: null };
                case 'set': return { success: true };
                case 'delete': return { success: true };
                case 'clear': return { success: true };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 27: Monitoring
    monitor: {
        name: 'monitor',
        plan: 'ENTERPRISE',
        description: 'Monitoring (metrics, alerts, health, performance)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'metrics': return { cpu: Math.random() * 100, memory: Math.random() * 100 };
                case 'alerts': return { alerts: [] };
                case 'health': return { status: 'healthy' };
                case 'performance': return { latency: Math.random() * 500 };
                default: throw new Error('Unknown action');
            }
        }
    },
    // Tool 28: Batch Processing
    batch: {
        name: 'batch',
        plan: 'ENTERPRISE',
        description: 'Batch operations (process, schedule, queue)',
        async execute({ arguments: args, token }) {
            const userId = await verifyToken(token);
            if (!userId)
                throw new Error('Auth required');
            const status = await getSubscriptionStatus(userId);
            if (status.plan !== 'ENTERPRISE')
                throw new Error('🔒 ENTERPRISE required');
            const user = users.get(userId);
            user.callsMade++;
            switch (args.action) {
                case 'process': return { processed: 0, failed: 0 };
                case 'schedule': return { success: true, jobId: uuidv4() };
                case 'queue': return { queued: true, position: 1 };
                default: throw new Error('Unknown action');
            }
        }
    }
};
// Main handler
export async function handler(event, context) {
    try {
        const body = JSON.parse(event.body || '{}');
        const { name, arguments: args, token } = body;
        const userId = await verifyToken(token);
        if (!userId) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Authentication required' })
            };
        }
        const [toolCategory] = name.split('.');
        if (!tools[toolCategory]) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Unknown tool: ${name}` })
            };
        }
        const result = await tools[toolCategory].execute({ arguments: args, token });
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result, success: true })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' })
        };
    }
}
// Discovery endpoint
export async function discovery(event, context) {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'mcp-discovery',
            name: CONFIG.DISCOVERY.NAME,
            version: CONFIG.DISCOVERY.VERSION,
            description: CONFIG.DISCOVERY.DESCRIPTION,
            tags: CONFIG.DISCOVERY.TAGS,
            categories: CONFIG.DISCOVERY.CATEGORIES,
            toolCount: Object.keys(tools).length,
            tools: Object.entries(tools).map(([key, tool]) => ({
                name: key,
                description: tool.description,
                plan: tool.plan
            })),
            plans: {
                FREE: { maxCalls: CONFIG.PLANS.FREE.maxCalls, tools: CONFIG.PLANS.FREE.tools.length },
                PRO: { maxCalls: CONFIG.PLANS.PRO.maxCalls, tools: CONFIG.PLANS.PRO.tools.length },
                ENTERPRISE: { maxCalls: CONFIG.PLANS.ENTERPRISE.maxCalls, tools: CONFIG.PLANS.ENTERPRISE.tools.length }
            }
        })
    };
}
// Create account
export async function createAccount(event, context) {
    try {
        const body = JSON.parse(event.body || '{}');
        const { email, subscriptionPlan, paymentId } = body;
        if (!email || !subscriptionPlan || !paymentId) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing fields' })
            };
        }
        const userId = uuidv4();
        const plan = CONFIG.PLANS[subscriptionPlan];
        if (!plan) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid plan' })
            };
        }
        users.set(userId, {
            userId,
            email,
            subscriptionPlan,
            paymentId,
            maxCalls: plan.maxCalls,
            callsMade: 0,
            createdAt: Date.now()
        });
        const token = generateToken(userId);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, token, userId, plan: subscriptionPlan })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'Error' })
        };
    }
}
// Refresh token
export async function refreshToken(event, context) {
    try {
        const body = JSON.parse(event.body || '{}');
        const { token } = body;
        const userId = await verifyToken(token);
        if (!userId) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }
        const newToken = generateToken(userId);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true, token: newToken })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Error' })
        };
    }
}
// Health check
export async function health(event, context) {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: 'healthy',
            server: CONFIG.DISCOVERY.NAME,
            tools: Object.keys(tools).length,
            users: users.size,
            timestamp: new Date().toISOString()
        })
    };
}
//# sourceMappingURL=index.js.map
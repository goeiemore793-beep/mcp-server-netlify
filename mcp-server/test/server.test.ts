#!/usr/bin/env node

/**
 * MCP Server Test Script
 * 
 * This script tests the MCP server functionality with different subscription tiers.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const BASE_URL = `http://localhost:8080`;
const TEST_EMAIL = `test-${Date.now()}@example.com`;

// Test cases for different subscription plans
const testCases = [
  {
    name: 'FREE Plan - Basic Tools Only',
    plan: 'FREE',
    paymentId: `free_${Date.now()}`,
    expectedTools: ['basic.greet', 'basic.time'],
    expectedLimits: { maxCalls: 10, hasAdvanced: false, hasAnalytics: false }
  },
  {
    name: 'PRO Plan - Advanced Tools',
    plan: 'PRO',
    paymentId: `pro_${Date.now()}`,
    expectedTools: ['basic.greet', 'basic.time', 'advanced.calculate', 'advanced.weather'],
    expectedLimits: { maxCalls: 1000, hasAdvanced: true, hasAnalytics: false }
  },
  {
    name: 'ENTERPRISE Plan - All Tools',
    plan: 'ENTERPRISE',
    paymentId: `enterprise_${Date.now()}`,
    expectedTools: ['basic.greet', 'basic.time', 'advanced.calculate', 'advanced.weather', 'analytics.usage', 'analytics.export', 'admin.list_users', 'admin.reset_calls'],
    expectedLimits: { maxCalls: 10000, hasAdvanced: true, hasAnalytics: true }
  }
];

// Initialize axios
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// Function to create account and get token
async function createAccount(testCase: any) {
  console.log(`\n🚀 Testing: ${testCase.name}`);
  
  try {
    const response = await axiosInstance.post('/api/auth/create', {
      email: TEST_EMAIL,
      subscriptionPlan: testCase.plan,
      paymentId: testCase.paymentId
    });

    const { token, user } = response.data;
    console.log(`✓ Account created: ${user.email}`);
    console.log(`  Subscription: ${user.subscriptionPlan}`);
    console.log(`  Max calls: ${user.maxCalls}`);
    
    return token;
  } catch (error: any) {
    console.error(`✗ Failed to create account: ${error.message || error}`);
    return null;
  }
}

// Function to test available tools
async function testAvailableTools(token: string, testCase: any) {
  try {
    const response = await axiosInstance.get('/api/tools/list', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tools = response.data.tools;
    const toolNames = tools.map((tool: any) => tool.name);
    
    // Check expected tools
    const missingTools = testCase.expectedTools.filter(tool => !toolNames.includes(tool));
    
    if (missingTools.length === 0) {
      console.log('✓ All expected tools available');
      return true;
    } else {
      console.error(`✗ Missing tools: ${missingTools.join(', ')}`);
      return false;
    }
  } catch (error: any) {
    console.error(`✗ Failed to list tools: ${error.message || error}`);
    return false;
  }
}

// Function to test tool execution
async function testToolExecution(token: string, toolName: string, args: any = {}) {
  try {
    const response = await axiosInstance.post('/api/tools/execute', {
      name: toolName,
      arguments: args
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✓ ${toolName} executed successfully`);
    return true;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.log(`✗ ${toolName}: Access denied (expected for this plan)`);
    } else {
      console.error(`✗ ${toolName} failed: ${error.message || error}`);
    }
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting MCP Server Paid Access Tests\n');
  console.log('========================================\n');

  let allTestsPassed = true;

  for (const testCase of testCases) {
    const token = await createAccount(testCase);
    
    if (token) {
      const toolsTest = await testAvailableTools(token, testCase);
      allTestsPassed = allTestsPassed && toolsTest;
      
      // Test basic tools
      await testToolExecution(token, 'basic.greet');
      await testToolExecution(token, 'basic.time');
      
      // Test advanced tools if expected
      if (testCase.expectedLimits.hasAdvanced) {
        await testToolExecution(token, 'advanced.calculate', { expression: '2 + 2' });
        await testToolExecution(token, 'advanced.weather', { city: 'New York' });
      } else {
        await testToolExecution(token, 'advanced.calculate', { expression: '2 + 2' });
      }
      
      // Test analytics tools if expected
      if (testCase.expectedLimits.hasAnalytics) {
        await testToolExecution(token, 'analytics.usage');
      } else {
        await testToolExecution(token, 'analytics.usage');
      }
    } else {
      allTestsPassed = false;
    }
  }

  console.log('\n========================================\n');
  
  if (allTestsPassed) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the output above.');
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
runTests().catch(console.error);
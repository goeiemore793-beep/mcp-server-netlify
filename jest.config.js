/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transformIgnorePatterns: [
    "node_modules/(?!(uuid|@solana/web3.js|@solana/pay|bignumber.js|rpc-websockets|@modelcontextprotocol)/)"
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
};

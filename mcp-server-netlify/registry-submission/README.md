# Registry Submission Assets

This folder contains ready-to-submit metadata for registering the MCP server in major discovery directories.

## Live service
- Production URL: `https://mcp-server-netlify-20260513.netlify.app`
- Discovery endpoint: `https://mcp-server-netlify-20260513.netlify.app/discovery`
- Auth creation: `https://mcp-server-netlify-20260513.netlify.app/api/auth/create`
- Auth refresh: `https://mcp-server-netlify-20260513.netlify.app/api/auth/refresh`
- Tool execution: `https://mcp-server-netlify-20260513.netlify.app/api/mcp`
- Health check: `https://mcp-server-netlify-20260513.netlify.app/health`

## Targets
1. **Anthropic MCP Registry**
   - Submit a PR to `https://github.com/anthropic/mcp-registry`
   - Use the included `anthropic-mcp-registry-entry.json` for manifest data

2. **General tool directories**
   - Submit the service listing using the `general-discovery-payload.json`
   - Use it for community directories, smart search indexes, and paid service marketplaces

3. **Claude/agent ecosystems**
   - Share the discovery endpoint and public API metadata
   - Provide authentication and plan details

4. **Paid usage listing**
   - Emphasize the paid/pro/enterprise subscription model and API monetization
   - Use the `plans` section in the payload

## How to use

### Anthropic MCP Registry
1. Fork `https://github.com/anthropic/mcp-registry`
2. Add a new service entry under the appropriate manifest file
3. Use the JSON values from `anthropic-mcp-registry-entry.json`
4. Open a PR referencing the live `discovery` endpoint and this repository

### Generic directories
1. Open the directory listing submission form
2. Copy the metadata from `general-discovery-payload.json`
3. Use the live service URLs and tags/categories
4. Mention that the API is paid and supports subscription-based access

## Important note
This repo does not have network access to submit PRs directly. These files are prepared for one-click submission from your own account.

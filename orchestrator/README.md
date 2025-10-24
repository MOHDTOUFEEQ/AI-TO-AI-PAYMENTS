# Orchestrator

Backend orchestrator for AI-to-AI payments. Listens for blockchain events and coordinates AI agent services.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`:

```bash
# Contract
MEDIA_FACTORY_ADDRESS=0x...

# Network
ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
# OR
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Orchestrator wallet (needs ETH for gas)
ORCHESTRATOR_PRIVATE_KEY=0x...

# Agent wallets
SCRIPT_AGENT_WALLET=0x...
SOUND_AGENT_WALLET=0x...
VIDEO_AGENT_WALLET=0x...

# API
PORT=3001
BASE_URL=http://localhost:3001
```

3. Start the orchestrator:

```bash
npm start
```

## API Endpoints

-   `GET /health` - Health check
-   `GET /api/request/:id` - Get request details
-   `GET /api/receipt/:id` - AP2 receipt data
-   `POST /api/callback/:id` - AP2 callback endpoint
-   `GET /api/metadata/:id` - Request metadata
-   `GET /api/mcp-context/:id` - MCP context manifest

## Flow

1. User submits video request on-chain via frontend
2. Orchestrator detects `VideoRequested` event
3. Orchestrator sets AP2/x402/MCP metadata
4. Orchestrator calls AI agent services (script → sound → video)
5. After each stage completes, orchestrator pays the agent on-chain
6. Request completes with all agents paid

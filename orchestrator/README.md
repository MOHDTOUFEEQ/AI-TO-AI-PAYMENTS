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

### Core Endpoints

-   `GET /health` - Health check
-   `GET /api/request/:id` - Get request details
-   `GET /api/receipt/:id` - AP2 receipt data
-   `POST /api/callback/:id` - AP2 callback endpoint
-   `GET /api/metadata/:id` - Request metadata
-   `GET /api/mcp-context/:id` - MCP context manifest
-   `GET /api/x402-challenge/:id` - x402 payment verification challenge

### Payment Channel Endpoints

-   `GET /api/channels/:id` - Get payment channel IDs for a request
-   `GET /api/payment-signature/:requestId/:agent` - Get signed payment for an agent
-   `GET /api/payment-signatures/:requestId` - Get all payment signatures
-   `POST /api/claim-payment` - Get claim instructions for agents

### Agent Balance Endpoints (Mock)

-   `GET /api/balances` - Get all agent balances
-   `GET /api/balance/:agentType` - Get specific agent balance

## Flow

1. User submits video request on-chain via frontend
2. Orchestrator detects `VideoRequested` event
3. Orchestrator sets AP2/x402/MCP metadata on-chain
4. Orchestrator opens payment channels for all agents (1 TX)
5. Orchestrator calls AI agent services (script → sound → video)
6. After each stage completes, orchestrator signs off-chain payment (0 gas!)
7. **MOCK**: Agents automatically close channels and claim payments (demo)
8. Request completes with all agents paid

## Mock Channel Closure

The orchestrator includes a **mock channel closure** feature that automatically simulates agents closing their payment channels at the end of each request. This demonstrates the complete payment flow:

-   **Shows balance updates** before and after payment
-   **Simulates gas costs** for realistic calculations
-   **Tracks agent balances** across multiple requests
-   **Provides detailed logging** of the entire process

### Check Agent Balances

```bash
# Get all agent balances
curl http://localhost:3001/api/balances

# Get specific agent balance
curl http://localhost:3001/api/balance/script
curl http://localhost:3001/api/balance/sound
curl http://localhost:3001/api/balance/video
```

### Production vs Mock

In **production**, agents claim payments independently:

```bash
node agents/claimService.js <requestId> <agentType> <privateKey>
```

In **demo mode**, the mock automatically shows the complete flow for educational purposes.

See [MOCK_CHANNEL_CLOSURE.md](./MOCK_CHANNEL_CLOSURE.md) for full documentation.

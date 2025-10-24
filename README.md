# AI-to-AI Payments

Blockchain-based system for coordinating payments between AI agents on Arbitrum.

## Architecture

-   **Smart Contract** (`contracts/PaymentContract.sol`): MediaFactory contract with AP2/x402/MCP flow support
-   **Orchestrator** (`orchestrator/`): Backend event listener and agent coordinator
-   **Frontend** (`frontend/`): Web UI for submitting video requests
-   **Agents** (`agents/`): Individual AI agent services

## Quick Start

### 1. Deploy Contract

```bash
# Install dependencies
npm install

# Configure .env (see .env.example)
cp .env.example .env

# Deploy to Arbitrum Sepolia (testnet)
hardhat run scripts/deploy.js --network arbitrumSepolia

# Or deploy to Arbitrum One (mainnet)
hardhat run scripts/deploy.js --network arbitrum
```

### 2. Setup Orchestrator

```bash
cd orchestrator
npm install

# Configure .env
cd ..
cp .env orchestrator/.env

# Start orchestrator
cd orchestrator
npm start
```

### 3. Open Frontend

```bash
# Open frontend/index.html in browser
# Update CONTRACT_ADDRESS in the HTML file
```

## Features

### ✅ AP2 Flow Support

-   Receipt URIs for job tickets
-   Callback URIs for status updates
-   Metadata URIs for request context

### ✅ x402 Challenge Support

-   Challenge/invoice URIs for conditional payments
-   Agent-negotiable pricing

### ✅ MCP Context Support

-   Tool manifests for AI agents
-   Dynamic context negotiation

### ✅ On-Chain Payments

-   Verifiable agent payments
-   Immutable payment history
-   Owner-controlled agent wallets

## Smart Contract

**MediaFactory** - Deployed on Arbitrum

Functions:

-   `requestVideo(prompt)` - Submit a video request (payable)
-   `payAgent(requestId, agentWallet, amount)` - Pay an agent (owner only)
-   `defineAP2Flow(...)` - Set AP2 metadata (owner only)
-   `defineX402Challenge(...)` - Set x402 challenge (owner only)
-   `setMCPContext(...)` - Set MCP context (owner only)
-   `getChainId()` - Get current chain ID

Events:

-   `VideoRequested` - Emitted when user submits request
-   `AgentPaid` - Emitted when agent is paid
-   `AP2FlowDefined` - Emitted when AP2 metadata is set
-   `X402ChallengeDefined` - Emitted when x402 challenge is set
-   `MCPContextSet` - Emitted when MCP context is set

## Networks

-   **Arbitrum Sepolia**: Chain ID 421614 (Testnet)
-   **Arbitrum One**: Chain ID 42161 (Mainnet)

## Environment Variables

```bash
# Networks
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Wallets
DEPLOYER_PRIVATE_KEY=0x...
ORCHESTRATOR_PRIVATE_KEY=0x...

# Agent Wallets
SCRIPT_AGENT_WALLET=0x...
SOUND_AGENT_WALLET=0x...
VIDEO_AGENT_WALLET=0x...

# Contract
MEDIA_FACTORY_ADDRESS=0x...

# Orchestrator
PORT=3001
BASE_URL=http://localhost:3001
```

## Development

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy locally
npm run deploy:local
```

## License

MIT

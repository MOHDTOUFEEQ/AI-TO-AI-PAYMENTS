# AI-to-AI Payment System - Setup Complete ✅

## System Status

### ✅ Deployed Contract

-   **Address**: `0x6720c5604b76801F1475333DAf7Bd7E6D7D16c33`
-   **Network**: Arbitrum Sepolia (Chain ID: 421614)
-   **Features**:
    -   Video request submissions
    -   AP2/x402/MCP flow support
    -   On-chain agent payments

### ✅ Running Services

1. **Orchestrator** (Port 3001)

    - Listens for `VideoRequested` events
    - Coordinates AI agent workflows
    - Pays agents on-chain

2. **Mock AI Services** (Port 3000)

    - Script generation endpoint
    - Sound generation endpoint
    - Video generation endpoint

3. **Frontend** (`frontend/index.html`)
    - MetaMask integration
    - Video request submission
    - Payment handling

## Payment Flow (Currently Active)

When you submit a video request:

1. **User Payment** → Contract receives ETH + prompt
2. **Event Emission** → `VideoRequested(requestId, user, prompt)`
3. **Orchestrator Detection** → Picks up event
4. **AP2/MCP Setup** → Creates metadata URIs
5. **AI Agent Calls**:
    - Script Agent (30% payment) → Generates script
    - Sound Agent (30% payment) → Generates audio
    - Video Agent (40% payment) → Generates video
6. **On-Chain Payments** → Each agent paid via `payAgent()`
7. **Event Logging** → `AgentPaid` events emitted

## What's Working Now

✅ Smart contract deployed and verified ✅ Frontend connects to MetaMask ✅ Payment transactions execute successfully  
✅ Orchestrator listens for events ✅ Mock AI services respond with logs ✅ Payment logic ready to execute

## Testing the Full Flow

### Submit a Request

1. Open `frontend/index.html`
2. Connect MetaMask (Arbitrum Sepolia)
3. Enter prompt: "Create a coffee commercial"
4. Send payment (minimum 0.0000001 ETH)
5. Watch orchestrator logs for processing

### Monitor Logs

**Orchestrator**:

```bash
cd orchestrator
# Check terminal where npm start is running
```

**AI Services**:

```bash
# Check terminal where services are running
# You'll see:
# 📝 Script Agent called
# 🎵 Sound Agent called
# 🎬 Video Agent called
```

### Query Request Status

```bash
# Get request details
curl http://localhost:3001/api/request/0

# Get AP2 receipt
curl http://localhost:3001/api/receipt/0

# Get MCP context
curl http://localhost:3001/api/mcp-context/0
```

## Agent Wallets

Script: `0xb8Cc4aDcd6756F61E4a465B50ecEf26e3e5C8958` Sound: `0x4058352F37fc14D1400d6624F4B11c8916A260ae` Video: `0x5d1A7E9CDb8f7Bf00d40dD3056363f358067De5b`

These wallets will receive payments when the orchestrator pays agents.

## Next Steps

To see the full flow in action:

1. Submit another video request via frontend
2. Watch orchestrator terminal for event detection
3. See AI service logs as each agent is called
4. Verify on-chain payments on Arbiscan

The system is ready for end-to-end testing!

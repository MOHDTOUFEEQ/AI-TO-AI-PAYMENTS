# Live Flow with Channel Closures - Complete Guide

## What's Now Set Up

✅ **Mock closure is re-integrated** - The orchestrator will automatically simulate channel closures after each video request  
✅ **Balance API endpoints added** - You can query agent balances at any time  
✅ **Complete flow visualization** - Shows from start to finish including fund distribution

## Two Ways to Complete the Flow

### Option 1: Mock Closures (DEMO/TESTING) ✅ Currently Active

**Status**: ✅ **READY TO USE** - Just start the orchestrator!

**What happens:**

1. User submits video request → Payment received
2. Orchestrator processes → Channels opened → Off-chain settlements signed
3. **Mock closure automatically runs** → Shows agents claiming payments
4. Complete flow summary displayed

**To test right now:**

```bash
cd orchestrator
npm start
```

Then submit a video request from the frontend, and watch the complete flow including mock closures!

**Check balances:**

```bash
# All balances
curl http://localhost:3001/api/balances

# Specific agent
curl http://localhost:3001/api/balance/script
```

---

### Option 2: Real Closures (PRODUCTION)

**Status**: ⚠️ Requires removing mock + agents claiming manually

**What's needed:**

#### 1. Remove Mock from Video Processor

Edit `src/services/videoProcessor.js` and **comment out** lines 348-408:

```javascript
// ========== STEP 6: MOCK CHANNEL CLOSURE (DEMO) ==========
// console.log("⏳ Preparing to simulate channel closures in 2 seconds...\n");
// await new Promise((resolve) => setTimeout(resolve, 2000));
//
// const closureResults = await mockCloseAllChannels({
//   script: { channelId: channelIds[0], amount: ethers.formatEther(scriptAmount), signature: scriptSignature },
//   sound: { channelId: channelIds[1], amount: ethers.formatEther(soundAmount), signature: soundSignature },
//   video: { channelId: channelIds[2], amount: ethers.formatEther(videoAmount), signature: videoSignature },
// });
//
// ... (comment out all the final summary section too)
```

#### 2. Agents Claim Independently

Each agent needs to run the claim service:

```bash
# Script Agent claims
node orchestrator/agents/claimService.js \
  <requestId> \
  script \
  <scriptAgentPrivateKey>

# Sound Agent claims
node orchestrator/agents/claimService.js \
  <requestId> \
  sound \
  <soundAgentPrivateKey>

# Video Agent claims
node orchestrator/agents/claimService.js \
  <requestId> \
  video \
  <videoAgentPrivateKey>
```

#### 3. Monitor Real Balances

Query real on-chain balances:

```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc");

// Check agent balance
const balance = await provider.getBalance("0xAgentWalletAddress");
console.log("Balance:", ethers.formatEther(balance), "ETH");
```

Or use Arbitrum Sepolia explorer:

```
https://sepolia.arbiscan.io/address/<agentWalletAddress>
```

---

## What's Currently Happening in Live Flow

### With Mock (Current Setup)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User submits request (frontend)                         │
│    • MetaMask popup                                         │
│    • Transaction confirmed                                  │
├─────────────────────────────────────────────────────────────┤
│ 2. Orchestrator detects event                              │
│    • VideoRequested event fired                             │
│    • processVideoRequest() called                           │
├─────────────────────────────────────────────────────────────┤
│ 3. AP2/x402/MCP Setup (3 on-chain TXs)                    │
│    • Authorization established                              │
│    • Payment verification active                            │
│    • Agent capabilities defined                             │
├─────────────────────────────────────────────────────────────┤
│ 4. Channels Opened (1 on-chain TX)                        │
│    • 3 payment channels created                             │
│    • Funds locked in contract                               │
├─────────────────────────────────────────────────────────────┤
│ 5. Content Generation + Off-Chain Settlements              │
│    • Script generated → Signature created (0 gas)           │
│    • Sound generated → Signature created (0 gas)            │
│    • Video generated → Signature created (0 gas)            │
├─────────────────────────────────────────────────────────────┤
│ 6. ⭐ MOCK CLOSURE (Automatic)                             │
│    • Simulates script agent closing channel                 │
│    • Simulates sound agent closing channel                  │
│    • Simulates video agent closing channel                  │
│    • Updates mock balances                                  │
│    • Shows complete financial summary                       │
├─────────────────────────────────────────────────────────────┤
│ 7. ✅ COMPLETE                                             │
│    • Flow finished                                          │
│    • All agents "paid" (mock)                               │
│    • Balances queryable via API                             │
└─────────────────────────────────────────────────────────────┘

Total upfront TXs: 5 (AP2/x402/MCP + channels)
Agent closures: 0 (simulated)
Total time: ~10-15 seconds
```

### Without Mock (Production Setup)

```
┌─────────────────────────────────────────────────────────────┐
│ 1-5. Same as above (AP2/x402/MCP + channels + settlements) │
├─────────────────────────────────────────────────────────────┤
│ 6. Flow "pauses" here                                       │
│    • Channels remain OPEN                                   │
│    • Signatures available via API                           │
│    • Waiting for agents to claim...                         │
├─────────────────────────────────────────────────────────────┤
│ 7. Script Agent Claims (whenever ready)                    │
│    • Retrieves signature from API                           │
│    • Calls closeChannel() on-chain (1 TX)                   │
│    • Receives funds in wallet                               │
├─────────────────────────────────────────────────────────────┤
│ 8. Sound Agent Claims (whenever ready)                     │
│    • Same process as script agent                           │
│    • Independent timing                                     │
├─────────────────────────────────────────────────────────────┤
│ 9. Video Agent Claims (whenever ready)                     │
│    • Same process as script agent                           │
│    • Independent timing                                     │
├─────────────────────────────────────────────────────────────┤
│ 10. ✅ COMPLETE (when all agents claim)                    │
│    • All channels closed                                    │
│    • All agents paid on-chain                               │
│    • Real balances updated on Arbitrum Sepolia              │
└─────────────────────────────────────────────────────────────┘

Total upfront TXs: 5 (orchestrator)
Agent closures: 3 (paid by agents, when they're ready)
Total time: Variable (depends on when agents claim)
```

---

## Testing Right Now

### Test Mock Closure (Standalone)

```bash
cd orchestrator
node test-mock-closure.js
```

Expected output:

```
✅ Final Agent Balances:
   • Script Agent: 0.7000215 ETH
   • Sound Agent: 0.700043 ETH
   • Video Agent: 0.7000745 ETH

TEST PASSED ✓
```

### Test Full Flow with Mock

```bash
# Terminal 1: Start orchestrator
cd orchestrator
npm start

# Terminal 2: Submit request from frontend
# Open browser → http://localhost:5173 (or wherever frontend runs)
# Submit a video request

# Watch Terminal 1 for complete flow including mock closure

# Terminal 3: Check balances after
curl http://localhost:3001/api/balances | jq
```

---

## API Endpoints Available

### Payment Channel Endpoints

```bash
# Get channel IDs for a request
GET /api/channels/:requestId

# Get signed payment for an agent
GET /api/payment-signature/:requestId/:agent

# Get all payment signatures
GET /api/payment-signatures/:requestId

# Get claim instructions
POST /api/claim-payment
```

### Balance Endpoints (Mock)

```bash
# Get all agent balances
GET /api/balances

# Get specific agent balance
GET /api/balance/script
GET /api/balance/sound
GET /api/balance/video
```

### Example Responses

**Get Balances:**

```bash
curl http://localhost:3001/api/balances
```

Response:

```json
{
  "timestamp": "2025-10-25T14:00:00.000Z",
  "note": "Mock balances for demonstration purposes",
  "agents": {
    "script": {
      "wallet": "0xb8Cc52e280cA135f0CB8C4FeE9cC88e8958",
      "balance": "0.500030000000000000",
      "unit": "ETH"
    },
    "sound": { ... },
    "video": { ... }
  },
  "summary": {
    "totalBalance": "1.500100000000000000 ETH"
  }
}
```

**Get Payment Signature:**

```bash
curl http://localhost:3001/api/payment-signature/0/script
```

Response:

```json
{
	"requestId": "0",
	"agent": "script",
	"payment": {
		"channelId": "0x1234...",
		"amount": "30000000000000",
		"amountETH": "0.00003",
		"nonce": 0,
		"signature": "0xabc123...",
		"timestamp": "2025-10-25T14:00:00.000Z",
		"status": "signed"
	},
	"instructions": {
		"step1": "Call PaymentChannel.closeChannel(channelId, amount, nonce, signature)",
		"step2": "Funds will be transferred to your wallet",
		"step3": "Any unused funds will be refunded to the payer"
	}
}
```

---

## Comparison: Mock vs Real

| Aspect               | Mock Closure                | Real Closure                     |
| -------------------- | --------------------------- | -------------------------------- |
| **Execution**        | Automatic                   | Manual (agents trigger)          |
| **Timing**           | Immediate (~2 sec delay)    | Variable (when agents ready)     |
| **Gas Cost**         | Simulated                   | Real (0.0000085 ETH per closure) |
| **Network**          | None                        | Arbitrum Sepolia                 |
| **Balances**         | In-memory (mock)            | On-chain (real)                  |
| **Transaction Hash** | Generated (mock)            | Real blockchain hash             |
| **Block Number**     | Random (mock)               | Real block number                |
| **Verification**     | Simulated                   | On-chain ECDSA check             |
| **Best For**         | Demos, testing, development | Production, real payments        |

---

## Configuration Options

### Adjust Mock Balances

Edit `src/services/mockChannelClosure.js`:

```javascript
function initializeMockBalances() {
	agentBalances.set(config.agentWallets.script, ethers.parseEther("0.5"));
	agentBalances.set(config.agentWallets.sound, ethers.parseEther("0.3"));
	agentBalances.set(config.agentWallets.video, ethers.parseEther("0.7"));
}
```

### Adjust Mock Gas Costs

```javascript
const mockGasUsed = 85000n; // ~85k gas for closeChannel
const mockGasPrice = ethers.parseUnits("0.1", "gwei"); // Arbitrum gas
```

### Adjust Delays

```javascript
// Delay before closures start
await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds

// Delay between agent closures
await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms
```

---

## Troubleshooting

### Mock not running

**Symptoms**: Flow ends at "Settlements: SIGNED", no closure happens

**Cause**: Mock closure code commented out or import missing

**Fix**: Verify these lines exist in `videoProcessor.js`:

```javascript
// Line 5
const { mockCloseAllChannels } = require("./mockChannelClosure.js");

// Line 348-356
const closureResults = await mockCloseAllChannels({...});
```

### Balances showing zero

**Symptoms**: API returns all balances as "0.0"

**Cause**: No requests processed yet, balances not initialized

**Fix**: Submit a video request first, then check balances

### API 404 errors

**Symptoms**: `/api/balances` returns 404

**Cause**: Routes not loaded or orchestrator not running

**Fix**:

1. Restart orchestrator
2. Verify `routes.js` has balance endpoints (lines 307-364)
3. Check `src/api/routes.js` imports mockChannelClosure (line 5)

### Real closure failing

**Symptoms**: Agent claim throws "Invalid signature" error

**Cause**: Signature format mismatch or wrong signer

**Fix**: Verify signature was created correctly by orchestrator and matches contract expectations

---

## Summary

### ✅ What's Working Now (Mock Mode)

-   Complete flow visualization from start to finish
-   Automatic channel closure simulation
-   Agent balance tracking
-   API endpoints for balance queries
-   Beautiful formatted logging
-   Comprehensive financial summary

### 🔄 For Production (Real Mode)

You need:

1. Comment out mock closure in `videoProcessor.js`
2. Agents claim independently using `claimService.js`
3. Monitor real on-chain balances
4. Wait for agents to close channels at their convenience

### 📊 Current Status

**Mode**: MOCK (Demo/Testing)  
**Status**: ✅ READY TO USE  
**Action**: Just run `npm start` and submit a request!

---

## Quick Commands

```bash
# Start orchestrator with mock closures
cd orchestrator && npm start

# Test mock closure standalone
cd orchestrator && node test-mock-closure.js

# Check balances
curl http://localhost:3001/api/balances | jq

# Check specific agent
curl http://localhost:3001/api/balance/script | jq

# Get payment signature (for real closure)
curl http://localhost:3001/api/payment-signature/0/script | jq

# Real agent claim (production mode)
node agents/claimService.js 0 script "0xPrivateKey..."
```

---

## Next Steps

1. **Test the mock flow** - Start orchestrator and submit a request
2. **Watch the logs** - See complete flow including closures
3. **Query balances** - Use API to check agent balances
4. **When ready for production** - Comment out mock, use real claims

The live flow with closures is **READY TO GO!** 🚀

# Mock Channel Closure Feature

## Overview

The mock channel closure functionality simulates the complete payment channel flow, including agents closing their channels and claiming payments. This demonstrates the entire lifecycle from channel opening to fund distribution, with detailed balance tracking.

## What It Does

1. **Tracks Agent Balances**: Maintains mock balances for all three agents (script, sound, video)
2. **Simulates Channel Closure**: Mimics the on-chain process of closing payment channels
3. **Shows Balance Updates**: Displays before/after balances with transaction details
4. **Calculates Gas Costs**: Estimates realistic gas costs for channel closure transactions
5. **Provides Comprehensive Logging**: Beautiful, detailed output showing the entire process

## Features

### Automatic Integration

The mock closure is automatically called at the end of the video processing flow:

```
User Request → Channels Open → Off-Chain Settlements → MOCK CLOSURE → Complete
```

### Balance Tracking

Mock balances are initialized with realistic starting amounts:

-   Script Agent: 0.5 ETH
-   Sound Agent: 0.3 ETH
-   Video Agent: 0.7 ETH

### Realistic Simulation

Each channel closure simulates:

-   Signature verification
-   Channel state checks
-   Nonce validation
-   Fund transfers
-   Gas cost calculation (~85,000 gas per closure)
-   Transaction hash generation
-   Block confirmation

## API Endpoints

### Get All Agent Balances

```bash
GET http://localhost:3001/api/balances
```

**Response:**

```json
{
	"timestamp": "2025-10-25T12:00:00.000Z",
	"note": "Mock balances for demonstration purposes",
	"agents": {
		"script": {
			"wallet": "0xb8Cc52e280cA135f0CB8C4FeE9cC88e8958",
			"balance": "0.500030000000000000",
			"unit": "ETH"
		},
		"sound": {
			"wallet": "0x4058a004D3Cb6C0cac15633671C1ceD9f11630ae",
			"balance": "0.300030000000000000",
			"unit": "ETH"
		},
		"video": {
			"wallet": "0x5d1AA7f1B33A8C1F7C2a7c78b6F3D2C5E4f0Ae5b",
			"balance": "0.700040000000000000",
			"unit": "ETH"
		}
	},
	"summary": {
		"totalBalance": "1.500100000000000000 ETH"
	}
}
```

### Get Specific Agent Balance

```bash
GET http://localhost:3001/api/balance/script
GET http://localhost:3001/api/balance/sound
GET http://localhost:3001/api/balance/video
```

**Response:**

```json
{
	"timestamp": "2025-10-25T12:00:00.000Z",
	"agentType": "script",
	"wallet": "0xb8Cc52e280cA135f0CB8C4FeE9cC88e8958",
	"balance": "0.500030000000000000",
	"unit": "ETH"
}
```

## Usage

### As Part of Video Processing Flow

The mock closure runs automatically:

```javascript
// In orchestrator/src/listeners/eventListener.js
contract.on("VideoRequested", async (requestId, user, prompt, event) => {
	await processVideoRequest(requestId, user, prompt);
	// Mock closure happens automatically at the end
});
```

### Standalone Testing

You can test the mock closure independently:

```javascript
const { mockCloseAllChannels } = require("./src/services/mockChannelClosure");

const paymentChannels = {
	script: {
		channelId: "0xabc...",
		amount: "0.00003",
		signature: "0xdef...",
	},
	sound: {
		channelId: "0x123...",
		amount: "0.00003",
		signature: "0x456...",
	},
	video: {
		channelId: "0x789...",
		amount: "0.00004",
		signature: "0xabc...",
	},
};

const results = await mockCloseAllChannels(paymentChannels);
console.log("All channels closed:", results);
```

## Output Example

When the mock closure runs, you'll see detailed output like this:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  STEP 6: CHANNEL CLOSURE - AGENTS CLAIM PAYMENTS (MOCK)                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝
   Purpose: Simulate agents closing channels and claiming their earned payments
   Status: Processing channel closures sequentially...

   💡 Note: In production, agents close channels independently when ready
   💡 This demo simulates all closures to show the complete flow

   ╔═════════════════════════════════════════════════════════════════════════════╗
   ║  CLOSURE 1/3: SCRIPT AGENT CLAIMS PAYMENT                                   ║
   ╚═════════════════════════════════════════════════════════════════════════════╝

   ┌─────────────────────────────────────────────────────────────────────────────┐
   │  CLOSING CHANNEL: SCRIPT AGENT                                              │
   └─────────────────────────────────────────────────────────────────────────────┘
   📊 Agent Status:
      • Wallet Address: 0xb8Cc52e280cA135f0CB8C4FeE9cC88e8958
      • Balance Before: 0.5 ETH
      • Channel ID: 0x1234567890abcdef...
      • Amount to Claim: 0.00003 ETH

   🔄 Simulating Channel Closure Transaction...
      • Step 1: Verifying signature on-chain... ✓
      • Step 2: Checking channel is open... ✓
      • Step 3: Verifying nonce (0)... ✓
      • Step 4: Transferring funds to agent... ✓
      • Step 5: Closing channel state... ✓
      • Step 6: Emitting ChannelClosed event... ✓

   ✅ Channel Closed Successfully!
      • Transaction Hash: 0xabcdef1234567890...
      • Block Number: 50123456
      • Gas Used: 85,000 gas
      • Gas Price: 0.1 gwei
      • Gas Cost: 0.0000000085 ETH

   💰 Payment Settlement:
      ┌────────────────────────────────┬──────────────────────┐
      │ Metric                         │ Value                │
      ├────────────────────────────────┼──────────────────────┤
      │ Balance Before                 │              0.5 ETH │
      │ Amount Received                │           0.00003 ETH │
      │ Gas Cost                       │      0.0000000085 ETH │
      │ Balance After                  │        0.50002999 ETH │
      │ Net Gain                       │        0.00002999 ETH │
      └────────────────────────────────┴──────────────────────┘

   🎯 Channel Status: CLOSED
      • Funds Released: 0.00003 ETH
      • Agent Paid: ✓
      • Channel State: Finalized
```

## Complete Flow Timeline

```
Time    Action                                     Gas Cost    Agent Balance
────────────────────────────────────────────────────────────────────────────
0:00    Initial balance                           -           0.500000 ETH
0:02    Channel opened (orchestrator pays)        -           0.500000 ETH
0:04    Work completed, signature received        0 gas       0.500000 ETH
0:06    Agent closes channel                      85k gas     0.500030 ETH
0:06    Balance after gas                         -0.000009   0.500021 ETH
────────────────────────────────────────────────────────────────────────────
        Net gain                                                +0.000021 ETH
```

## Financial Summary

The final output shows comprehensive financial details:

```
📊 Individual Agent Results:
┌─────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Agent       │ Balance Before   │ Amount Received  │ Gas Cost         │ Net Gain         │
├─────────────┼──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Script      │            0.5 ETH │         0.00003 ETH │     0.0000085 ETH │     0.0000215 ETH │
│ Sound       │            0.3 ETH │         0.00003 ETH │     0.0000085 ETH │     0.0000215 ETH │
│ Video       │            0.7 ETH │         0.00004 ETH │     0.0000085 ETH │     0.0000315 ETH │
└─────────────┴──────────────────┴──────────────────┴──────────────────┴──────────────────┘

📈 Current Agent Balances:
┌─────────────┬──────────────────────────────────────────────┬──────────────────┐
│ Agent       │ Wallet Address                               │ Current Balance  │
├─────────────┼──────────────────────────────────────────────┼──────────────────┤
│ Script      │ 0xb8Cc52e280cA135f0CB8C4FeE9cC88e8958      │      0.5000215 ETH │
│ Sound       │ 0x4058a004D3Cb6C0cac15633671C1ceD9f11630ae │      0.3000215 ETH │
│ Video       │ 0x5d1AA7f1B33A8C1F7C2a7c78b6F3D2C5E4f0Ae5b │      0.7000315 ETH │
└─────────────┴──────────────────────────────────────────────┴──────────────────┘

💰 Financial Summary:
┌──────────────────────────────────────┬──────────────────┐
│ Metric                               │ Value            │
├──────────────────────────────────────┼──────────────────┤
│ Total Payments Distributed           │         0.0001 ETH │
│ Total Gas Costs (paid by agents)    │     0.0000255 ETH │
│ Total Net Received by Agents         │     0.0000745 ETH │
└──────────────────────────────────────┴──────────────────┘
```

## Configuration

Balances and gas costs can be adjusted in `mockChannelClosure.js`:

```javascript
// Initial balances
agentBalances.set(config.agentWallets.script, ethers.parseEther("0.5"));
agentBalances.set(config.agentWallets.sound, ethers.parseEther("0.3"));
agentBalances.set(config.agentWallets.video, ethers.parseEther("0.7"));

// Gas estimates
const mockGasUsed = 85000n; // Realistic estimate for closeChannel
const mockGasPrice = ethers.parseUnits("0.1", "gwei"); // Arbitrum gas price
```

## Benefits

### For Demos

-   Shows complete payment flow end-to-end
-   Demonstrates balance changes
-   Provides realistic transaction details
-   Helps visualize gas costs

### For Development

-   Test integration without real transactions
-   Debug payment calculations
-   Verify flow logic
-   Prototype UI components

### For Understanding

-   See how channels work
-   Understand gas economics
-   Learn about balance management
-   Visualize the complete lifecycle

## Comparison: Mock vs Real

| Feature          | Mock Closure     | Real Closure         |
| ---------------- | ---------------- | -------------------- |
| Speed            | Instant (~200ms) | 2-5 seconds          |
| Gas Cost         | Simulated        | Real (paid by agent) |
| Network          | None             | Arbitrum Sepolia     |
| Balances         | In-memory        | On-chain             |
| Transaction Hash | Generated        | Real blockchain hash |
| Verification     | Simulated        | On-chain ECDSA check |

## Transition to Production

To use real channel closures instead of mock:

1. **Remove mock closure call** from `videoProcessor.js`:

```javascript
// Comment out or remove this line:
// const closureResults = await mockCloseAllChannels(...);
```

2. **Agents claim independently** using the real claim service:

```bash
node orchestrator/agents/claimService.js <requestId> <agentType> <privateKey>
```

3. **Monitor real balances** on-chain:

```javascript
const balance = await provider.getBalance(agentAddress);
```

## Troubleshooting

### Balances not updating

-   Ensure you're calling the flow from start to finish
-   Check that `initializeMockBalances()` is called
-   Verify the mock closure is being executed

### Wrong balance values

-   Check initial balance configuration
-   Verify payment amounts are correct
-   Ensure gas calculations match expectations

### API returning zero balances

-   Make sure a request has been processed first
-   Check that mock closure has completed
-   Verify the agent type is valid (script/sound/video)

## Future Enhancements

1. **Persistence**: Save balances to database instead of memory
2. **History**: Track balance changes over time
3. **Charts**: Visualize balance changes in frontend
4. **Batch Operations**: Simulate multiple closures at once
5. **Configurable Delays**: Add realistic network delays
6. **Error Scenarios**: Simulate failed closures, reverted transactions

## Learn More

-   [Payment Channel Implementation](../PAYMENT_CHANNEL_IMPLEMENTATION.md)
-   [Payment Channel Summary](../PAYMENT_CHANNEL_SUMMARY.md)
-   [Complete User Flow](../COMPLETE_USER_FLOW.md)

# Payment Channel Quick Start Guide

Get up and running with payment channels in 5 minutes!

## Prerequisites

-   Node.js v18+
-   MetaMask with Arbitrum Sepolia testnet
-   Some testnet ETH ([Get from faucet](https://faucet.quicknode.com/arbitrum/sepolia))
-   Private keys for orchestrator and 3 agents

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Deploy PaymentChannel Contract

```bash
cd AI-TO-AI-PAYMENTS

# Deploy PaymentChannel
npx hardhat run scripts/deploy-payment-channel.js --network arbitrum-sepolia

# Note the deployed address (e.g., 0xABC...)
```

### Step 2: Update Environment Variables

Create or update `.env` in the root directory:

```bash
# Contracts
MEDIA_FACTORY_ADDRESS=0x6720c5604b76801F1475333DAf7Bd7E6D7D16c33
PAYMENT_CHANNEL_ADDRESS=0x...  # From Step 1

# RPC
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Orchestrator
ORCHESTRATOR_PRIVATE_KEY=0x...  # Your orchestrator private key

# Agent Wallets
SCRIPT_AGENT_WALLET=0x...   # Script agent address (not private key)
SOUND_AGENT_WALLET=0x...    # Sound agent address
VIDEO_AGENT_WALLET=0x...    # Video agent address

# API
BASE_URL=http://localhost:3001
PORT=3001
```

### Step 3: Update MediaFactory with PaymentChannel Address

You have two options:

**Option A: Redeploy MediaFactory with PaymentChannel address** (Recommended)

```bash
# Deploy new MediaFactory with PaymentChannel support
npx hardhat run scripts/deploy-media-factory.js --network arbitrum-sepolia

# Update .env with new MEDIA_FACTORY_ADDRESS
# Update frontend/app.js with new CONTRACT_ADDRESS
```

**Option B: Update existing MediaFactory contract**

```bash
# Using cast (Foundry)
cast send $MEDIA_FACTORY_ADDRESS \
  "setPaymentChannelContract(address)" $PAYMENT_CHANNEL_ADDRESS \
  --private-key $ORCHESTRATOR_PRIVATE_KEY \
  --rpc-url $ARBITRUM_SEPOLIA_RPC_URL

# Or using Hardhat console
npx hardhat console --network arbitrum-sepolia
> const MediaFactory = await ethers.getContractAt("MediaFactory", "0x6720c5604b76801F1475333DAf7Bd7E6D7D16c33")
> await MediaFactory.setPaymentChannelContract("0x...PaymentChannelAddress")
```

### Step 4: Verify Orchestrator is Using Payment Channels

Check that `orchestrator/src/listeners/eventListener.js` imports the payment channel processor:

```javascript
// Should be:
const { processVideoRequest } = require("../services/videoProcessor");

// Note: videoProcessor.js now contains the payment channel implementation
```

### Step 5: Start the System

```bash
# Terminal 1: Start Orchestrator
cd orchestrator
npm install  # If not already installed
npm start

# Terminal 2: Open Frontend
cd ../frontend
# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then open http://localhost:8000
```

---

## ✅ Test the System

### 1. Submit a Video Request

1. Open `frontend/index.html` in your browser
2. Connect MetaMask (ensure you're on Arbitrum Sepolia)
3. Enter a prompt: "A cat playing piano"
4. Enter amount: "0.001" ETH
5. Click "Generate Video"
6. Approve transaction in MetaMask

### 2. Watch the Orchestrator Logs

You should see:

```
📹 Processing video request 0 with PAYMENT CHANNELS...
📋 STEP 1: AP2 FLOW SETUP (Authorization Layer)
   ✅ AP2 Flow defined on-chain

🔧 STEP 2: MCP CONTEXT SETUP (Agent Capabilities)
   ✅ MCP Context set on-chain

🔐 STEP 3: x402 CHALLENGE SETUP (Payment Gateway)
   ✅ x402 Challenge defined on-chain

💰 STEP 4: OPEN PAYMENT CHANNELS (Single On-Chain Transaction)
   ✅ Payment channels opened!
   Script Agent Channel ID: 0x...
   Sound Agent Channel ID: 0x...
   Video Agent Channel ID: 0x...

📝 STAGE 1: SCRIPT GENERATION
   ✅ Script generated successfully
   💸 OFF-CHAIN PAYMENT TO SCRIPT AGENT (Zero Gas!)
   ✅ Off-chain payment signed and recorded!

🎵 STAGE 2: SOUND GENERATION
   ✅ Sound generated successfully
   💸 OFF-CHAIN PAYMENT TO SOUND AGENT (Zero Gas!)
   ✅ Off-chain payment signed and recorded!

🎬 STAGE 3: VIDEO GENERATION
   ✅ Video generated successfully
   💸 OFF-CHAIN PAYMENT TO VIDEO AGENT (Zero Gas!)
   ✅ Off-chain payment signed and recorded!

✅ REQUEST COMPLETED SUCCESSFULLY WITH PAYMENT CHANNELS!
```

### 3. Verify Payment Signatures

```bash
# Check payment signatures via API
curl http://localhost:3001/api/payment-signatures/0

# Response:
{
  "requestId": "0",
  "payments": {
    "script": {
      "channelId": "0x...",
      "amount": "300000000000000",
      "amountETH": "0.0003",
      "nonce": 0,
      "signature": "0x...",
      "timestamp": "2024-10-25T...",
      "status": "signed"
    },
    "sound": { ... },
    "video": { ... }
  }
}
```

### 4. Claim Payment as Agent

```bash
# Claim payment for script agent
node orchestrator/agents/claimService.js \
  0 \
  script \
  "0xYOUR_SCRIPT_AGENT_PRIVATE_KEY"

# Output:
💰 AGENT PAYMENT CLAIM SERVICE
   Request ID: 0
   Agent Type: script

📥 STEP 1: Retrieving Payment Signature
   ✅ Payment signature retrieved!
   Channel ID: 0x...
   Amount: 0.0003 ETH

🔍 STEP 2: Checking Channel Status
   ✅ Channel is open and you are authorized!

💸 STEP 3: Closing Channel and Claiming Payment
   ✅ Transaction confirmed!

✅ PAYMENT CLAIMED SUCCESSFULLY!
```

Repeat for sound and video agents with their respective private keys.

---

## 🔍 Verification Checklist

-   [ ] PaymentChannel contract deployed
-   [ ] MediaFactory updated with PaymentChannel address
-   [ ] Environment variables configured
-   [ ] Orchestrator using `videoProcessor.js`
-   [ ] Frontend can submit requests
-   [ ] Orchestrator opens payment channels (check logs)
-   [ ] Off-chain payments signed (check logs)
-   [ ] API returns payment signatures
-   [ ] Agents can claim payments

---

## 📊 Compare Gas Costs

### Before (Direct Payments)

```bash
# User request:        ~50,000 gas
# Pay script agent:    ~35,000 gas
# Pay sound agent:     ~35,000 gas
# Pay video agent:     ~35,000 gas
# ───────────────────────────────
# TOTAL (upfront):     ~155,000 gas
```

### After (Payment Channels)

```bash
# User request:         ~50,000 gas
# Open 3 channels:      ~120,000 gas
# Sign 3 payments:      0 gas (off-chain!)
# ────────────────────────────────
# TOTAL (upfront):      ~170,000 gas
#
# Later (when agents claim):
# Close channel:        ~45,000 gas (per agent, paid by agent)
```

**Key Difference**: 3 payment transactions eliminated (off-chain)!

---

## 🛠️ Useful Commands

### Check Channel Status

```bash
# Get channel info
cast call $PAYMENT_CHANNEL_ADDRESS \
  "getChannel(bytes32)" $CHANNEL_ID \
  --rpc-url $ARBITRUM_SEPOLIA_RPC_URL

# Check if channel is open
# Returns: (requestId, payer, payee, totalDeposit, withdrawn, nonce, isOpen, openedAt, timeout)
```

### Verify Signature

```bash
# Verify signature on-chain
cast call $PAYMENT_CHANNEL_ADDRESS \
  "verifySignature(bytes32,uint256,uint256,bytes)" \
  $CHANNEL_ID $AMOUNT $NONCE $SIGNATURE \
  --rpc-url $ARBITRUM_SEPOLIA_RPC_URL

# Returns: true or false
```

### Get Payment Signature via API

```bash
# Get signature for specific agent
curl http://localhost:3001/api/payment-signature/0/script

# Get all signatures for request
curl http://localhost:3001/api/payment-signatures/0

# Get channel IDs
curl http://localhost:3001/api/channels/0
```

### Test Claim Without Executing

```bash
# Dry run (estimate gas)
cast call $PAYMENT_CHANNEL_ADDRESS \
  "closeChannel(bytes32,uint256,uint256,bytes)" \
  $CHANNEL_ID $AMOUNT $NONCE $SIGNATURE \
  --from $AGENT_ADDRESS \
  --rpc-url $ARBITRUM_SEPOLIA_RPC_URL
```

---

## 🐛 Troubleshooting

### "Payment channel address not configured"

**Fix**: Add `PAYMENT_CHANNEL_ADDRESS` to `.env`

### "Channel already closed"

**Fix**: Each channel can only be closed once. Use a new request.

### "Invalid signature"

**Fixes**:

1. Check orchestrator private key in `.env`
2. Verify message hash format matches contract
3. Ensure nonce is correct (starts at 0)

### "Not authorized to claim"

**Fix**: Verify you're using the correct agent private key (not address)

### "Channel not open"

**Fixes**:

1. Check orchestrator opened channels (see logs)
2. Verify channel ID is correct
3. Ensure channel wasn't already closed

### Orchestrator not opening channels

**Fixes**:

1. Verify `videoProcessor.js` is imported in `eventListener.js`
2. Check `PAYMENT_CHANNEL_ADDRESS` in `.env`
3. Ensure MediaFactory has PaymentChannel address set
4. Check orchestrator has enough ETH for gas

---

## 📚 Next Steps

### Learn More

-   Read full documentation: `PAYMENT_CHANNEL_IMPLEMENTATION.md`
-   Understand the flow: `PAYMENT_CHANNEL_SUMMARY.md`
-   Review contracts: `contracts/PaymentChannel.sol`

### Advanced Usage

1. **Batch Claims**: Modify `claimService.js` to claim multiple channels
2. **Automated Claims**: Create cron job to auto-claim when threshold met
3. **Channel Monitoring**: Build dashboard to track channel status
4. **Analytics**: Track gas savings over time

### Integration

1. **Add to existing app**: Import payment channel utilities
2. **API integration**: Use REST endpoints for custom frontends
3. **Monitoring**: Add alerts for channel status changes
4. **Analytics**: Track payment volume and gas savings

---

## 🎯 Success Metrics

After implementing payment channels, you should see:

✅ **50% reduction in upfront transactions**

-   Before: 4 TX (1 user + 3 agent payments)
-   After: 2 TX (1 user + 1 open channels)

✅ **Zero gas for payment signing**

-   3 off-chain signed messages instead of 3 on-chain payments

✅ **Distributed gas costs**

-   Agents pay their own claiming gas
-   Orchestrator saves gas on every request

✅ **Better scalability**

-   Can handle 1,000s of micro-payments in one channel
-   No blockchain congestion from frequent small payments

---

## 📞 Support

### Logs to Check

1. **Orchestrator logs**: `orchestrator/orchestrator.log`
2. **Browser console**: Check for frontend errors
3. **Block explorer**: Verify transactions on Arbiscan

### Common Issues

See full troubleshooting guide in `PAYMENT_CHANNEL_IMPLEMENTATION.md`

### Need Help?

1. Check logs for specific error messages
2. Verify all environment variables are set
3. Ensure contracts are deployed and addresses are correct
4. Test each component individually

---

## 🚀 You're Ready!

Your payment channel system is now:

-   ✅ Deployed
-   ✅ Configured
-   ✅ Tested
-   ✅ Ready for production

Start submitting video requests and watch the magic happen! 🎉

For production deployment, remember to:

-   Use mainnet contracts
-   Secure private keys
-   Set up monitoring
-   Implement error handling
-   Add rate limiting
-   Enable logging

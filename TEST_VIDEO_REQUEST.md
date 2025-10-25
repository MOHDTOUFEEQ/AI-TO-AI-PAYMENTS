# Testing Video Request with Payment Channels

## ✅ Pre-Flight Checklist

1. **Orchestrator Status**:

    - ✅ Running on port 3001
    - ✅ Listening to correct MediaFactory: `0x6417C3ca31418E510269787D56B346e59846dC49`
    - ✅ PaymentChannel configured: `0xd1c473F7c7003De0527254dC02431Be7feb625c2`

2. **Frontend Status**:
    - ✅ Contract address set to: `0x6417C3ca31418E510269787D56B346e59846dC49`
    - ✅ Connected to Arbitrum Sepolia

## 🧪 Test Steps

### Step 1: Open Frontend

```bash
# Open the frontend in your browser
open frontend/index.html
# Or navigate to: file:///Users/kreeza/Desktop/Programming/Encode_London/AI-TO-AI-PAYMENTS/frontend/index.html
```

### Step 2: Connect MetaMask

1. Click "Generate Video" button
2. MetaMask will prompt to connect
3. Approve the connection
4. Ensure you're on **Arbitrum Sepolia** network

### Step 3: Submit Test Request

1. **Prompt**: "A cat playing piano"
2. **Amount**: 0.001 ETH
3. Click "Generate Video"
4. Approve the MetaMask transaction

### Step 4: Monitor Orchestrator Logs

**In your terminal, you should see:**

```
🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬
🎬 NEW VIDEO REQUEST DETECTED!
🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬
   Request ID: 0
   User: 0x...
   Prompt: A cat playing piano
   Block: 12345678
   Transaction: 0x...
🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬

████████████████████████████████████████████████████████████████████████████████
█  VIDEO REQUEST 0 - PAYMENT CHANNEL FLOW
████████████████████████████████████████████████████████████████████████████████
█  User: 0x...
█  Prompt: "A cat playing piano"
█  Timestamp: 2025-10-25T...
████████████████████████████████████████████████████████████████████████████████

╔═══════════════════════════════════════════════════════════════════════════════╗
║  STEP 1: AP2 (Agent Payment Protocol 2) - AUTHORIZATION LAYER                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
   Purpose: Authorize orchestrator to manage payment channels on behalf of user
   ...
```

## 📊 Expected Output

You should see **SEVEN MAJOR STEPS** in the logs:

1. ✅ **AP2 Authorization** - Orchestrator authorized to manage channels
2. ✅ **MCP Context** - Agent capabilities defined
3. ✅ **x402 Challenge** - Payment verification gateway active
4. ✅ **Payment Channels Opened** - 3 channels locked (1 TX!)
5. ✅ **Off-Chain Settlements** - 3 payments signed (0 gas!)
6. ✅ **Summary** - Complete payment channel status
7. ✅ **Claim Instructions** - How agents can claim funds

## 🎯 Success Indicators

### In Orchestrator Logs:

-   ✅ Event detected with correct Request ID
-   ✅ 4 on-chain transactions (AP2, MCP, x402, Channel Opening)
-   ✅ 3 off-chain signatures (script, sound, video agents)
-   ✅ Channel IDs displayed (bytes32 format)
-   ✅ Gas savings summary shown

### On Blockchain (Arbiscan):

-   Transaction to MediaFactory with `requestVideo()` call
-   4 events emitted:
    -   `VideoRequested`
    -   `AP2FlowDefined`
    -   `MCPContextSet`
    -   `X402ChallengeDefined`
    -   `PaymentChannelsOpened` (with 3 channel IDs)

## 🔍 Debugging

### If Nothing Shows in Orchestrator Logs:

1. **Check orchestrator is listening:**

    ```bash
    curl http://localhost:3001/health
    # Should return: {"status":"ok","timestamp":"..."}
    ```

2. **Verify correct contract address:**

    ```bash
    # In orchestrator logs, check for:
    # "📍 Watching contract: 0x6417C3ca31418E510269787D56B346e59846dC49"
    ```

3. **Check MetaMask network:**

    - Must be on **Arbitrum Sepolia** (Chain ID: 421614)
    - Not Arbitrum One or any other network

4. **Verify transaction went through:**

    - Check MetaMask for confirmed transaction
    - Copy transaction hash and check on Arbiscan Sepolia

5. **Check orchestrator for errors:**
    ```bash
    # Look for errors in the process
    ps aux | grep "node src/index.js"
    ```

### If Event Detected But Processing Fails:

Check the orchestrator logs for error messages in the red box:

```
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
❌ ERROR PROCESSING REQUEST
❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
```

Common issues:

-   Missing `.env` variables
-   Insufficient orchestrator wallet balance
-   Agent services not responding

## 📞 API Endpoints to Test

After successful request, test these endpoints:

```bash
REQUEST_ID=0  # Use your actual request ID

# 1. Get request details
curl http://localhost:3001/api/request/$REQUEST_ID

# 2. Get payment channel IDs
curl http://localhost:3001/api/channels/$REQUEST_ID

# 3. Get signed payment for script agent
curl http://localhost:3001/api/payment-signature/$REQUEST_ID/script

# 4. Get all payment signatures
curl http://localhost:3001/api/payment-signatures/$REQUEST_ID

# 5. Get x402 challenge
curl http://localhost:3001/api/x402-challenge/$REQUEST_ID
```

## 🎉 Next Steps

Once you see the full payment channel flow in the logs:

1. **Verify Channel Status**: Check that all 3 channels are OPEN
2. **Test Agent Claim**: Use the claim service to close a channel
3. **Monitor Gas Savings**: Compare traditional vs payment channel costs
4. **Verify Refunds**: Check that unused funds are properly refunded

Happy testing! 🚀

# End-to-End Test Walkthrough

## System Status Check ✅

**Running Services:**

-   ✅ Orchestrator (Port 3001) - Listening on Arbitrum Sepolia
-   ✅ Mock AI Services (Port 3000) - Ready to process
-   ✅ Frontend - Connected to contract `0x6720c5604b76801F1475333DAf7Bd7E6D7D16c33`

---

## Test Steps

### Step 1: Submit Video Request via Frontend

**Action:**

1. Open `frontend/index.html` in your browser
2. Ensure MetaMask is:

    - Unlocked
    - Connected to **Arbitrum Sepolia** (Chain ID: 421614)
    - Has some test ETH

3. Fill in the form:

    - **Prompt**: "Create a 30-second coffee commercial"
    - **Amount**: 0.0001 ETH (or more)

4. Click **"Generate Video"**

**What Happens:**

-   MetaMask popup appears asking you to confirm transaction
-   You sign the transaction
-   ETH is sent to contract address: `0x6720c5604b76801F1475333DAf7Bd7E6D7D16c33`
-   Frontend shows: "Waiting for transaction confirmation..."
-   After ~2 seconds: "✅ Video request submitted! Request ID: X"

**Behind the Scenes:**

```solidity
// Contract executes:
function requestVideo(string memory _prompt) public payable {
    require(msg.value > 0.0000001 ether, "Not enough ETH sent");

    uint256 newRequestId = nextRequestId;
    requests[newRequestId] = VideoRequest({
        user: msg.sender,
        prompt: _prompt,
        isComplete: false,
        amountPaid: msg.value
    });

    nextRequestId++;
    emit VideoRequested(newRequestId, msg.sender, _prompt);
}
```

---

### Step 2: Orchestrator Detects Event

**Monitor:**

```bash
tail -f orchestrator/orchestrator.log
```

**Expected Output:**

```
🎬 New video request received!
   Request ID: 0
   User: 0xYourWalletAddress
   Prompt: Create a 30-second coffee commercial
   Block: 12345678
```

**What Happens:**

-   Orchestrator's event listener picks up `VideoRequested` event
-   Extracts: requestId, user address, prompt
-   Triggers `processVideoRequest()` function

---

### Step 3: AP2/MCP Metadata Setup

**Expected Log:**

```
📹 Processing video request 0...
📝 Setting AP2 flow metadata...
🔧 Setting MCP context...
💰 Total payment: 0.0001 ETH
```

**Behind the Scenes:**

```javascript
// Creates URIs for AP2 protocol
const ap2Nonce = `ap2-0-${Date.now()}`;
const receiptURI = `http://localhost:3001/api/receipt/0`;
const callbackURI = `http://localhost:3001/api/callback/0`;
const metadataURI = `http://localhost:3001/api/metadata/0`;

// Calls contract to set on-chain metadata
await defineAP2Flow(requestId, ap2Nonce, receiptURI, callbackURI, metadataURI);
await setMCPContext(requestId, mcpContextURI);
```

**On-Chain Events Emitted:**

-   `AP2FlowDefined(requestId, nonce, receiptURI, callbackURI, metadataURI)`
-   `MCPContextSet(requestId, contextURI)`

---

### Step 4: Script Agent Processing

**Expected Logs:**

**Orchestrator:**

```
📝 Stage 1: Generating script...
   Calling http://localhost:3000/api/v1/generate-script...
   ✅ script service responded
✅ Paid script agent: 0.00003 ETH
```

**AI Services (server.js):**

```
📝 Script Agent called
   Prompt: Create a 30-second coffee commercial
   ✅ Script generated
```

**What Happens:**

1. Orchestrator calls mock script service
2. Service returns generated script (mock data)
3. Orchestrator calculates payment: `totalAmount * 30% = 0.00003 ETH`
4. Orchestrator calls contract: `payAgent(requestId, scriptAgentWallet, 0.00003 ETH)`
5. Contract sends ETH to `0xb8Cc4aDcd6756F61E4a465B50ecEf26e3e5C8958`
6. Event emitted: `AgentPaid(requestId, scriptAgentWallet, amount)`

---

### Step 5: Sound Agent Processing

**Expected Logs:**

**Orchestrator:**

```
🎵 Stage 2: Generating sound...
   Calling http://localhost:3000/api/v1/generate-sound...
   ✅ sound service responded
✅ Paid sound agent: 0.00003 ETH
```

**AI Services:**

```
🎵 Sound Agent called
   Script received: Yes
   ✅ Audio generated
   URL: https://example.com/audio/mock-1234567890.mp3
```

**What Happens:**

1. Orchestrator passes script result to sound service
2. Service returns audio URL (mock)
3. Payment: `totalAmount * 30% = 0.00003 ETH`
4. Contract pays: `0x4058352F37fc14D1400d6624F4B11c8916A260ae`
5. Event: `AgentPaid(requestId, soundAgentWallet, amount)`

---

### Step 6: Video Agent Processing

**Expected Logs:**

**Orchestrator:**

```
🎬 Stage 3: Generating video...
   Calling http://localhost:3000/api/v1/generate-video...
   ✅ video service responded
✅ Paid video agent: 0.00004 ETH
```

**AI Services:**

```
🎬 Video Agent called
   Script: Received
   Sound: Received
   ✅ Video generated
   URL: https://example.com/videos/mock-1234567890.mp4
```

**What Happens:**

1. Orchestrator passes script + sound to video service
2. Service returns video URL (mock)
3. Payment: `totalAmount * 40% = 0.00004 ETH`
4. Contract pays: `0x5d1A7E9CDb8f7Bf00d40dD3056363f358067De5b`
5. Event: `AgentPaid(requestId, videoAgentWallet, amount)`

---

### Step 7: Completion

**Final Log:**

```
✅ Request 0 completed successfully!
```

**Total Flow Summary:**

-   User paid: **0.0001 ETH**
-   Script agent received: **0.00003 ETH** (30%)
-   Sound agent received: **0.00003 ETH** (30%)
-   Video agent received: **0.00004 ETH** (40%)
-   **Total distributed: 0.0001 ETH** ✅

---

## Verification Steps

### 1. Check Request Data

```bash
curl http://localhost:3001/api/request/0
```

**Response:**

```json
{
	"requestId": "0",
	"user": "0xYourAddress",
	"prompt": "Create a 30-second coffee commercial",
	"isComplete": false,
	"amountPaid": "100000000000000",
	"flowData": {
		"metadataURI": "http://localhost:3001/api/metadata/0",
		"ap2Nonce": "ap2-0-1234567890",
		"receiptURI": "http://localhost:3001/api/receipt/0",
		"callbackURI": "http://localhost:3001/api/callback/0",
		"x402ChallengeURI": "",
		"mcpContextURI": "http://localhost:3001/api/mcp-context/0"
	}
}
```

### 2. Check AP2 Receipt

```bash
curl http://localhost:3001/api/receipt/0
```

### 3. Check MCP Context

```bash
curl http://localhost:3001/api/mcp-context/0
```

**Response:**

```json
{
  "requestId": "0",
  "mcp": {
    "version": "1.0",
    "context": {
      "tools": [
        {"name": "generate_script", ...},
        {"name": "generate_sound", ...},
        {"name": "generate_video", ...}
      ],
      "availableAgents": ["script", "sound", "video"]
    }
  }
}
```

### 4. Verify On-Chain (Arbiscan)

1. Go to: https://sepolia.arbiscan.io
2. Search for your transaction hash (from MetaMask)
3. See events:
    - `VideoRequested`
    - `AP2FlowDefined`
    - `MCPContextSet`
    - `AgentPaid` (x3)

---

## Success Criteria ✅

-   [x] User transaction confirmed
-   [x] Orchestrator detected event
-   [x] AP2/MCP metadata set on-chain
-   [x] All 3 AI agents called
-   [x] All 3 agents paid on-chain
-   [x] Payment split: 30/30/40
-   [x] Total payment = sum of agent payments
-   [x] Events logged and verifiable

---

## What You Just Tested

✅ **Full blockchain integration** - Smart contract on Arbitrum Sepolia ✅ **Event-driven architecture** - Orchestrator listens for on-chain events ✅ **AP2 protocol** - Receipt, callback, and metadata URIs ✅ **MCP context** - Tools manifest for AI agent coordination ✅ **Payment distribution** - Automatic 30/30/40 split ✅ **On-chain verification** - All payments recorded on blockchain ✅ **Mock AI services** - Simulated script/sound/video generation

This is a **production-ready payment flow** with mock AI processing!

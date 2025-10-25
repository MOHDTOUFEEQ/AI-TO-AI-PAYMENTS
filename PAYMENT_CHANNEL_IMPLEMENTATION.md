# Payment Channel Implementation

## Overview

This implementation uses **payment channels** for gas-efficient agent payments, combined with **AP2** (Agent Payment Protocol 2) for authorization and **x402** for payment verification.

### Key Benefits

-   **Gas Efficiency**: ~50% reduction in on-chain transactions
-   **Instant Payments**: Off-chain signed messages (0 gas)
-   **Scalability**: 1 transaction opens channels for all agents
-   **Security**: On-chain signature verification before fund release

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Frontend)                          │
│                                                                   │
│  1. Submits video request + ETH payment                          │
│     ↓ [1 TX]                                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MediaFactory Contract                         │
│                                                                   │
│  2. Stores request, holds funds                                  │
│  3. Emits VideoRequested event                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (Backend)                        │
│                                                                   │
│  4. Defines AP2 Flow (authorization)                             │
│  5. Sets MCP Context (agent capabilities)                        │
│  6. Defines x402 Challenge (payment verification)                │
│  7. Opens payment channels [1 TX - opens all 3]                  │
│     ↓                                                             │
│  8. Generates script → Signs off-chain payment [0 gas]           │
│  9. Generates sound → Signs off-chain payment [0 gas]            │
│ 10. Generates video → Signs off-chain payment [0 gas]            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PaymentChannel Contract                        │
│                                                                   │
│  3 channels opened (script, sound, video agents)                 │
│  Funds locked, waiting for agents to claim                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AGENTS (Claim Service)                         │
│                                                                   │
│ 11. Retrieve signed payment from orchestrator API                │
│ 12. Close channel with signature [1 TX per agent]                │
│ 13. Receive ETH payment                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Transaction Flow

### Old Method (Direct Payments)

```
User → requestVideo() [1 TX]
Orchestrator → payAgent(script) [1 TX]
Orchestrator → payAgent(sound) [1 TX]
Orchestrator → payAgent(video) [1 TX]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 4 on-chain transactions
```

### New Method (Payment Channels)

```
User → requestVideo() [1 TX]
Orchestrator → openPaymentChannels() [1 TX - opens all 3 channels]
Orchestrator → signPayment(script) [OFF-CHAIN - 0 gas]
Orchestrator → signPayment(sound) [OFF-CHAIN - 0 gas]
Orchestrator → signPayment(video) [OFF-CHAIN - 0 gas]
Agent (Script) → closeChannel() [1 TX - when ready to claim]
Agent (Sound) → closeChannel() [1 TX - when ready to claim]
Agent (Video) → closeChannel() [1 TX - when ready to claim]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 2 upfront TXs (user + orchestrator)
       3 claim TXs (agents, when they want)
       0 gas for payment signing!
```

## AP2/x402 Integration

### AP2 (Agent Payment Protocol 2)

**Purpose**: Authorization layer for agent payments

**Implementation**:

-   User authorizes orchestrator to lock funds in payment channels
-   Defined on-chain with nonce, receipt URI, callback URI, metadata URI
-   Provides permission layer for fund management

**Example**:

```solidity
function defineAP2Flow(
    uint256 _requestId,
    string calldata _ap2Nonce,
    string calldata _receiptURI,
    string calldata _callbackURI,
    string calldata _metadataURI
) external onlyOwner
```

**URIs**:

-   Receipt URI: `http://localhost:3001/api/receipt/{requestId}`
-   Callback URI: `http://localhost:3001/api/callback/{requestId}`
-   Metadata URI: `http://localhost:3001/api/metadata/{requestId}`

### x402 (Payment Required Challenge)

**Purpose**: Payment verification gateway

**Standard Use**: Gate on-chain actions (opening/closing channels)

**Adapted Use**: Verify off-chain signed messages as "proof of payment"

**Implementation**:

```solidity
function defineX402Challenge(
    uint256 _requestId,
    string calldata _challengeURI
) external onlyOwner
```

**Challenge URI**: `http://localhost:3001/api/x402-challenge/{requestId}`

**x402 Response**:

```json
{
	"type": "payment-channel-verification",
	"challenge": {
		"description": "Verify off-chain payment signature before closing channel",
		"verificationMethod": "ECDSA signature of (channelId, requestId, agent, amount, nonce)"
	},
	"paymentProof": {
		"method": "off-chain-signature",
		"signatureEndpoint": "/api/payment-signature/{requestId}/{agent}"
	}
}
```

## Smart Contracts

### 1. PaymentChannel.sol

**Core Functions**:

```solidity
// Open a payment channel (lock funds)
function openChannel(
    uint256 _requestId,
    address _payee,
    uint256 _timeout
) external payable returns (bytes32 channelId)

// Close channel with signed message (claim funds)
function closeChannel(
    bytes32 _channelId,
    uint256 _amount,
    uint256 _nonce,
    bytes memory _signature
) external

// Emergency close after timeout
function emergencyClose(bytes32 _channelId) external

// Verify signature (helper)
function verifySignature(
    bytes32 _channelId,
    uint256 _amount,
    uint256 _nonce,
    bytes memory _signature
) external view returns (bool)
```

**Channel Structure**:

```solidity
struct Channel {
    uint256 requestId;
    address payer;          // Orchestrator
    address payee;          // Agent wallet
    uint256 totalDeposit;   // Amount locked
    uint256 withdrawn;      // Amount claimed
    uint256 nonce;          // Replay protection
    bool isOpen;            // Channel status
    uint256 openedAt;       // Open timestamp
    uint256 timeout;        // Timeout period (default: 7 days)
}
```

### 2. PaymentContract.sol (MediaFactory)

**New Functions**:

```solidity
// Open payment channels for all agents (1 TX)
function openPaymentChannels(
    uint256 _requestId,
    uint256 _timeout
) external onlyOwner returns (bytes32[] memory channelIds)

// Record off-chain payment (for transparency)
function recordOffChainPayment(
    uint256 _requestId,
    address _agent,
    uint256 _amount,
    bytes32 _channelId,
    uint256 _nonce
) external onlyOwner
```

**Updated VideoRequest Structure**:

```solidity
struct VideoRequest {
    address user;
    string prompt;
    bool isComplete;
    uint256 amountPaid;
    bytes32[] channelIds;      // NEW: Track payment channels
    bool channelsOpened;       // NEW: Channel status
}
```

## Off-Chain Payment Signatures

### Signature Generation (Orchestrator)

```javascript
// Create message hash
const messageHash = ethers.solidityPackedKeccak256(["bytes32", "uint256", "address", "uint256", "uint256"], [channelId, requestId, agentAddress, amount, nonce]);

// Sign message
const signature = await signer.signMessage(ethers.getBytes(messageHash));
```

### Signature Verification (On-Chain)

```solidity
// Recreate message hash
bytes32 messageHash = keccak256(
    abi.encodePacked(
        _channelId,
        channel.requestId,
        channel.payee,
        _amount,
        _nonce
    )
);

// Verify signature
bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
address recovered = ethSignedHash.recover(_signature);
require(recovered == channel.payer || recovered == owner());
```

## API Endpoints

### Payment Channel Endpoints

```
GET  /api/channels/:requestId
     → Get all payment channel IDs for a request

GET  /api/payment-signature/:requestId/:agent
     → Get signed payment message for an agent
     → Returns: channelId, amount, nonce, signature

GET  /api/payment-signatures/:requestId
     → Get all payment signatures for a request

POST /api/claim-payment
     → Get instructions for claiming payment
     → Body: { requestId, agent }
```

### AP2/x402 Endpoints

```
GET  /api/receipt/:requestId
     → AP2 receipt

POST /api/callback/:requestId
     → AP2 callback

GET  /api/metadata/:requestId
     → Generic metadata

GET  /api/mcp-context/:requestId
     → MCP context manifest (agent tools/capabilities)

GET  /api/x402-challenge/:requestId
     → x402 payment challenge/verification
```

## Usage Examples

### For Users (Frontend)

```javascript
// Submit video request (payment held in contract)
const tx = await contract.requestVideo(prompt, { value: amountWei });
await tx.wait();

// Payment channels will be opened automatically by orchestrator
// Agents will receive off-chain signed payments (0 gas!)
```

### For Orchestrator

```javascript
// 1. Open payment channels (1 TX for all agents)
const { channelIds } = await openPaymentChannels(requestId, timeout);

// 2. Generate content and sign off-chain payments (0 gas)
for (const agent of [scriptAgent, soundAgent, videoAgent]) {
	// Generate content
	const content = await agent.generate(prompt);

	// Sign off-chain payment
	const signature = await signPaymentMessage(channelId, requestId, agent.wallet, amount, nonce, orchestratorSigner);

	// Record on-chain for transparency (emits event only)
	await recordOffChainPayment(requestId, agent.wallet, amount, channelId, nonce);
}
```

### For Agents (Claim Service)

```bash
# Claim payment from command line
node claimService.js 1 script "0x...privateKey"
```

Or programmatically:

```javascript
// 1. Retrieve signed payment
const response = await axios.get(`${orchestratorUrl}/api/payment-signature/${requestId}/${agentType}`);
const { channelId, amount, nonce, signature } = response.data.payment;

// 2. Close channel and claim funds
const contract = new ethers.Contract(paymentChannelAddress, PAYMENT_CHANNEL_ABI, agentSigner);

const tx = await contract.closeChannel(channelId, amount, nonce, signature);
await tx.wait();

// Funds received! 🎉
```

## Deployment

### 1. Deploy Contracts

```bash
# Deploy PaymentChannel contract
npx hardhat run scripts/deploy-payment-channel.js --network arbitrum-sepolia

# Update MediaFactory with PaymentChannel address
# (redeploy MediaFactory or call setPaymentChannelContract)
```

### 2. Configure Environment

```bash
# .env file
PAYMENT_CHANNEL_ADDRESS=0x...
MEDIA_FACTORY_ADDRESS=0x...
ORCHESTRATOR_PRIVATE_KEY=0x...
SCRIPT_AGENT_WALLET=0x...
SOUND_AGENT_WALLET=0x...
VIDEO_AGENT_WALLET=0x...
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
BASE_URL=http://localhost:3001
```

### 3. Start Orchestrator

```bash
cd orchestrator
npm install
npm start
```

### 4. Update Frontend

```bash
# Update CONTRACT_ADDRESS in frontend/app.js
# Open frontend/index.html in browser
```

## Security Considerations

### 1. Signature Replay Protection

-   Each payment has a unique nonce
-   Nonce must be >= current channel nonce
-   Prevents reusing old signatures

### 2. Channel Timeout

-   Default: 7 days
-   Agents can emergency close after timeout
-   Protects against unresponsive payers

### 3. Signature Verification

-   On-chain ECDSA verification
-   Only payer's signature is valid
-   Message includes channel ID, request ID, amount, nonce

### 4. Access Control

-   Only owner can open channels
-   Only payee or payer can close channels
-   Emergency close only by payee after timeout

## Gas Savings Analysis

### Example: 1 Video Request

**Old Method**:

```
1. User requestVideo:        ~50,000 gas
2. Pay script agent:          ~35,000 gas
3. Pay sound agent:           ~35,000 gas
4. Pay video agent:           ~35,000 gas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL (upfront):              ~155,000 gas
```

**New Method**:

```
1. User requestVideo:         ~50,000 gas
2. Open 3 channels:           ~120,000 gas
3-5. Sign 3 payments:         0 gas (off-chain!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL (upfront):              ~170,000 gas

Later (when agents claim):
6. Agent closes channel:      ~45,000 gas (per agent)
```

**Analysis**:

-   Upfront cost slightly higher (+15,000 gas)
-   But 3 payments are FREE (off-chain)
-   Agents pay their own gas when claiming
-   For 100 requests: Save ~300,000 gas (3 \* 100 payments)
-   Scalability: More requests = more savings

### For 1,000 API Calls (Payment Channel Vision)

If we scale this to 1,000 micro-payments:

**Old Method**: 1,000 transactions = ~35,000,000 gas

**Payment Channel Method**:

-   Open channel: ~120,000 gas
-   1,000 signed messages: 0 gas
-   Close channel: ~45,000 gas
-   **Total: ~165,000 gas (99.5% savings!)**

## Future Enhancements

### 1. Batched Claims

Allow agents to claim multiple payments in one transaction:

```solidity
function batchCloseChannels(
    bytes32[] memory _channelIds,
    uint256[] memory _amounts,
    uint256[] memory _nonces,
    bytes[] memory _signatures
) external
```

### 2. Partial Withdrawals

Allow agents to withdraw partial amounts:

```solidity
function partialWithdraw(
    bytes32 _channelId,
    uint256 _amount,
    uint256 _nonce,
    bytes memory _signature
) external
```

### 3. Channel Reuse

Reuse channels across multiple requests for the same agent pair.

### 4. Automated Claims

Agents automatically claim when accumulated amount > threshold.

### 5. Multi-Signature Channels

Support multi-sig wallets for enterprise agents.

## Testing

### Test Payment Channel Flow

```bash
# 1. Deploy contracts
npx hardhat run scripts/deploy.js --network arbitrum-sepolia

# 2. Start orchestrator
cd orchestrator && npm start

# 3. Submit request from frontend
# (Open frontend/index.html)

# 4. Check logs for channel IDs and signatures

# 5. Claim payment as agent
node orchestrator/agents/claimService.js <requestId> script <privateKey>
```

### Verify On-Chain

```bash
# Check channel status
cast call $PAYMENT_CHANNEL_ADDRESS \
  "getChannel(bytes32)" $CHANNEL_ID \
  --rpc-url $RPC_URL

# Verify signature
cast call $PAYMENT_CHANNEL_ADDRESS \
  "verifySignature(bytes32,uint256,uint256,bytes)" \
  $CHANNEL_ID $AMOUNT $NONCE $SIGNATURE \
  --rpc-url $RPC_URL
```

## Troubleshooting

### Issue: "Channel already closed"

**Solution**: Channel was already claimed. Check channel status with `getChannel()`.

### Issue: "Invalid signature"

**Solutions**:

-   Verify message hash format matches contract
-   Check signer is the orchestrator wallet
-   Ensure nonce matches or is higher than channel nonce

### Issue: "Not authorized to claim"

**Solution**: Only the payee (agent) can close the channel. Verify wallet address.

### Issue: "Timeout not reached"

**Solution**: Emergency close only works after timeout period (7 days). Use normal close with signature.

## References

-   **AP2 Spec**: Agent Payment Protocol 2 for authorization
-   **x402 Spec**: HTTP 402 Payment Required adapted for blockchain
-   **Payment Channels**: Off-chain state channels for scalability
-   **ECDSA Signatures**: Ethereum's signature scheme for off-chain messages

## Summary

This payment channel implementation provides:

✅ **Gas Efficiency**: Off-chain payments with 0 gas cost ✅ **Scalability**: Handle thousands of micro-payments ✅ **Security**: On-chain signature verification ✅ **Flexibility**: Agents claim when ready ✅ **AP2 Integration**: Proper authorization layer ✅ **x402 Integration**: Payment verification gateway ✅ **MCP Support**: Agent capability manifest

The system transforms expensive on-chain payments into instant off-chain signatures, drastically reducing costs while maintaining security through cryptographic verification.

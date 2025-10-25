# x402 Protocol Implementation

## What is x402?

**x402** is a protocol for **conditional payments** and **payment challenges**. It's inspired by HTTP 402 "Payment Required" but designed for blockchain/Web3 applications.

## Where x402 Takes Place

### 1. **Smart Contract** (Storage & Events)

**Location**: `contracts/PaymentContract.sol` (Lines 145-153)

```solidity
function defineX402Challenge(uint256 _requestId, string calldata _challengeURI)
    external onlyOwner
{
    require(requests[_requestId].user != address(0), "Request not found");
    requestFlows[_requestId].x402ChallengeURI = _challengeURI;
    emit X402ChallengeDefined(_requestId, _challengeURI);
}
```

**Purpose**: Stores x402 challenge URI on-chain for transparency

---

### 2. **Orchestrator** (Setup & Logging)

**Location**: `orchestrator/src/services/videoProcessor.js` (Lines 44-55)

```javascript
const x402ChallengeURI = `${baseUrl}/api/x402-challenge/${requestIdStr}`;
console.log("\n🔐 x402 CHALLENGE SETUP");
console.log("   x402 Challenge URI:", x402ChallengeURI);
console.log("   Purpose: Conditional payment gateway for premium features");

const x402TxHash = await defineX402Challenge(requestIdStr, x402ChallengeURI);
console.log("   ✅ x402 Challenge defined on-chain");
console.log("   Event emitted: X402ChallengeDefined(requestId, challengeURI)");
```

**Purpose**: Sets up x402 challenge for each request and logs it

---

### 3. **API Endpoint** (Challenge Details)

**Location**: `orchestrator/src/api/routes.js` (Lines 132-166)

**Endpoint**: `GET /api/x402-challenge/:id`

**Response Example**:

```json
{
	"requestId": "0",
	"x402": {
		"version": "1.0",
		"type": "payment-required",
		"challenge": {
			"description": "Additional payment required for premium features",
			"amount": "0.0001 ETH",
			"currency": "ETH",
			"paymentAddress": "0x6720c5604b76801F1475333DAf7Bd7E6D7D16c33"
		},
		"conditions": {
			"baseService": "included",
			"premiumFeatures": ["4K resolution", "Extended length", "Priority processing"],
			"unlockRequirement": "Pay 0.0001 ETH to unlock premium features"
		},
		"paymentProof": {
			"method": "blockchain",
			"network": "Arbitrum Sepolia",
			"verificationEndpoint": "http://localhost:3001/api/verify-payment/0"
		}
	}
}
```

**Purpose**: Provides challenge/invoice details to clients

---

## x402 Use Cases

### 1. **Premium Features Gate**

```
User requests video → Base features included
User wants 4K + extended length → x402 challenge issued
User pays additional 0.0001 ETH → Premium features unlocked
```

### 2. **Tiered Pricing**

```
Basic tier: 0.0001 ETH → Standard quality
Premium tier: +0.0001 ETH (x402) → 4K, longer duration
Enterprise: +0.001 ETH (x402) → Custom branding, API access
```

### 3. **Pay-Per-Feature**

```
Base video: 0.0001 ETH
Want background music? → x402 challenge for +0.00003 ETH
Want voiceover? → x402 challenge for +0.00005 ETH
Want subtitles? → x402 challenge for +0.00002 ETH
```

---

## Complete Flow

### **Step 1: User Submits Request**

```
User → Contract: requestVideo("prompt") + 0.0001 ETH
Contract → Event: VideoRequested(requestId, user, prompt)
```

### **Step 2: Orchestrator Sets x402**

```
Orchestrator detects event
Orchestrator → Contract: defineX402Challenge(requestId, URI)
Contract → Event: X402ChallengeDefined(requestId, challengeURI)
Contract stores: requestFlows[requestId].x402ChallengeURI = URI
```

### **Step 3: Client Checks Challenge**

```
Client → API: GET /api/x402-challenge/0
API → Client: {challenge details, premium features, payment required}
```

### **Step 4: User Decides**

**Option A**: Accept base service (no additional payment)

```
Orchestrator processes with standard features
```

**Option B**: Pay for premium (x402 payment)

```
User → Contract: Pay additional 0.0001 ETH
Contract verifies payment
Orchestrator unlocks premium features
```

---

## When x402 is Triggered

In the current implementation, x402 is **set up for every request** but only **enforced conditionally**:

1. **Always Set**: x402 URI is defined on-chain for all requests
2. **Conditionally Used**: Only enforced if user requests premium features
3. **Verifiable**: All x402 challenges are recorded on blockchain

---

## Testing x402

### **Check x402 Challenge**

```bash
# After submitting a video request with ID 0
curl http://localhost:3001/api/x402-challenge/0
```

### **Verify On-Chain**

```bash
# Check the contract event
# Look for: X402ChallengeDefined(requestId, challengeURI)
```

### **View in Logs**

When orchestrator processes a request, you'll see:

```
🔐 x402 CHALLENGE SETUP
======================
   x402 Challenge URI: http://localhost:3001/api/x402-challenge/0
   Purpose: Conditional payment gateway for premium features
   📝 Calling contract.defineX402Challenge()...
   ✅ x402 Challenge defined on-chain
   Transaction: 0x...
   Event emitted: X402ChallengeDefined(requestId, challengeURI)
```

---

## Summary

| Component          | Location                      | Role                          |
| ------------------ | ----------------------------- | ----------------------------- |
| **Smart Contract** | `PaymentContract.sol:145-153` | Stores x402 URI on-chain      |
| **Orchestrator**   | `videoProcessor.js:44-55`     | Sets up x402 for each request |
| **API**            | `routes.js:132-166`           | Serves x402 challenge details |
| **On-Chain Event** | Blockchain                    | `X402ChallengeDefined` event  |

**x402 enables flexible, conditional payments with full blockchain transparency!** 🔐

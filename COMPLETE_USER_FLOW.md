# Complete User Flow with AP2/x402/MCP

## Overview

This document shows the **complete end-to-end flow** including where AP2, x402, and MCP fit into the user experience.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INITIATES REQUEST                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Frontend - User Submits Request                        │
│  ────────────────────────────────────────                       │
│  • User enters prompt: "Create coffee commercial"               │
│  • User sets payment: 0.0001 ETH                                │
│  • Clicks "Generate Video"                                      │
│  • MetaMask popup → User approves transaction                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Blockchain - Payment Received                          │
│  ───────────────────────────────────────                        │
│  • Contract receives: 0.0001 ETH                                │
│  • Stores request: VideoRequest(user, prompt, amount)           │
│  • Emits event: VideoRequested(requestId=4, user, prompt)       │
│  • Transaction confirmed on Arbitrum Sepolia                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Orchestrator - Event Detection                         │
│  ────────────────────────────────────────                       │
│  • Orchestrator listening on Arbitrum Sepolia                   │
│  • Detects: VideoRequested event                                │
│  • Extracts: requestId=4, user, prompt                          │
│  • Triggers: processVideoRequest(4, user, prompt)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: AP2 FLOW SETUP (Payment Transparency)                  │
│  ──────────────────────────────────────────────                 │
│  📋 PURPOSE: Create verifiable receipts and callbacks           │
│                                                                  │
│  Orchestrator creates:                                          │
│  • AP2 Nonce: "ap2-4-1729780123"                               │
│  • Receipt URI: http://localhost:3001/api/receipt/4            │
│  • Callback URI: http://localhost:3001/api/callback/4          │
│  • Metadata URI: http://localhost:3001/api/metadata/4          │
│                                                                  │
│  Orchestrator → Contract:                                       │
│  • Calls: defineAP2Flow(4, nonce, receiptURI, ...)            │
│  • Contract stores URIs on-chain                                │
│  • Emits: AP2FlowDefined(4, nonce, URIs...)                   │
│  • Transaction hash: 0xabc123...                                │
│                                                                  │
│  💡 USER BENEFIT: Transparent, auditable payment records        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: x402 CHALLENGE SETUP (Conditional Payments)            │
│  ──────────────────────────────────────────────────             │
│  🔐 PURPOSE: Enable premium features with additional payment    │
│                                                                  │
│  Orchestrator creates:                                          │
│  • Challenge URI: http://localhost:3001/api/x402-challenge/4   │
│                                                                  │
│  Orchestrator → Contract:                                       │
│  • Calls: defineX402Challenge(4, challengeURI)                 │
│  • Contract stores challenge URI on-chain                       │
│  • Emits: X402ChallengeDefined(4, challengeURI)                │
│  • Transaction hash: 0xdef456...                                │
│                                                                  │
│  💡 USER BENEFIT: Option to unlock premium features             │
│     User can query /api/x402-challenge/4 to see:               │
│     - What premium features are available                       │
│     - How much extra payment is required                        │
│     - How to unlock them                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: MCP CONTEXT SETUP (AI Agent Coordination)              │
│  ────────────────────────────────────────────────               │
│  🔧 PURPOSE: Share tools/context between AI agents              │
│                                                                  │
│  Orchestrator creates:                                          │
│  • MCP Context URI: http://localhost:3001/api/mcp-context/4    │
│                                                                  │
│  Orchestrator → Contract:                                       │
│  • Calls: setMCPContext(4, contextURI)                         │
│  • Contract stores MCP URI on-chain                             │
│  • Emits: MCPContextSet(4, contextURI)                         │
│  • Transaction hash: 0x789abc...                                │
│                                                                  │
│  💡 AGENT BENEFIT: Agents can discover available tools          │
│     Agents query /api/mcp-context/4 to see:                    │
│     - What tools are available                                  │
│     - What other agents can do                                  │
│     - How to coordinate work                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: SCRIPT AGENT PROCESSING                                │
│  ─────────────────────────────────                              │
│  📝 Orchestrator → Script Agent API                             │
│  • POST http://localhost:3000/api/v1/generate-script           │
│  • Body: { prompt: "Create coffee commercial" }                │
│  • Agent generates script (mock)                                │
│  • Returns: script text                                         │
│                                                                  │
│  💸 PAYMENT TO SCRIPT AGENT                                     │
│  • Calculate: 0.0001 ETH × 30% = 0.00003 ETH                   │
│  • Orchestrator → Contract:                                     │
│    payAgent(4, 0xb8Cc...8958, 0.00003 ETH)                     │
│  • Contract sends ETH to script agent wallet                    │
│  • Emits: AgentPaid(4, scriptWallet, 0.00003 ETH)              │
│  • Transaction hash: 0x111222...                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: SOUND AGENT PROCESSING                                 │
│  ────────────────────────────────                               │
│  🎵 Orchestrator → Sound Agent API                              │
│  • POST http://localhost:3000/api/v1/generate-sound            │
│  • Body: { prompt, script }                                     │
│  • Agent generates audio (mock)                                 │
│  • Returns: audio URL                                           │
│                                                                  │
│  💸 PAYMENT TO SOUND AGENT                                      │
│  • Calculate: 0.0001 ETH × 30% = 0.00003 ETH                   │
│  • Orchestrator → Contract:                                     │
│    payAgent(4, 0x4058...0ae, 0.00003 ETH)                      │
│  • Contract sends ETH to sound agent wallet                     │
│  • Emits: AgentPaid(4, soundWallet, 0.00003 ETH)               │
│  • Transaction hash: 0x333444...                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 9: VIDEO AGENT PROCESSING                                 │
│  ────────────────────────────────                               │
│  🎬 Orchestrator → Video Agent API                              │
│  • POST http://localhost:3000/api/v1/generate-video            │
│  • Body: { prompt, script, sound }                              │
│  • Agent generates video (mock)                                 │
│  • Returns: video URL                                           │
│                                                                  │
│  💸 PAYMENT TO VIDEO AGENT                                      │
│  • Calculate: 0.0001 ETH × 40% = 0.00004 ETH                   │
│  • Orchestrator → Contract:                                     │
│    payAgent(4, 0x5d1A...e5b, 0.00004 ETH)                      │
│  • Contract sends ETH to video agent wallet                     │
│  • Emits: AgentPaid(4, videoWallet, 0.00004 ETH)               │
│  • Transaction hash: 0x555666...                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 10: REQUEST COMPLETED                                     │
│  ────────────────────────────                                   │
│  ✅ All agents processed successfully                           │
│  ✅ All payments confirmed on-chain                             │
│  ✅ Total distributed: 0.0001 ETH                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Where Each Protocol Fits

### **AP2 (Attestation Protocol 2)**

**When**: Step 4 - Right after event detection, BEFORE processing starts  
**Where**: Orchestrator → Smart Contract  
**Purpose**: Payment transparency and accountability

**User Experience**:

```
User can visit: http://localhost:3001/api/receipt/4
To see:
  • Payment amount
  • Timestamp
  • Processing status
  • Proof of payment
```

**Business Value**:

-   Auditable payment records
-   Proof of service request
-   Status tracking via callback URIs
-   Dispute resolution via receipts

---

### **x402 (HTTP 402 Payment Required)**

**When**: Step 5 - Right after AP2, BEFORE processing starts  
**Where**: Orchestrator → Smart Contract  
**Purpose**: Conditional/premium feature gating

**User Experience**:

```
User gets base service with initial payment
If user wants premium features:
  1. Check: http://localhost:3001/api/x402-challenge/4
  2. See available upgrades (4K, extended length, etc.)
  3. Pay additional amount to unlock
  4. Orchestrator enables premium processing
```

**Business Value**:

-   Tiered pricing model
-   Upsell opportunities
-   Flexible feature gating
-   Pay-per-feature options

**Example Flow**:

```
User pays 0.0001 ETH → Gets HD video
User sees x402 challenge → "Want 4K? Pay +0.0001 ETH"
User pays extra → Gets 4K video instead
```

---

### **MCP (Model Context Protocol)**

**When**: Step 6 - Right after x402, BEFORE processing starts  
**Where**: Orchestrator → Smart Contract  
**Purpose**: AI agent coordination and tool discovery

**Agent Experience**:

```
Agent can query: http://localhost:3001/api/mcp-context/4
To discover:
  • What tools are available
  • What other agents exist
  • How to coordinate work
  • Shared context/parameters
```

**Business Value**:

-   Agents can work together intelligently
-   Dynamic tool discovery
-   Context sharing between agents
-   Flexible agent ecosystem

**Example**:

```
Script Agent queries MCP → Sees Sound Agent available
Script Agent formats output → In way Sound Agent can use
Sound Agent queries MCP → Sees Video Agent needs specific format
Sound Agent produces output → Compatible with Video Agent
```

---

## Timeline View

```
Time    Step    Action                      Protocol    On-Chain?
────────────────────────────────────────────────────────────────────
0:00    1       User submits request        -           ✅ Yes
0:02    2       Payment confirmed           -           ✅ Yes
0:03    3       Orchestrator detects        -           ❌ No
0:04    4       AP2 flow setup             AP2         ✅ Yes
0:05    5       x402 challenge setup       x402        ✅ Yes
0:06    6       MCP context setup          MCP         ✅ Yes
0:07    7       Script agent processes      -           ❌ No
0:08    7       Pay script agent            -           ✅ Yes
0:09    8       Sound agent processes       -           ❌ No
0:10    8       Pay sound agent             -           ✅ Yes
0:11    9       Video agent processes       -           ❌ No
0:12    9       Pay video agent             -           ✅ Yes
0:13    10      Request completed           -           ❌ No
```

---

## User Interaction Points

### **Point 1: Initial Request (Required)**

-   User must submit request with payment
-   Minimum: 0.0000001 ETH
-   Gets: Base service

### **Point 2: Check Receipt (Optional)**

-   User can query AP2 receipt
-   See: Payment proof, status, metadata
-   URL: `/api/receipt/:id`

### **Point 3: Upgrade to Premium (Optional)**

-   User can check x402 challenge
-   See: Premium features available
-   Pay: Additional amount to unlock
-   URL: `/api/x402-challenge/:id`

### **Point 4: View Metadata (Optional)**

-   User can check request metadata
-   See: Progress, agent status
-   URL: `/api/metadata/:id`

---

## Real-World Example

**Scenario**: User wants a product demo video

### **Base Service** (0.0001 ETH)

```
1. Submit request → Get HD video, 30 seconds
2. AP2 receipt created → Track payment
3. x402 challenge available → Premium options listed
4. MCP context set → Agents coordinate
5. Process → HD video delivered
```

### **Premium Upgrade** (x402)

```
User checks x402 challenge:
  "Want 4K resolution? +0.0001 ETH"
  "Want 60-second video? +0.00005 ETH"
  "Want custom music? +0.00003 ETH"

User pays extra → Premium features unlocked
```

---

## Summary

| Protocol     | Timing            | Purpose            | User Benefit      |
| ------------ | ----------------- | ------------------ | ----------------- |
| **AP2**      | Before processing | Payment receipts   | Proof & tracking  |
| **x402**     | Before processing | Premium gating     | Optional upgrades |
| **MCP**      | Before processing | Agent coordination | Better AI output  |
| **Payments** | After each agent  | Agent compensation | Fair distribution |

**All three protocols work together to create a transparent, flexible, and coordinated AI service marketplace!** 🚀

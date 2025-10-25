# Real-Time Terminal Logs Feature 🖥️

## Overview

A beautiful terminal-style sidebar that displays orchestrator logs in real-time, giving users complete visibility into the payment channel operations and blockchain interactions.

## Features

### 🎨 Visual Design

-   **Terminal Aesthetic**: Black background with colored log types (green for success, red for errors, blue for transactions, etc.)
-   **Minimizable Interface**: Users can collapse the terminal to save screen space
-   **Live Connection Indicator**: Shows real-time connection status with a pulsing green dot
-   **Auto-Scroll**: Automatically scrolls to show latest logs
-   **Custom Scrollbar**: Themed to match the terminal aesthetic

### 📊 Log Types

The terminal displays various log types with distinct colors:

-   ✓ **Success** (Green): Completed operations
-   ✗ **Error** (Red): Failed operations
-   ⚠ **Warning** (Yellow): Important notices
-   ⛓ **Transaction** (Blue): Blockchain transactions
-   📡 **Channel** (Purple): Payment channel operations
-   💰 **Settlement** (Cyan): Off-chain payment settlements
-   › **Info** (Gray): General information

### 🔌 Real-Time Updates

-   Uses Server-Sent Events (SSE) for efficient real-time log streaming
-   Automatic reconnection on connection loss
-   Buffered logs: New clients receive recent log history

## Architecture

### Backend (Orchestrator)

**File**: `/orchestrator/src/utils/logStream.js`

-   Log streaming utility using EventEmitter pattern
-   Intercepts console.log and console.error to capture all orchestrator output
-   Intelligently categorizes logs based on content (emoji detection, keywords)
-   Maintains a buffer of recent logs (max 1000 entries)
-   Manages multiple client connections

**Endpoint**: `GET /api/logs/stream`

-   Server-Sent Events (SSE) endpoint
-   Returns Content-Type: text/event-stream
-   CORS enabled for frontend access
-   Automatic client cleanup on disconnect

### Frontend

**Component**: `/frontend/src/components/TerminalLogs.tsx`

-   React component with SSE connection management
-   Auto-scrolling to latest logs
-   Minimize/maximize functionality
-   Clear logs button
-   Connection status indicator
-   Responsive design

**Integration**: `/frontend/src/components/Hero.tsx`

-   Two-column layout: Form on left, Terminal on right
-   Sticky positioning on desktop for always-visible logs
-   Responsive: Stacks vertically on mobile

**Styling**: `/frontend/src/index.css`

-   Custom scrollbar utilities
-   Terminal-themed colors (zinc/gray palette)

## Setup & Configuration

### 1. Environment Variables

Create `/frontend/.env` or `/frontend/.env.local`:

```bash
VITE_ORCHESTRATOR_URL=http://localhost:3001
```

### 2. Install Dependencies

Orchestrator (already done):

```bash
cd orchestrator
npm install cors
```

Frontend dependencies are already in package.json.

### 3. Start Services

**Terminal 1 - Orchestrator:**

```bash
cd orchestrator
npm start
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

## What Users See

### Before Submitting Request

-   Empty terminal with placeholder message
-   "Waiting for orchestrator activity..."
-   Connection indicator shows LIVE status

### During Video Request Processing

Users see detailed logs including:

1. **Request Detection**

    ```
    🎬 NEW VIDEO REQUEST DETECTED!
    Request ID: 1
    User: 0x...
    Prompt: "A cat playing piano"
    ```

2. **AP2 Authorization**

    ```
    ✓ AP2 Authorization Complete!
    Transaction Hash: 0x...
    Event Emitted: AP2FlowDefined
    ```

3. **MCP Context Setup**

    ```
    ✓ MCP Context Established!
    Available Tools: [generate_script, generate_sound, generate_video]
    ```

4. **x402 Payment Verification**

    ```
    ✓ x402 Challenge Defined!
    Verification Method: ECDSA signature verification
    ```

5. **Payment Channels Opening**

    ```
    💰 Opening 3 payment channels in single transaction...
    ✓ Payment Channels Opened Successfully!
    Channel IDs: [0x..., 0x..., 0x...]
    Gas Savings: ~105,000 gas vs traditional payments
    ```

6. **Off-Chain Settlements**

    ```
    📝 SETTLEMENT 1/3: SCRIPT AGENT
    ✓ Script Generation Complete!
    💸 Creating Off-Chain Payment Settlement
    Amount: 0.0000003 ETH
    Gas Cost: 0 (off-chain!)
    ✓ Settlement Complete!
    ```

7. **Channel Closures** (Mock Demo)
    ```
    🏁 Closing payment channel for script agent
    ✓ Channel closed! Agent received 0.0000003 ETH
    ```

## Benefits Demonstrated

The terminal logs clearly show users:

### ⚡ **Gas Efficiency**

-   Only 5 upfront transactions (vs 7 traditional)
-   3 off-chain settlements with **0 gas cost**
-   Real-time gas savings calculations

### 🔐 **Security & Protocols**

-   AP2 (Agent Payment Protocol 2) authorization
-   x402 payment verification
-   MCP (Model Context Protocol) for agent capabilities
-   ECDSA signature verification

### 💰 **Payment Flow Transparency**

-   Clear fund distribution (Script 30%, Sound 30%, Video 40%)
-   Channel opening with locked funds
-   Off-chain signed payments
-   Final settlement when channels close

### ⏱️ **Performance**

-   Instant off-chain settlements
-   No waiting for 3 separate payment transactions
-   Agents can claim funds whenever ready

## Terminal Controls

### Top Bar

-   **Terminal Icon** + "Orchestrator Logs" title
-   **Live Indicator**: Green pulsing dot when connected
-   **Clear Button**: Trash icon to clear all logs
-   **Minimize Button**: Collapse terminal to save space

### Footer Bar (when expanded)

-   **Entry Count**: Number of log entries
-   **System Info**: "Payment Channel System"
-   **Network Info**: ETH • Arbitrum Sepolia

## Technical Details

### SSE vs WebSocket Choice

We use **Server-Sent Events (SSE)** instead of WebSocket because:

-   ✅ Simpler implementation (HTTP-based)
-   ✅ Automatic reconnection built-in
-   ✅ Better for one-way communication (server → client)
-   ✅ Works through proxies and firewalls
-   ✅ Lower overhead for our use case

### Log Buffering

-   Maintains last 1000 log entries
-   New clients receive buffer on connection
-   Prevents memory leaks with rolling buffer

### Auto-Categorization

Logs are automatically categorized by detecting:

-   Emojis (✅, ❌, ⚠️, etc.)
-   Keywords ("Success", "Error", "Transaction", "Channel", "Settlement")
-   Ethereum addresses (0x...)

## Future Enhancements

### Potential Features

-   [ ] Search/filter logs by type or keyword
-   [ ] Export logs to file
-   [ ] Log persistence across page refreshes (localStorage)
-   [ ] Dark/light terminal theme toggle
-   [ ] Adjustable log verbosity levels
-   [ ] Real-time gas cost tracking
-   [ ] Agent-specific log filtering
-   [ ] Notification sounds for important events

## Troubleshooting

### Terminal Shows "OFFLINE"

-   Check orchestrator is running on correct port
-   Verify `VITE_ORCHESTRATOR_URL` in `.env`
-   Check browser console for connection errors
-   Ensure CORS is enabled in orchestrator

### No Logs Appearing

-   Submit a video request to trigger logs
-   Check orchestrator console for errors
-   Verify SSE connection in Network tab

### Logs Not Auto-Scrolling

-   Check if you manually scrolled up (disables auto-scroll)
-   Try refreshing the page
-   Verify `logsEndRef` is rendering

## Code Quality

### Type Safety

-   Full TypeScript implementation
-   Proper interface definitions for LogEntry
-   Type-safe SSE event handling

### Performance

-   Efficient SSE instead of polling
-   Debounced scroll handling
-   Proper cleanup on unmount
-   Optimized re-renders with proper dependencies

### Accessibility

-   Proper ARIA labels on buttons
-   Keyboard navigation support
-   High contrast colors for readability
-   Semantic HTML structure

## Credits

Built for the **AI Video Factory** platform, demonstrating advanced payment channel technology on Arbitrum Sepolia with transparent real-time logging.

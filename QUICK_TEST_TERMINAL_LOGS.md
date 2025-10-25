# Quick Test Guide - Terminal Logs Feature 🚀

## Prerequisites

-   MetaMask connected to Arbitrum Sepolia
-   Contract deployed (MediaFactory & PaymentChannel)
-   Test ETH in wallet

## Step 1: Start the Orchestrator

```bash
cd orchestrator
npm start
```

You should see:

```
🚀 Orchestrator server started
   Port: 3001
   Base URL: http://localhost:3001
   Contract: 0x...
👂 Listening for VideoRequested events...
```

## Step 2: Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend should start on `http://localhost:5173`

## Step 3: Open the Application

1. Navigate to `http://localhost:5173`
2. You should see:
    - **Left side**: Payment Channel Info + Video Request Form
    - **Right side**: Terminal Logs (showing "Waiting for orchestrator activity...")
    - **Terminal header**: Green pulsing dot showing "LIVE"

## Step 4: Submit a Video Request

1. Connect your MetaMask wallet (click "Generate Video" or "Connect Wallet")
2. Enter a prompt like: `"A cat playing piano in a jazz club"`
3. Leave payment at `0.000001` ETH (or increase if you want)
4. Click **Generate Video**
5. Approve the transaction in MetaMask

## Step 5: Watch the Logs! 📺

As soon as the transaction is confirmed, the terminal will start showing:

### Phase 1: Detection (2-3 seconds)

```
🎬 NEW VIDEO REQUEST DETECTED!
Request ID: 1
User: 0x...
Prompt: "A cat playing piano in a jazz club"
```

### Phase 2: Authorization Setup (~10-15 seconds)

```
✅ AP2 Authorization Complete!
Transaction Hash: 0x...

✅ MCP Context Established!
Available Tools: [generate_script, generate_sound, generate_video]

✅ x402 Challenge Defined!
Payment verification gateway active
```

### Phase 3: Payment Channels (~5 seconds)

```
💰 Opening 3 payment channels in single transaction...
✅ Payment Channels Opened Successfully!
Channel IDs:
  • Script Agent Channel: 0x...
  • Sound Agent Channel: 0x...
  • Video Agent Channel: 0x...

Gas Savings: ~105,000 gas vs traditional payments
```

### Phase 4: Off-Chain Settlements (~30 seconds total)

```
📝 SETTLEMENT 1/3: SCRIPT AGENT
✅ Script Generation Complete!
💸 Creating Off-Chain Payment Settlement
Amount: 0.0000003 ETH
Gas Cost: 0 (off-chain!)
✅ Settlement Complete!

🎵 SETTLEMENT 2/3: SOUND AGENT
✅ Sound Generation Complete!
💸 Creating Off-Chain Payment Settlement
Amount: 0.0000003 ETH
Gas Cost: 0 (off-chain!)
✅ Settlement Complete!

🎬 SETTLEMENT 3/3: VIDEO AGENT
✅ Video Generation Complete!
💸 Creating Off-Chain Payment Settlement
Amount: 0.0000004 ETH
Gas Cost: 0 (off-chain!)
✅ Settlement Complete!
```

### Phase 5: Channel Closures (~10 seconds)

```
🏁 Closing payment channel for script agent
✅ Channel closed! Agent received 0.0000003 ETH

🏁 Closing payment channel for sound agent
✅ Channel closed! Agent received 0.0000003 ETH

🏁 Closing payment channel for video agent
✅ Channel closed! Agent received 0.0000004 ETH

🎉 COMPLETE PAYMENT CHANNEL FLOW FINISHED 🎉
```

## What You'll Learn

By watching the logs in real-time, you'll see:

### 🎯 **Payment Channel Benefits**

1. **Gas Efficiency**: Only 5 upfront transactions vs 7 traditional
2. **Instant Settlements**: Agents get paid instantly with 0 gas
3. **Batch Operations**: 3 channels opened in 1 transaction
4. **Flexibility**: Agents claim funds when ready

### 🔐 **Protocol Stack**

1. **AP2**: Agent Payment Protocol 2 for authorization
2. **x402**: Payment verification via cryptographic signatures
3. **MCP**: Model Context Protocol for agent capabilities
4. **Payment Channels**: Off-chain settlement layer

### 💰 **Payment Flow**

1. User submits request with payment
2. Orchestrator opens 3 payment channels (1 TX)
3. Agents work and receive signed payments (0 gas!)
4. Agents close channels to claim funds (when ready)

## Terminal Features to Try

### 1. Minimize/Maximize

-   Click the minimize icon (top-right of terminal)
-   Terminal collapses to just the header bar
-   Click maximize to expand again

### 2. Clear Logs

-   Click the trash icon (top-right of terminal)
-   All logs are cleared
-   Submit another request to see new logs

### 3. Auto-Scroll

-   Terminal automatically scrolls to show latest logs
-   Try scrolling up to view earlier logs
-   Smooth scroll animation

### 4. Connection Status

-   Watch the green pulsing dot ("LIVE" indicator)
-   If orchestrator stops, dot turns red and shows "OFFLINE"
-   Connection automatically restored when orchestrator restarts

### 5. Log Filtering (visual)

-   Notice different colors for different log types:
    -   **Green**: Success messages
    -   **Red**: Errors
    -   **Blue**: Blockchain transactions
    -   **Purple**: Channel operations
    -   **Cyan**: Settlement messages
    -   **Yellow**: Warnings
    -   **Gray**: General info

## Troubleshooting

### Problem: Terminal shows "OFFLINE"

**Solution:**

```bash
# Check orchestrator is running
cd orchestrator
npm start

# Verify it's on port 3001
# Check browser console for errors
```

### Problem: No logs appearing after submission

**Solution:**

1. Check orchestrator console for errors
2. Verify contract address is correct in `.env`
3. Check MetaMask transaction was confirmed
4. Look at browser Network tab for SSE connection

### Problem: Terminal not updating in real-time

**Solution:**

1. Refresh the page
2. Check browser console for errors
3. Verify CORS is working (orchestrator should have `cors` installed)

### Problem: Logs appear but jumbled or unformatted

**Solution:**

1. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
2. Clear browser cache
3. Check console for CSS loading errors

## Tips for Best Experience

1. **Use Split Screen**: Position browser and terminal side by side
2. **Zoom Levels**: If text is too small, use browser zoom (Cmd/Ctrl +)
3. **Multiple Requests**: Submit multiple video requests to see parallel processing
4. **Network Tab**: Open browser DevTools → Network → Filter "EventStream" to see SSE
5. **Screenshots**: The logs make great documentation screenshots!

## Advanced: Custom Logging

Want to add your own logs? In any orchestrator file:

```javascript
console.log("✅ Custom success message"); // Shows as green
console.log("❌ Custom error message"); // Shows as red
console.log("⚠️ Custom warning"); // Shows as yellow
console.log("🔗 Transaction: 0x..."); // Shows as blue
```

The log streamer automatically detects emojis and keywords to categorize logs!

## What's Next?

After testing the basic flow, try:

-   [ ] Submit multiple requests in parallel
-   [ ] Monitor gas costs in MetaMask
-   [ ] Check agent balances via API
-   [ ] Explore the payment signature endpoints
-   [ ] Test with different payment amounts
-   [ ] Watch how refunds work (unused channel funds)

## Feedback

This terminal provides unprecedented transparency into the payment channel system. Users can:

-   **Trust the Process**: See every step in real-time
-   **Understand Gas Savings**: Compare traditional vs channel methods
-   **Learn the Protocols**: AP2, x402, MCP explained through logs
-   **Track Their Request**: From submission to completion

Enjoy exploring the future of AI agent payments! 🚀

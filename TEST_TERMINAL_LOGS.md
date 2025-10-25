# Testing Guide - Terminal Logs Feature ✅

## Pre-Test Setup Checklist

### Backend (Orchestrator)

-   [ ] Orchestrator dependencies installed (`npm install` in `/orchestrator`)
-   [ ] `cors` package installed (`npm install cors`)
-   [ ] `.env` file configured with correct contract addresses
-   [ ] Wallet private key set in environment
-   [ ] Arbitrum Sepolia RPC working

### Frontend

-   [ ] Frontend dependencies installed (`npm install` in `/frontend`)
-   [ ] `.env.local` file created with `VITE_ORCHESTRATOR_URL=http://localhost:3001`
-   [ ] Build runs without errors (`npm run dev` works)
-   [ ] No TypeScript errors in terminal

### Blockchain

-   [ ] MetaMask installed and connected to Arbitrum Sepolia
-   [ ] Test wallet has ETH (at least 0.001 ETH)
-   [ ] MediaFactory contract deployed
-   [ ] PaymentChannel contract deployed
-   [ ] Contract addresses correct in orchestrator config

---

## Test Execution

### Step 1: Start Services

#### Terminal 1 - Orchestrator

```bash
cd /Users/kreeza/Desktop/Programming/Encode_London/AI-TO-AI-PAYMENTS/orchestrator
npm start
```

**Expected Output:**

```
🚀 Orchestrator server started
   Port: 3001
   Base URL: http://localhost:3001
   Contract: 0x...
👂 Listening for VideoRequested events...
✅ Event listener is now active and waiting for events...
```

✅ **Verify:** Server starts on port 3001

#### Terminal 2 - Frontend

```bash
cd /Users/kreeza/Desktop/Programming/Encode_London/AI-TO-AI-PAYMENTS/frontend
npm run dev
```

**Expected Output:**

```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ **Verify:** Frontend starts on port 5173

---

### Step 2: Visual Inspection

Open browser to `http://localhost:5173`

#### Check Layout

-   [ ] Page title: "🎬 AI Video Factory"
-   [ ] Two-column layout visible on desktop
-   [ ] Left column has 3 sections:
    -   [ ] Payment Channel Info panel (blue/purple styled)
    -   [ ] Processing Status badge (hidden/idle initially)
    -   [ ] Video Request Form
-   [ ] Right column has:
    -   [ ] Terminal Logs component
    -   [ ] Header: "🖥 Orchestrator Logs"
    -   [ ] Connection indicator shows "🟢 LIVE"
    -   [ ] Empty state message: "Waiting for orchestrator activity..."

#### Check Terminal Header

-   [ ] Terminal icon (🖥) visible
-   [ ] "Orchestrator Logs" text visible
-   [ ] Connection status: green dot + "LIVE"
-   [ ] Clear button (trash icon) visible
-   [ ] Minimize button (minimize icon) visible

#### Check Terminal Footer

-   [ ] Shows "0 entries"
-   [ ] Shows "Payment Channel System"
-   [ ] Shows "ETH • Arbitrum Sepolia"

---

### Step 3: Test Terminal Controls

#### Test Minimize/Maximize

1. Click minimize button (top-right)
    - [ ] Terminal collapses to just header bar
    - [ ] Icon changes to maximize icon
2. Click maximize button
    - [ ] Terminal expands back to full height
    - [ ] Shows empty state again

#### Test Clear (Before Logs)

1. Click clear button (trash icon)
    - [ ] Nothing should happen (already empty)
    - [ ] No console errors

---

### Step 4: Submit Video Request

#### Fill Form

1. **Connect Wallet** (if not connected)

    - [ ] Click "Generate Video" button
    - [ ] MetaMask popup appears
    - [ ] Select account and connect
    - [ ] Green "Connected" badge appears

2. **Enter Prompt**

    ```
    A cat playing piano in a jazz club at night
    ```

    - [ ] Prompt textarea accepts input

3. **Set Amount**

    - Leave at default: `0.000001`
    - [ ] Amount is valid (minimum met)

4. **Submit**
    - [ ] Click "Generate Video"
    - [ ] MetaMask popup for transaction approval
    - [ ] Transaction details look correct
    - [ ] Approve transaction

---

### Step 5: Watch Real-Time Logs

#### Phase 1: Request Detection (2-3 seconds)

Watch terminal for:

-   [ ] First log appears: "🎬 NEW VIDEO REQUEST DETECTED!"
-   [ ] Request ID displayed
-   [ ] User address displayed
-   [ ] Prompt text displayed
-   [ ] Block number displayed
-   [ ] Transaction hash displayed
-   [ ] Processing status badge appears: "Detecting Request" (blue)

**Verify Colors:**

-   [ ] 🎬 lines are colored (info gray)
-   [ ] Timestamps are gray/muted

#### Phase 2: Authorization (10-15 seconds)

Watch for these logs in order:

-   [ ] "STEP 1: AP2 (Agent Payment Protocol 2)"
-   [ ] "AP2 Parameters" with nonce, URIs
-   [ ] "✅ AP2 Authorization Complete!"
-   [ ] Transaction hash (blue color)
-   [ ] "STEP 2: MCP (Model Context Protocol)"
-   [ ] "✅ MCP Context Established!"
-   [ ] "STEP 3: x402 (Payment Required)"
-   [ ] "✅ x402 Challenge Defined!"
-   [ ] Processing status: "Setting up Authorization" (purple)

**Verify:**

-   [ ] Green checkmarks (✅) are green
-   [ ] Transaction hashes are blue
-   [ ] Auto-scrolling is working
-   [ ] No console errors

#### Phase 3: Channel Opening (5 seconds)

Watch for:

-   [ ] "STEP 4: PAYMENT CHANNEL OPENING"
-   [ ] "Channel Configuration" with amounts
-   [ ] "Fund Distribution" (3 agents listed)
-   [ ] "Opening 3 payment channels in single transaction..."
-   [ ] "✅ Payment Channels Opened Successfully!"
-   [ ] 3 Channel IDs displayed (purple/channel color)
-   [ ] "Gas Efficiency" section
-   [ ] "Transactions Used: 1 (opened 3 channels!)"
-   [ ] Processing status: "Opening Payment Channels" (yellow)

**Verify:**

-   [ ] Channel operations are purple colored
-   [ ] Amounts are visible (e.g., "0.0000003 ETH")
-   [ ] Progress bar is animating (if visible)

#### Phase 4: Off-Chain Settlements (30 seconds)

Watch for **three settlement sequences**:

**Settlement 1 - Script Agent:**

-   [ ] "SETTLEMENT 1/3: SCRIPT AGENT"
-   [ ] "📝 Work: Generating video script..."
-   [ ] "✅ Script Generation Complete!"
-   [ ] "💸 Creating Off-Chain Payment Settlement"
-   [ ] "Amount: 0.0000003 ETH" (or similar)
-   [ ] "Gas Cost: 0 (off-chain!)"
-   [ ] "✅ Settlement Complete!"
-   [ ] Signature displayed (partial)

**Settlement 2 - Sound Agent:**

-   [ ] "SETTLEMENT 2/3: SOUND AGENT"
-   [ ] "🎵 Work: Generating audio..."
-   [ ] Same pattern as script agent
-   [ ] Different nonce (1 instead of 0)

**Settlement 3 - Video Agent:**

-   [ ] "SETTLEMENT 3/3: VIDEO AGENT"
-   [ ] "🎬 Work: Generating final video..."
-   [ ] Same pattern
-   [ ] Different nonce (2)

**Verify:**

-   [ ] Processing status: "Processing Settlements" (cyan)
-   [ ] Settlement logs are cyan colored
-   [ ] "0 gas" is clearly visible
-   [ ] No errors during agent processing

#### Phase 5: Summary & Closure Prep (5 seconds)

Watch for:

-   [ ] "REQUEST PROCESSING COMPLETE"
-   [ ] "PAYMENT CHANNEL FLOW SUMMARY"
-   [ ] Summary table with channel IDs
-   [ ] Gas efficiency analysis
-   [ ] Security section
-   [ ] "STEP 6: CHANNEL CLOSURE" instructions

**Verify:**

-   [ ] Tables render correctly (ASCII art)
-   [ ] All 3 channels listed as OPEN
-   [ ] URLs for payment signatures shown

#### Phase 6: Mock Channel Closures (10 seconds)

Watch for:

-   [ ] "Preparing to simulate channel closures..."
-   [ ] 2 second countdown
-   [ ] For each agent:
    -   [ ] "Closing payment channel for [agent] agent"
    -   [ ] "Channel closed! Agent received X ETH"
    -   [ ] Balance update shown
-   [ ] Processing status: "Closing Channels" (orange)

#### Phase 7: Final Summary

Watch for:

-   [ ] "🎉 COMPLETE PAYMENT CHANNEL FLOW FINISHED 🎉"
-   [ ] "EXECUTION SUMMARY"
-   [ ] All phases marked complete (✅)
-   [ ] Total statistics
-   [ ] Processing status: "Complete!" (green)
-   [ ] Status badge auto-hides after 5 seconds

**Verify:**

-   [ ] All phases completed
-   [ ] No error messages
-   [ ] Terminal still shows all logs
-   [ ] Total log count increased significantly (80-100+ entries)

---

### Step 6: Terminal Interactions

#### Test Auto-Scroll

1. While logs are flowing:
    - [ ] Terminal automatically scrolls to bottom
    - [ ] Latest logs always visible
2. Manually scroll up
    - [ ] Can view earlier logs
    - [ ] New logs still arrive (check bottom)
3. Scroll back to bottom
    - [ ] Auto-scroll resumes

#### Test Clear Logs

1. Click clear button (trash icon)
    - [ ] All logs disappear
    - [ ] Empty state appears again
    - [ ] Entry count resets to "0 entries"
    - [ ] No console errors

#### Test Connection Resilience

1. Stop orchestrator (Ctrl+C in Terminal 1)
    - [ ] Connection indicator changes to "🔴 OFFLINE"
    - [ ] Red static dot (no pulsing)
2. Restart orchestrator (`npm start`)
    - [ ] Connection indicator returns to "🟢 LIVE"
    - [ ] Green pulsing dot
    - [ ] Auto-reconnects within 3-5 seconds

---

### Step 7: Multiple Requests

#### Submit Second Request

1. Clear logs (for clean slate)
2. Submit another video request with different prompt
3. Watch logs flow again

**Verify:**

-   [ ] New request ID (incremented)
-   [ ] All phases work again
-   [ ] No interference with previous request
-   [ ] Terminal handles it smoothly

#### Parallel Requests (Advanced)

1. Open frontend in two different browser tabs
2. Submit requests from both simultaneously

**Verify:**

-   [ ] Both terminals show logs
-   [ ] Logs are interleaved correctly
-   [ ] No log entries lost
-   [ ] Both connections stable

---

### Step 8: Mobile Testing

#### Resize Browser Window

1. Make window narrow (< 768px)

    - [ ] Layout switches to single column
    - [ ] Form appears above terminal
    - [ ] Terminal still fully functional
    - [ ] All controls work

2. Tablet size (768px - 1024px)
    - [ ] Two-column layout maintained
    - [ ] Terminal not sticky (scrolls with page)

---

### Step 9: Error Handling

#### Test Network Errors

1. Disconnect from internet

    - [ ] Connection indicator shows OFFLINE
    - [ ] No crashes or console errors

2. Reconnect internet
    - [ ] Connection restores automatically
    - [ ] Shows LIVE again

#### Test Invalid Transactions

1. Submit request with insufficient ETH

    - [ ] MetaMask shows error
    - [ ] No logs appear (request never submitted)
    - [ ] Terminal still functional

2. Reject transaction in MetaMask
    - [ ] Toast shows error
    - [ ] No logs appear
    - [ ] Can submit again

---

### Step 10: Browser Console Check

Open DevTools → Console

**Should NOT see:**

-   ❌ React errors
-   ❌ Network errors (except expected failures)
-   ❌ TypeScript errors
-   ❌ CORS errors
-   ❌ EventSource errors

**Should see:**

-   ✅ "Connected to orchestrator log stream"
-   ✅ Parsed log objects (if you log them)

---

### Step 11: Network Tab Check

Open DevTools → Network

#### Filter by "EventStream"

-   [ ] Connection to `/api/logs/stream` visible
-   [ ] Status: "200 OK"
-   [ ] Type: "eventsource"
-   [ ] Size: Gradually increasing (log data)
-   [ ] Time: Ongoing (long-running connection)

#### Check Headers

-   [ ] `Content-Type: text/event-stream`
-   [ ] `Cache-Control: no-cache`
-   [ ] `Connection: keep-alive`

---

## Success Criteria

### Visual

✅ Terminal looks professional and polished ✅ Colors are distinct and readable ✅ Layout is responsive ✅ No visual glitches or overlaps ✅ Animations are smooth

### Functional

✅ SSE connection establishes immediately ✅ Logs appear in real-time (< 1 second delay) ✅ All log types render correctly ✅ All controls work (minimize, clear) ✅ Auto-scroll works smoothly ✅ Connection status updates correctly ✅ Processing status tracks phases accurately

### Educational

✅ Users can understand payment channel flow ✅ Gas savings are clearly demonstrated ✅ Security protocols (AP2, x402, MCP) explained ✅ Each phase is clearly labeled ✅ Technical details are visible but not overwhelming

### Performance

✅ No lag or stuttering ✅ Memory usage reasonable (< 10MB for logs) ✅ CPU usage minimal (< 5% when idle) ✅ Handles 100+ log entries smoothly ✅ Multiple clients work simultaneously

### Code Quality

✅ No linter errors ✅ No TypeScript errors ✅ No console warnings ✅ Proper cleanup on unmount ✅ No memory leaks

---

## Common Issues & Solutions

### Issue: Terminal shows "OFFLINE"

**Solution:**

1. Check orchestrator is running: `http://localhost:3001/health`
2. Verify VITE_ORCHESTRATOR_URL in `.env.local`
3. Check CORS is enabled in orchestrator
4. Check browser console for errors

### Issue: No logs appearing

**Solution:**

1. Submit a video request to trigger logs
2. Check orchestrator console for errors
3. Verify contract addresses are correct
4. Check wallet has sufficient ETH

### Issue: Logs appear but wrong colors

**Solution:**

1. Hard refresh browser (Cmd+Shift+R)
2. Clear browser cache
3. Check CSS is loading correctly
4. Verify Tailwind classes in TerminalLogs.tsx

### Issue: Auto-scroll not working

**Solution:**

1. Scroll to bottom manually
2. Check logsEndRef is rendering
3. Verify useEffect dependencies
4. Check for JavaScript errors in console

### Issue: Connection drops frequently

**Solution:**

1. Check network stability
2. Verify orchestrator is not crashing
3. Check for memory issues
4. Review EventSource error handlers

---

## Performance Benchmarks

### Expected Metrics

**Initial Load:**

-   Frontend load time: < 3 seconds
-   SSE connection time: < 500ms
-   First log appearance: < 1 second after request

**During Processing:**

-   Log latency: < 100ms from server
-   Scroll performance: 60 FPS
-   Memory usage: 5-10MB for terminal
-   CPU usage: < 5% average

**Complete Flow:**

-   Total duration: 60-70 seconds
-   Total logs: 80-100 entries
-   No lag or stuttering
-   Smooth animations throughout

---

## Final Checklist

Before marking as complete, verify:

-   [ ] All test steps passed
-   [ ] No console errors
-   [ ] No linter warnings
-   [ ] Mobile responsive works
-   [ ] Multiple requests work
-   [ ] Connection resilience works
-   [ ] All colors render correctly
-   [ ] All controls function
-   [ ] Educational value clear
-   [ ] Performance acceptable
-   [ ] Code is clean and documented
-   [ ] README files are comprehensive

---

## Sign-Off

**Tested by:** ********\_******** **Date:** ********\_******** **Result:** ✅ PASS / ❌ FAIL **Notes:**

---

## Next Steps

After testing passes:

1. Take screenshots for documentation
2. Create demo video (screen recording)
3. Update main README with feature
4. Add to changelog
5. Consider production deployment

---

**Happy Testing! 🚀**

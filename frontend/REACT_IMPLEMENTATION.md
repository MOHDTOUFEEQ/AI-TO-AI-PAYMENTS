# React Frontend Implementation

## Overview

The React frontend has been successfully adapted to match the vanilla JS functionality with all the Web3 integration for video request submission.

## What Was Added

### 1. **Web3 Integration** (`src/contexts/Web3Context.tsx`)

-   Complete Web3Provider context for wallet management
-   Automatic connection detection on page load
-   Account change listener
-   Connected to Arbitrum Sepolia network
-   Contract address: `0x6417C3ca31418E510269787D56B346e59846dC49`

### 2. **VideoRequestForm Component** (`src/components/VideoRequestForm.tsx`)

-   Video prompt textarea
-   Payment amount input (ETH)
-   Wallet connection integration
-   Transaction submission with ethers.js
-   Event parsing for VideoRequested
-   Toast notifications for status updates
-   Loading states and error handling

### 3. **Updated Hero Component** (`src/components/Hero.tsx`)

-   Replaced generic search with VideoRequestForm
-   Maintains modern UI design
-   Shows payment channel information

### 4. **App.tsx Updates**

-   Added Web3Provider wrapper
-   All components now have access to Web3 context

### 5. **TypeScript Declarations** (`src/vite-env.d.ts`)

-   Added window.ethereum interface types
-   MetaMask integration types

## Features

### Wallet Connection

-   Automatic detection of existing MetaMask connection
-   Manual connection on form submission if not connected
-   Display of connected address
-   Account change handling

### Video Request Submission

1. User enters video prompt
2. User specifies payment amount (minimum 0.0000001 ETH)
3. Clicks "Generate Video" button
4. If not connected, MetaMask prompts for connection
5. Transaction is sent to smart contract
6. Payment channels are automatically opened by orchestrator
7. Agents receive off-chain signed payments (0 gas!)

### Payment Information Display

-   Minimum payment: 0.0001 ETH
-   Payment split: Script (30%) → Sound (30%) → Video (40%)
-   Gas-efficient off-chain payments via payment channels

### Status Messages

-   Connection status
-   Transaction hash
-   Request ID
-   Success/error notifications

## How to Run

### Development

```bash
cd frontend
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment

-   **Network**: Arbitrum Sepolia
-   **Contract**: MediaFactory at `0x6417C3ca31418E510269787D56B346e59846dC49`
-   **Payment Channel**: `0xd1c473F7c7003De0527254dC02431Be7feb625c2`

## Dependencies Added

-   `ethers@6` - Ethereum library for Web3 interactions

## Usage Flow

1. Open the app in your browser
2. Ensure MetaMask is installed and connected to Arbitrum Sepolia
3. The app will auto-detect if you're already connected
4. Enter your video prompt in the textarea
5. Set your payment amount (default: 0.0000001 ETH)
6. Click "Generate Video"
7. Approve the transaction in MetaMask
8. Wait for confirmation
9. The orchestrator will open payment channels for the agents
10. Agents will process your request with 0-gas payments!

## Key Differences from Vanilla JS

1. **State Management**: Using React hooks instead of direct DOM manipulation
2. **Type Safety**: Full TypeScript support with proper types
3. **UI Components**: Using shadcn/ui components for consistent design
4. **Context API**: Web3 state managed globally via Context
5. **Better UX**: Toast notifications instead of status div
6. **Modern Design**: Glass morphism and gradient effects

## Smart Contract ABI

The minimal ABI includes:

-   `requestVideo(string memory _prompt) public payable`
-   Event: `VideoRequested(uint256 indexed requestId, address indexed user, string prompt)`
-   Event: `PaymentChannelsOpened(uint256 indexed requestId, bytes32[] channelIds, uint256 totalAmount)`

## Next Steps

-   Add video status tracking
-   Show request history
-   Display generated videos
-   Add wallet balance display
-   Network switching support
-   Gas estimation before transaction

# AI Video Factory

Generate videos with AI agents on Arbitrum using gas-efficient payment channels.

## Project Info

This is a React + TypeScript application that allows users to request AI-generated videos by submitting prompts and payments through smart contracts on Arbitrum Sepolia.

## Technologies

This project is built with:

-   Vite
-   TypeScript
-   React
-   shadcn-ui
-   Tailwind CSS
-   ethers.js v6
-   Web3/MetaMask integration

## Getting Started

### Prerequisites

-   Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
-   MetaMask browser extension
-   Test ETH on Arbitrum Sepolia

### Installation

```sh
# Step 1: Navigate to the frontend directory
cd frontend

# Step 2: Install the necessary dependencies
npm install

# Step 3: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080` (or another port if 8080 is in use).

## How It Works

1. **Connect Wallet**: MetaMask automatically connects if previously authorized
2. **Enter Prompt**: Describe the video you want to create
3. **Set Payment**: Specify ETH amount (minimum 0.0000001 ETH)
4. **Submit Request**: Transaction is sent to the MediaFactory smart contract
5. **Payment Channels**: Orchestrator opens payment channels with agents
6. **Video Generation**: Agents process the request with 0-gas off-chain payments

## Smart Contract Integration

-   **Contract Address**: `0x6417C3ca31418E510269787D56B346e59846dC49`
-   **Network**: Arbitrum Sepolia (Chain ID: 421614)
-   **Payment Channel**: `0xd1c473F7c7003De0527254dC02431Be7feb625c2`

### Payment Distribution

-   Script Agent: 30%
-   Sound Agent: 30%
-   Video Agent: 40%

## Building for Production

```sh
npm run build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```sh
npm run preview
```

## Documentation

See the following files for more details:

-   `REACT_IMPLEMENTATION.md` - Implementation details
-   `MIGRATION_COMPLETE.md` - Complete migration guide
-   `CODE_MAPPING.md` - Vanilla JS to React code comparison

## Features

-   ✅ MetaMask wallet integration
-   ✅ Auto-connect on page load
-   ✅ Video request submission
-   ✅ Transaction confirmation with event parsing
-   ✅ Toast notifications for user feedback
-   ✅ Account change detection
-   ✅ Modern glass morphism UI
-   ✅ Fully responsive design
-   ✅ TypeScript type safety

## License

MIT

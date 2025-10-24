# Smart Contracts

This directory contains the Solidity smart contracts for the AI-to-AI payments system.

## Files

-   `PaymentContract.sol` - Main payment contract for handling invoices and payment verification

## Usage

### Compile Contracts

```bash
npm run compile
```

### Deploy to Arbitrum

```bash
npm run deploy
```

### Deploy Locally (for testing)

```bash
npm run deploy:local
```

## Contract Features

-   **Invoice Creation**: Server can create invoices for AI services
-   **Payment Verification**: Track and verify blockchain transactions
-   **Double-Spend Prevention**: Uses tx hash tracking to prevent reuse
-   **Events**: Emits events for payment tracking

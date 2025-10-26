# Vercel Deployment Guide for AI-to-AI Payments

## Overview

This guide explains how to deploy your AI-to-AI payments application to Vercel and handle the log streaming functionality that works in both local development and production environments.

## Architecture

The application consists of two main parts:

1. **Frontend** (React/Vite) - Deployed to Vercel
2. **Orchestrator Backend** (Node.js/Express) - Must be deployed separately

## Why Separate Deployments?

Vercel's serverless functions have limitations that prevent real-time log streaming:

-   **No persistent connections**: Server-Sent Events (SSE) require long-lived connections
-   **Execution time limits**: Functions timeout after a few seconds
-   **Cold starts**: Functions spin down when not in use

## Solution: Hybrid Approach

The application now automatically detects the environment and uses:

-   **SSE (Server-Sent Events)** for local development - real-time streaming
-   **Polling** for production/Vercel - fetches logs every 2 seconds

## Deployment Steps

### 1. Deploy the Orchestrator Backend

The orchestrator must be deployed to a platform that supports persistent connections:

#### Option A: Railway

```bash
cd orchestrator
railway login
railway init
railway up
```

#### Option B: Render

```bash
cd orchestrator
# Create render.yaml or use web interface
# Set build command: npm install
# Set start command: npm start
```

#### Option C: DigitalOcean App Platform

```bash
cd orchestrator
# Create app spec and deploy
```

### 2. Configure Environment Variables

Set these environment variables in your orchestrator deployment:

```bash
# Contract addresses
MEDIA_FACTORY_ADDRESS=0x...
PAYMENT_CHANNEL_ADDRESS=0x...

# Network
ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Wallets (keep private keys secure!)
ORCHESTRATOR_PRIVATE_KEY=0x...
SCRIPT_AGENT_WALLET=0x...
SOUND_AGENT_WALLET=0x...
VIDEO_AGENT_WALLET=0x...

# API
PORT=3001
BASE_URL=https://your-orchestrator-url.com
```

### 3. Deploy Frontend to Vercel

#### Option A: Vercel CLI

```bash
cd frontend
vercel login
vercel --prod
```

#### Option B: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set build settings:
    - **Framework Preset**: Vite
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`

### 4. Configure Frontend Environment Variables

In your Vercel project settings, add:

```bash
VITE_ORCHESTRATOR_URL=https://your-orchestrator-url.com
```

Replace `https://your-orchestrator-url.com` with your actual orchestrator deployment URL.

## How Log Streaming Works

### Local Development

-   Uses Server-Sent Events (SSE) for real-time streaming
-   Connects to `http://localhost:3001/api/logs/stream`
-   Logs appear instantly as they're generated

### Production (Vercel)

-   Automatically detects Vercel environment
-   Uses polling every 2 seconds
-   Fetches from `https://your-orchestrator-url.com/api/logs`
-   Includes duplicate filtering and timestamp-based incremental updates

## API Endpoints

### New Log Endpoint (for polling)

```
GET /api/logs?limit=50&since=2024-01-01T00:00:00.000Z
```

Response:

```json
{
	"timestamp": "2024-01-01T12:00:00.000Z",
	"logs": [
		{
			"timestamp": "2024-01-01T12:00:00.000Z",
			"type": "info",
			"message": "Processing video request...",
			"metadata": {}
		}
	],
	"total": 1,
	"hasMore": false
}
```

### Existing SSE Endpoint (for local)

```
GET /api/logs/stream
```

## Testing the Deployment

1. **Deploy orchestrator** to your chosen platform
2. **Deploy frontend** to Vercel
3. **Set environment variables** in both deployments
4. **Test log streaming**:
    - Submit a video request
    - Check that logs appear in the terminal component
    - Verify connection status shows "LIVE"

## Troubleshooting

### Logs Not Appearing

1. Check orchestrator URL in environment variables
2. Verify orchestrator is running and accessible
3. Check browser console for connection errors
4. Ensure CORS is properly configured

### Connection Issues

1. Verify orchestrator deployment is healthy
2. Check network connectivity between Vercel and orchestrator
3. Review orchestrator logs for errors

### Performance Considerations

-   Polling happens every 2 seconds (configurable)
-   Log buffer is limited to 1000 entries
-   Duplicate filtering prevents log spam
-   Consider implementing log rotation for long-running instances

## Security Notes

-   Keep private keys secure in environment variables
-   Use HTTPS for all production deployments
-   Consider implementing authentication for the orchestrator API
-   Monitor for unusual activity in production logs

## Cost Optimization

-   **Vercel**: Free tier includes 100GB bandwidth
-   **Orchestrator**: Choose platform based on expected load
-   **Polling frequency**: Adjust based on your needs (2s default)

## Next Steps

1. Deploy orchestrator to your chosen platform
2. Deploy frontend to Vercel
3. Configure environment variables
4. Test the complete flow
5. Monitor performance and adjust as needed

The application will automatically handle the transition between local development (SSE) and production (polling) without any code changes needed.

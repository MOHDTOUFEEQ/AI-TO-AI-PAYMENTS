const { ethers } = require("ethers");
const { payAgent, defineAP2Flow, setMCPContext, getRequest } = require("../utils/contract");
const config = require("../config");
const axios = require("axios");

/**
 * Process a video request through all AI agents
 */
async function processVideoRequest(requestId, user, prompt) {
	console.log(`\n📹 Processing video request ${requestId}...`);

	const baseUrl = config.baseUrl;
	const requestIdStr = requestId.toString();

	// Generate unique nonce for AP2 flow
	const ap2Nonce = `ap2-${requestIdStr}-${Date.now()}`;

	// Define AP2 flow metadata
	const receiptURI = `${baseUrl}/api/receipt/${requestIdStr}`;
	const callbackURI = `${baseUrl}/api/callback/${requestIdStr}`;
	const metadataURI = `${baseUrl}/api/metadata/${requestIdStr}`;

	console.log("📝 Setting AP2 flow metadata...");
	await defineAP2Flow(requestIdStr, ap2Nonce, receiptURI, callbackURI, metadataURI);

	// Set MCP context URI (tools manifest for AI agents)
	const mcpContextURI = `${baseUrl}/api/mcp-context/${requestIdStr}`;
	console.log("🔧 Setting MCP context...");
	await setMCPContext(requestIdStr, mcpContextURI);

	// Get the request to calculate payment amounts
	const request = await getRequest(requestIdStr);
	const totalAmount = request.amountPaid;

	console.log(`💰 Total payment: ${ethers.formatEther(totalAmount)} ETH`);

	// Stage 1: Generate script
	console.log("\n📝 Stage 1: Generating script...");
	const scriptResult = await callAgentService("script", { prompt });
	if (scriptResult) {
		const scriptAmount = (totalAmount * BigInt(config.paymentSplit.script)) / 100n;
		await payAgent(requestIdStr, config.agentWallets.script, scriptAmount);
		console.log(`✅ Paid script agent: ${ethers.formatEther(scriptAmount)} ETH`);
	}

	// Stage 2: Generate sound
	console.log("\n🎵 Stage 2: Generating sound...");
	const soundResult = await callAgentService("sound", { prompt, script: scriptResult });
	if (soundResult) {
		const soundAmount = (totalAmount * BigInt(config.paymentSplit.sound)) / 100n;
		await payAgent(requestIdStr, config.agentWallets.sound, soundAmount);
		console.log(`✅ Paid sound agent: ${ethers.formatEther(soundAmount)} ETH`);
	}

	// Stage 3: Generate video
	console.log("\n🎬 Stage 3: Generating video...");
	const videoResult = await callAgentService("video", { prompt, script: scriptResult, sound: soundResult });
	if (videoResult) {
		const videoAmount = (totalAmount * BigInt(config.paymentSplit.video)) / 100n;
		await payAgent(requestIdStr, config.agentWallets.video, videoAmount);
		console.log(`✅ Paid video agent: ${ethers.formatEther(videoAmount)} ETH`);
	}

	console.log(`\n✅ Request ${requestId} completed successfully!`);
}

/**
 * Call an AI agent service
 */
async function callAgentService(agentType, data) {
	const service = config.services[agentType];

	if (!service || !service.enabled) {
		console.log(`⚠️  Service ${agentType} is disabled or not configured`);
		return null;
	}

	try {
		console.log(`   Calling ${service.url}...`);
		const response = await axios.post(service.url, data, {
			timeout: 30000, // 30 second timeout
		});

		console.log(`   ✅ ${agentType} service responded`);
		return response.data;
	} catch (error) {
		console.error(`   ❌ Error calling ${agentType} service:`, error.message);
		return null;
	}
}

module.exports = {
	processVideoRequest,
};

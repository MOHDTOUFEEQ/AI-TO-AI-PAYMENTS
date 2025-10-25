/**
 * Test Event Listener
 * This script tests if the event listener can detect VideoRequested events
 */

require("dotenv").config();
const { ethers } = require("ethers");

const CONTRACT_ADDRESS = process.env.MEDIA_FACTORY_ADDRESS;
const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;

const CONTRACT_ABI = ["event VideoRequested(uint256 indexed requestId, address indexed user, string prompt)"];

async function testEventListener() {
	console.log("🧪 Testing Event Listener Configuration\n");
	console.log("📋 Configuration:");
	console.log("   Contract:", CONTRACT_ADDRESS);
	console.log("   RPC URL:", RPC_URL);
	console.log();

	// Create provider with polling
	const provider = new ethers.JsonRpcProvider(RPC_URL);
	provider.pollingInterval = 4000;

	console.log("✅ Provider created");
	console.log("   Polling Interval:", provider.pollingInterval, "ms");
	console.log();

	// Create contract
	const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

	console.log("✅ Contract instance created");
	console.log();

	// Get current block
	try {
		const currentBlock = await provider.getBlockNumber();
		console.log("📦 Current block:", currentBlock);
		console.log();
	} catch (error) {
		console.error("❌ Error getting block number:", error.message);
		process.exit(1);
	}

	// Set up event listener
	console.log("👂 Setting up event listener...");
	contract.on("VideoRequested", (requestId, user, prompt, event) => {
		console.log("\n" + "🎉".repeat(40));
		console.log("🎉 EVENT DETECTED!");
		console.log("🎉".repeat(40));
		console.log("   Request ID:", requestId.toString());
		console.log("   User:", user);
		console.log("   Prompt:", prompt);
		console.log("   Block:", event.log.blockNumber);
		console.log("   Transaction:", event.log.transactionHash);
		console.log("🎉".repeat(40) + "\n");
	});

	console.log("✅ Event listener registered");
	console.log();
	console.log("⏳ Waiting for VideoRequested events...");
	console.log("   💡 Go to the frontend and submit a video request!");
	console.log("   💡 This script will keep running and catch the event");
	console.log();

	// Keep the script running
	setInterval(() => {
		// Just keep alive
	}, 60000);
}

testEventListener().catch((error) => {
	console.error("❌ Error:", error);
	process.exit(1);
});

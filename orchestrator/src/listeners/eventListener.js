const { initContract, getContract, getProvider, getRequest, getFlowData } = require("../utils/contract");
const { payAgent, defineAP2Flow, setMCPContext } = require("../utils/contract");
const config = require("../config");
const { processVideoRequest } = require("../services/videoProcessor");

let isListening = false;

async function startEventListener() {
	if (isListening) {
		console.log("⚠️  Event listener already running");
		return;
	}

	await initContract();
	const contract = getContract();

	console.log("👂 Listening for VideoRequested events...");
	console.log("   📍 Watching contract:", contract.target);
	console.log("   🌐 Network: Arbitrum Sepolia");
	console.log("   ⏰ Started at:", new Date().toISOString());
	console.log();

	// Listen for new video requests
	contract.on("VideoRequested", async (requestId, user, prompt, event) => {
		console.log("\n" + "🎬".repeat(40));
		console.log("🎬 NEW VIDEO REQUEST DETECTED!");
		console.log("🎬".repeat(40));
		console.log("   Request ID:", requestId.toString());
		console.log("   User:", user);
		console.log("   Prompt:", prompt);
		console.log("   Block:", event.log.blockNumber);
		console.log("   Transaction:", event.log.transactionHash);
		console.log("🎬".repeat(40) + "\n");

		try {
			// Process the video request
			await processVideoRequest(requestId.toString(), user, prompt);
		} catch (error) {
			console.error("\n" + "❌".repeat(40));
			console.error("❌ ERROR PROCESSING REQUEST");
			console.error("❌".repeat(40));
			console.error("Error:", error);
			console.error("Stack:", error.stack);
			console.error("❌".repeat(40) + "\n");
		}
	});

	isListening = true;

	console.log("✅ Event listener is now active and waiting for events...");
	console.log("   💡 Submit a video request from the frontend to test!");
	console.log();
}

function stopEventListener() {
	if (!isListening) return;

	const contract = getContract();
	contract.removeAllListeners("VideoRequested");
	isListening = false;
	console.log("🛑 Event listener stopped");
}

module.exports = {
	startEventListener,
	stopEventListener,
};

const { initContract, getContract, getRequest, getFlowData } = require("../utils/contract");
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

	// Listen for new video requests
	contract.on("VideoRequested", async (requestId, user, prompt, event) => {
		console.log("\n🎬 New video request received!");
		console.log("   Request ID:", requestId.toString());
		console.log("   User:", user);
		console.log("   Prompt:", prompt);
		console.log("   Block:", event.log.blockNumber);

		try {
			// Process the video request
			await processVideoRequest(requestId.toString(), user, prompt);
		} catch (error) {
			console.error("❌ Error processing request:", error);
		}
	});

	isListening = true;
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

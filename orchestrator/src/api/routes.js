const express = require("express");
const router = express.Router();
const { getRequest, getFlowData } = require("../utils/contract");

// Store temporary request data (in production, use a database)
const requestData = {};

// GET /api/request/:id - Get request details
router.get("/request/:id", async (req, res) => {
	try {
		const requestId = req.params.id;
		const request = await getRequest(requestId);
		const flowData = await getFlowData(requestId);

		res.json({
			requestId,
			user: request.user,
			prompt: request.prompt,
			isComplete: request.isComplete,
			amountPaid: request.amountPaid.toString(),
			flowData: {
				metadataURI: flowData.metadataURI,
				ap2Nonce: flowData.ap2Nonce,
				receiptURI: flowData.receiptURI,
				callbackURI: flowData.callbackURI,
				x402ChallengeURI: flowData.x402ChallengeURI,
				mcpContextURI: flowData.mcpContextURI,
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// GET /api/receipt/:id - AP2 receipt
router.get("/receipt/:id", (req, res) => {
	const requestId = req.params.id;
	const data = requestData[requestId] || {};

	res.json({
		requestId,
		receipt: {
			timestamp: data.timestamp || Date.now(),
			prompt: data.prompt,
			amountPaid: data.amountPaid,
			status: data.status || "processing",
		},
	});
});

// POST /api/callback/:id - AP2 callback
router.post("/callback/:id", (req, res) => {
	const requestId = req.params.id;
	const { status, data } = req.body;

	console.log(`📞 Callback received for request ${requestId}:`, status);

	if (!requestData[requestId]) {
		requestData[requestId] = {};
	}

	requestData[requestId].status = status;
	requestData[requestId].data = data;

	res.json({ success: true });
});

// GET /api/metadata/:id - Generic metadata
router.get("/metadata/:id", async (req, res) => {
	try {
		const requestId = req.params.id;
		const request = await getRequest(requestId);
		const data = requestData[requestId] || {};

		res.json({
			requestId,
			metadata: {
				prompt: request.prompt,
				user: request.user,
				amountPaid: request.amountPaid.toString(),
				stages: {
					script: data.scriptResult ? "completed" : "pending",
					sound: data.soundResult ? "completed" : "pending",
					video: data.videoResult ? "completed" : "pending",
				},
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// GET /api/mcp-context/:id - MCP context manifest
router.get("/mcp-context/:id", (req, res) => {
	const requestId = req.params.id;

	res.json({
		requestId,
		mcp: {
			version: "1.0",
			context: {
				tools: [
					{
						name: "generate_script",
						description: "Generate a video script from a prompt",
						parameters: {
							prompt: "string",
						},
					},
					{
						name: "generate_sound",
						description: "Generate audio for a video",
						parameters: {
							script: "string",
						},
					},
					{
						name: "generate_video",
						description: "Generate a video from script and audio",
						parameters: {
							script: "string",
							sound: "string",
						},
					},
				],
				availableAgents: ["script", "sound", "video"],
			},
		},
	});
});

module.exports = router;

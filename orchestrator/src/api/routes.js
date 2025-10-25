const express = require("express");
const router = express.Router();
const { getRequest, getFlowData, getRequestChannels } = require("../utils/contract");
const { getPaymentRecord, getAllPaymentRecords } = require("../services/videoProcessor");
const { getAllBalances, getCurrentBalance } = require("../services/mockChannelClosure");

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

// GET /api/x402-challenge/:id - x402 payment challenge/invoice
router.get("/x402-challenge/:id", async (req, res) => {
	const requestId = req.params.id;

	try {
		const request = await getRequest(requestId);
		const flowData = await getFlowData(requestId);

		res.json({
			requestId,
			x402: {
				version: "1.0",
				type: "payment-channel-verification",
				challenge: {
					description: "Verify off-chain payment signature before closing channel",
					instructions: "Agents must present valid signature to claim funds",
					verificationMethod: "ECDSA signature of (channelId, requestId, agent, amount, nonce)",
				},
				conditions: {
					baseService: "Payment channel opened",
					requirements: ["Valid signature from orchestrator", "Matching channel ID", "Correct nonce"],
					claimProcess: "Agent calls closeChannel() with signature to receive payment",
				},
				paymentProof: {
					method: "off-chain-signature",
					network: "Arbitrum Sepolia",
					signatureEndpoint: `${process.env.BASE_URL || "http://localhost:3001"}/api/payment-signature/${requestId}`,
					claimEndpoint: `${process.env.BASE_URL || "http://localhost:3001"}/api/claim-payment`,
				},
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// ========== PAYMENT CHANNEL ROUTES ==========

// GET /api/channels/:id - Get payment channel IDs for a request
router.get("/channels/:id", async (req, res) => {
	try {
		const requestId = req.params.id;
		const channelIds = await getRequestChannels(requestId);

		res.json({
			requestId,
			channels: channelIds.map((id, idx) => ({
				agent: ["script", "sound", "video"][idx],
				channelId: id,
			})),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// GET /api/payment-signature/:requestId/:agent - Get signed payment for an agent
router.get("/payment-signature/:requestId/:agent", (req, res) => {
	try {
		const { requestId, agent } = req.params;

		// Validate agent type
		if (!["script", "sound", "video"].includes(agent)) {
			return res.status(400).json({ error: "Invalid agent type. Must be: script, sound, or video" });
		}

		const payment = getPaymentRecord(requestId, agent);

		if (!payment) {
			return res.status(404).json({ error: "Payment signature not found for this request/agent combination" });
		}

		res.json({
			requestId,
			agent,
			payment: {
				channelId: payment.channelId,
				amount: payment.amount,
				amountETH: payment.amountETH,
				nonce: payment.nonce,
				signature: payment.signature,
				timestamp: payment.timestamp,
				status: payment.status,
			},
			instructions: {
				step1: "Call PaymentChannel.closeChannel(channelId, amount, nonce, signature)",
				step2: "Funds will be transferred to your wallet",
				step3: "Any unused funds will be refunded to the payer",
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// GET /api/payment-signatures/:requestId - Get all payment signatures for a request
router.get("/payment-signatures/:requestId", (req, res) => {
	try {
		const { requestId } = req.params;
		const payments = getAllPaymentRecords(requestId);

		res.json({
			requestId,
			payments: {
				script: payments.script || null,
				sound: payments.sound || null,
				video: payments.video || null,
			},
			summary: {
				totalSigned: [payments.script, payments.sound, payments.video].filter(Boolean).length,
				pending: [payments.script, payments.sound, payments.video].filter((p) => !p).length,
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// POST /api/claim-payment - Helper endpoint for agents to get claim instructions
router.post("/claim-payment", async (req, res) => {
	try {
		const { requestId, agent } = req.body;

		if (!requestId || !agent) {
			return res.status(400).json({ error: "Missing requestId or agent in request body" });
		}

		const payment = getPaymentRecord(requestId, agent);

		if (!payment) {
			return res.status(404).json({ error: "Payment not found" });
		}

		res.json({
			success: true,
			message: "Payment signature retrieved. Use this data to close the channel.",
			claimData: {
				contractAddress: process.env.PAYMENT_CHANNEL_ADDRESS,
				method: "closeChannel",
				parameters: {
					_channelId: payment.channelId,
					_amount: payment.amount,
					_nonce: payment.nonce,
					_signature: payment.signature,
				},
			},
			exampleCode: {
				javascript: `
const contract = new ethers.Contract(
  "${process.env.PAYMENT_CHANNEL_ADDRESS}",
  PAYMENT_CHANNEL_ABI,
  agentSigner
);

const tx = await contract.closeChannel(
  "${payment.channelId}",
  "${payment.amount}",
  ${payment.nonce},
  "${payment.signature}"
);

await tx.wait();
console.log("Payment claimed! Transaction:", tx.hash);
				`.trim(),
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// ========== AGENT BALANCE ROUTES (MOCK) ==========

// GET /api/balances - Get all agent balances
router.get("/balances", (req, res) => {
	try {
		const balances = getAllBalances();
		const config = require("../config");

		res.json({
			timestamp: new Date().toISOString(),
			note: "Mock balances for demonstration purposes",
			agents: {
				script: {
					wallet: config.agentWallets.script,
					balance: balances.script,
					unit: "ETH",
				},
				sound: {
					wallet: config.agentWallets.sound,
					balance: balances.sound,
					unit: "ETH",
				},
				video: {
					wallet: config.agentWallets.video,
					balance: balances.video,
					unit: "ETH",
				},
			},
			summary: {
				totalBalance: (parseFloat(balances.script) + parseFloat(balances.sound) + parseFloat(balances.video)).toFixed(18) + " ETH",
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// GET /api/balance/:agentType - Get specific agent balance
router.get("/balance/:agentType", (req, res) => {
	try {
		const { agentType } = req.params;

		if (!["script", "sound", "video"].includes(agentType)) {
			return res.status(400).json({ error: "Invalid agent type. Must be: script, sound, or video" });
		}

		const balance = getCurrentBalance(agentType);
		const config = require("../config");

		res.json({
			timestamp: new Date().toISOString(),
			agentType,
			wallet: config.agentWallets[agentType],
			balance,
			unit: "ETH",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;

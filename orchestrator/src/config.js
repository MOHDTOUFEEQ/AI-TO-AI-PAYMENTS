require("dotenv").config();

module.exports = {
	// Contract config
	contractAddress: process.env.MEDIA_FACTORY_ADDRESS,
	paymentChannelAddress: process.env.PAYMENT_CHANNEL_ADDRESS,
	rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || process.env.ARBITRUM_RPC_URL,
	privateKey: process.env.ORCHESTRATOR_PRIVATE_KEY,

	// Agent wallets
	agentWallets: {
		script: process.env.SCRIPT_AGENT_WALLET,
		sound: process.env.SOUND_AGENT_WALLET,
		video: process.env.VIDEO_AGENT_WALLET,
	},

	// Payment distribution (percentages)
	paymentSplit: {
		script: 30, // 30%
		sound: 30, // 30%
		video: 40, // 40%
	},

	// Payment channel config
	channelTimeout: 7 * 24 * 60 * 60, // 7 days in seconds

	// API config
	port: process.env.PORT || 3001,
	baseUrl: process.env.BASE_URL || "http://localhost:3001",

	// Service configs
	services: {
		script: {
			enabled: true,
			url: process.env.SCRIPT_SERVICE_URL || "http://localhost:3000/api/v1/generate-script",
		},
		sound: {
			enabled: true,
			url: process.env.SOUND_SERVICE_URL || "http://localhost:3000/api/v1/generate-image",
		},
		video: {
			enabled: true,
			url: process.env.VIDEO_SERVICE_URL || "http://localhost:3000/api/v1/generate-video",
		},
	},
};

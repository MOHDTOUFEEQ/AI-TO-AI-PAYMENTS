const { ethers } = require("ethers");
const config = require("../config");

// Minimal ABI - only the events and functions we need
const CONTRACT_ABI = [
	"event VideoRequested(uint256 indexed requestId, address indexed user, string prompt)",
	"event AgentPaid(uint256 indexed requestId, address indexed agentWallet, uint256 amount)",
	"event AP2FlowDefined(uint256 indexed requestId, string ap2Nonce, string receiptURI, string callbackURI, string metadataURI)",
	"event X402ChallengeDefined(uint256 indexed requestId, string challengeURI)",
	"event MCPContextSet(uint256 indexed requestId, string contextURI)",
	"event PaymentChannelsOpened(uint256 indexed requestId, bytes32[] channelIds, uint256 totalAmount)",
	"event OffChainPaymentSigned(uint256 indexed requestId, address indexed agent, uint256 amount, bytes32 channelId, uint256 nonce)",
	"function payAgent(uint256 _requestId, address _agentWallet, uint256 _amount)",
	"function openPaymentChannels(uint256 _requestId, uint256 _timeout) external returns (bytes32[] memory channelIds)",
	"function recordOffChainPayment(uint256 _requestId, address _agent, uint256 _amount, bytes32 _channelId, uint256 _nonce) external",
	"function defineAP2Flow(uint256 _requestId, string calldata _ap2Nonce, string calldata _receiptURI, string calldata _callbackURI, string calldata _metadataURI)",
	"function defineX402Challenge(uint256 _requestId, string calldata _challengeURI)",
	"function setMCPContext(uint256 _requestId, string calldata _contextURI)",
	"function requests(uint256) view returns (address user, string prompt, bool isComplete, uint256 amountPaid, bytes32[] channelIds, bool channelsOpened)",
	"function requestFlows(uint256) view returns (string metadataURI, string ap2Nonce, string receiptURI, string callbackURI, string x402ChallengeURI, string mcpContextURI)",
	"function getRequestChannels(uint256 _requestId) external view returns (bytes32[] memory)",
	"function scriptAgentWallet() view returns (address)",
	"function soundAgentWallet() view returns (address)",
	"function videoAgentWallet() view returns (address)",
	"function getChainId() view returns (uint256)",
];

let provider, signer, contract;

async function initContract() {
	provider = new ethers.JsonRpcProvider(config.rpcUrl);

	// Enable polling for event detection (critical for HTTP providers)
	provider.pollingInterval = 4000; // Poll every 4 seconds

	signer = new ethers.Wallet(config.privateKey, provider);
	contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, signer);

	console.log("✅ Contract initialized");
	console.log("   Address:", config.contractAddress);
	console.log("   Polling Interval:", provider.pollingInterval, "ms");

	try {
		const network = await provider.getNetwork();
		console.log("   Chain ID:", network.chainId.toString());
	} catch (error) {
		console.log("   Chain ID: (unable to fetch)");
	}

	return { provider, signer, contract };
}

function getContract() {
	if (!contract) {
		initContract();
	}
	return contract;
}

async function getProvider() {
	if (!provider) {
		initContract();
	}
	return provider;
}

async function getSigner() {
	if (!signer) {
		initContract();
	}
	return signer;
}

async function payAgent(requestId, agentWallet, amount) {
	const tx = await contract.payAgent(requestId, agentWallet, amount);
	await tx.wait();
	return tx.hash;
}

async function defineAP2Flow(requestId, ap2Nonce, receiptURI, callbackURI, metadataURI) {
	const tx = await contract.defineAP2Flow(requestId, ap2Nonce, receiptURI, callbackURI, metadataURI);
	await tx.wait();
	return tx.hash;
}

async function defineX402Challenge(requestId, challengeURI) {
	const tx = await contract.defineX402Challenge(requestId, challengeURI);
	await tx.wait();
	return tx.hash;
}

async function setMCPContext(requestId, contextURI) {
	const tx = await contract.setMCPContext(requestId, contextURI);
	await tx.wait();
	return tx.hash;
}

async function getRequest(requestId) {
	return await contract.requests(requestId);
}

async function getFlowData(requestId) {
	return await contract.requestFlows(requestId);
}

async function openPaymentChannels(requestId, timeout) {
	const tx = await contract.openPaymentChannels(requestId, timeout);
	const receipt = await tx.wait();

	// Extract channel IDs from the event
	const event = receipt.logs.find((log) => {
		try {
			const parsed = contract.interface.parseLog(log);
			return parsed.name === "PaymentChannelsOpened";
		} catch {
			return false;
		}
	});

	let channelIds = [];
	if (event) {
		const parsed = contract.interface.parseLog(event);
		channelIds = parsed.args.channelIds;
	}

	return { txHash: tx.hash, channelIds };
}

async function recordOffChainPayment(requestId, agentAddress, amount, channelId, nonce) {
	const tx = await contract.recordOffChainPayment(requestId, agentAddress, amount, channelId, nonce);
	await tx.wait();
	return tx.hash;
}

async function getRequestChannels(requestId) {
	return await contract.getRequestChannels(requestId);
}

module.exports = {
	initContract,
	getContract,
	getProvider,
	getSigner,
	payAgent,
	openPaymentChannels,
	recordOffChainPayment,
	defineAP2Flow,
	defineX402Challenge,
	setMCPContext,
	getRequest,
	getFlowData,
	getRequestChannels,
};

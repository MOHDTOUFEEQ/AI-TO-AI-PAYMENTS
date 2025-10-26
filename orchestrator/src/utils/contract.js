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

// Nonce management
let currentNonce = null;
let noncePromise = null;

/**
 * Get and manage transaction nonce to prevent conflicts
 * This ensures sequential nonces even when sending multiple transactions rapidly
 */
async function getNonce(forceRefresh = false) {
	if (!signer) {
		await initContract();
	}

	// If we're forcing a refresh or don't have a nonce yet, fetch from network
	if (forceRefresh || currentNonce === null) {
		// If there's already a pending nonce fetch, wait for it
		if (noncePromise) {
			await noncePromise;
		}

		// Fetch the current nonce from the network
		noncePromise = provider.getTransactionCount(await signer.getAddress(), "pending");
		currentNonce = await noncePromise;
		noncePromise = null;

		console.log(`🔢 Fetched fresh nonce: ${currentNonce}`);
	}

	// Return current nonce and increment for next use
	const nonce = currentNonce;
	currentNonce++;

	return nonce;
}

/**
 * Reset nonce (call this if a transaction fails and you need to retry)
 */
async function resetNonce() {
	console.log("🔄 Resetting nonce...");
	currentNonce = null;
	noncePromise = null;
	await getNonce(true);
}

/**
 * Execute transaction with automatic nonce retry on failure
 * @param {Function} txFunction - Function that returns a transaction promise
 * @param {string} txName - Name of the transaction for logging
 * @param {number} maxRetries - Maximum number of retry attempts
 */
async function executeWithRetry(txFunction, txName, maxRetries = 2) {
	let lastError;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			if (attempt > 0) {
				console.log(`   🔄 Retry attempt ${attempt}/${maxRetries} for ${txName}`);
				await resetNonce();
			}

			return await txFunction();
		} catch (error) {
			lastError = error;

			// Check if it's a nonce-related error
			const errorMessage = error.message || "";
			const isNonceError = errorMessage.includes("nonce") || errorMessage.includes("NONCE_EXPIRED") || error.code === "NONCE_EXPIRED" || (error.info && error.info.error && error.info.error.message && error.info.error.message.includes("nonce"));

			if (isNonceError && attempt < maxRetries) {
				console.log(`   ⚠️  Nonce error detected in ${txName}, retrying...`);
				continue;
			}

			// If it's not a nonce error or we've exhausted retries, throw
			throw error;
		}
	}

	throw lastError;
}

async function initContract() {
	provider = new ethers.JsonRpcProvider(config.rpcUrl);

	// Enable polling for event detection (critical for HTTP providers)
	provider.pollingInterval = 4000; // Poll every 4 seconds

	signer = new ethers.Wallet(config.privateKey, provider);
	contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, signer);

	// Reset nonce on init
	currentNonce = null;
	noncePromise = null;

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
	return executeWithRetry(async () => {
		const nonce = await getNonce();
		console.log(`   📤 Sending payAgent tx with nonce ${nonce}`);
		const tx = await contract.payAgent(requestId, agentWallet, amount, { nonce });
		await tx.wait();
		return tx.hash;
	}, "payAgent");
}

async function defineAP2Flow(requestId, ap2Nonce, receiptURI, callbackURI, metadataURI) {
	return executeWithRetry(async () => {
		const nonce = await getNonce();
		console.log(`   📤 Sending defineAP2Flow tx with nonce ${nonce}`);
		const tx = await contract.defineAP2Flow(requestId, ap2Nonce, receiptURI, callbackURI, metadataURI, { nonce });
		await tx.wait();
		return tx.hash;
	}, "defineAP2Flow");
}

async function defineX402Challenge(requestId, challengeURI) {
	return executeWithRetry(async () => {
		const nonce = await getNonce();
		console.log(`   📤 Sending defineX402Challenge tx with nonce ${nonce}`);
		const tx = await contract.defineX402Challenge(requestId, challengeURI, { nonce });
		await tx.wait();
		return tx.hash;
	}, "defineX402Challenge");
}

async function setMCPContext(requestId, contextURI) {
	return executeWithRetry(async () => {
		const nonce = await getNonce();
		console.log(`   📤 Sending setMCPContext tx with nonce ${nonce}`);
		const tx = await contract.setMCPContext(requestId, contextURI, { nonce });
		await tx.wait();
		return tx.hash;
	}, "setMCPContext");
}

async function getRequest(requestId) {
	return await contract.requests(requestId);
}

async function getFlowData(requestId) {
	return await contract.requestFlows(requestId);
}

async function openPaymentChannels(requestId, timeout) {
	return executeWithRetry(async () => {
		const nonce = await getNonce();
		console.log(`   📤 Sending openPaymentChannels tx with nonce ${nonce}`);
		const tx = await contract.openPaymentChannels(requestId, timeout, { nonce });
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
	}, "openPaymentChannels");
}

async function recordOffChainPayment(requestId, agentAddress, amount, channelId, paymentNonce) {
	return executeWithRetry(async () => {
		const txNonce = await getNonce();
		console.log(`   📤 Sending recordOffChainPayment tx with nonce ${txNonce} (payment nonce: ${paymentNonce})`);
		const tx = await contract.recordOffChainPayment(requestId, agentAddress, amount, channelId, paymentNonce, { nonce: txNonce });
		await tx.wait();
		return tx.hash;
	}, "recordOffChainPayment");
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
	getNonce,
	resetNonce,
};

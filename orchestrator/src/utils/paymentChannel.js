const { ethers } = require("ethers");
const config = require("../config");

/**
 * Payment Channel Utilities
 *
 * Handles off-chain payment signatures for gas-efficient micro-transactions
 *
 * Flow:
 * 1. Open channel: Lock funds on-chain
 * 2. Sign payment: Create off-chain signature for each agent payment (0 gas)
 * 3. Close channel: Agent submits signature on-chain to claim funds
 */

// Payment Channel Contract ABI
const PAYMENT_CHANNEL_ABI = [
	"function openChannel(uint256 _requestId, address _payee, uint256 _timeout) external payable returns (bytes32 channelId)",
	"function closeChannel(bytes32 _channelId, uint256 _amount, uint256 _nonce, bytes memory _signature) external",
	"function emergencyClose(bytes32 _channelId) external",
	"function verifySignature(bytes32 _channelId, uint256 _amount, uint256 _nonce, bytes memory _signature) external view returns (bool)",
	"function getChannel(bytes32 _channelId) external view returns (tuple(uint256 requestId, address payer, address payee, uint256 totalDeposit, uint256 withdrawn, uint256 nonce, bool isOpen, uint256 openedAt, uint256 timeout))",
	"function getChannelId(uint256 _requestId, address _agent) external view returns (bytes32)",
	"event ChannelOpened(bytes32 indexed channelId, uint256 indexed requestId, address indexed payer, address payee, uint256 amount, uint256 timeout)",
	"event ChannelClosed(bytes32 indexed channelId, uint256 indexed requestId, address indexed payee, uint256 finalAmount, uint256 refunded)",
];

let paymentChannelContract;

/**
 * Initialize payment channel contract instance
 */
function initPaymentChannel(signer) {
	if (!config.paymentChannelAddress) {
		throw new Error("Payment channel contract address not configured");
	}

	paymentChannelContract = new ethers.Contract(config.paymentChannelAddress, PAYMENT_CHANNEL_ABI, signer);

	console.log("✅ Payment Channel contract initialized");
	console.log("   Address:", config.paymentChannelAddress);

	return paymentChannelContract;
}

/**
 * Get payment channel contract instance
 */
function getPaymentChannel() {
	if (!paymentChannelContract) {
		throw new Error("Payment channel contract not initialized. Call initPaymentChannel first.");
	}
	return paymentChannelContract;
}

/**
 * Sign an off-chain payment message
 *
 * This creates a signature that can be verified on-chain without gas costs.
 * The signature authorizes a specific amount to be paid to an agent.
 *
 * @param {string} channelId - The payment channel ID (bytes32)
 * @param {string} requestId - The video request ID
 * @param {string} agentAddress - The agent's wallet address
 * @param {BigInt} amount - The amount to pay (in wei)
 * @param {number} nonce - Nonce for replay protection
 * @param {ethers.Wallet} signer - The wallet signing the message
 * @returns {Promise<string>} The signature
 */
async function signPaymentMessage(channelId, requestId, agentAddress, amount, nonce, signer) {
	// Create the message hash (must match contract's message hash)
	const messageHash = ethers.solidityPackedKeccak256(["bytes32", "uint256", "address", "uint256", "uint256"], [channelId, requestId, agentAddress, amount, nonce]);

	// Sign the message hash
	const signature = await signer.signMessage(ethers.getBytes(messageHash));

	console.log("✍️  Signed off-chain payment message");
	console.log("   Channel ID:", channelId);
	console.log("   Agent:", agentAddress);
	console.log("   Amount:", ethers.formatEther(amount), "ETH");
	console.log("   Nonce:", nonce);
	console.log("   Signature:", signature);

	return signature;
}

/**
 * Verify an off-chain payment signature
 *
 * @param {string} channelId - The payment channel ID
 * @param {BigInt} amount - The amount in the signature
 * @param {number} nonce - The nonce in the signature
 * @param {string} signature - The signature to verify
 * @returns {Promise<boolean>} True if signature is valid
 */
async function verifyPaymentSignature(channelId, amount, nonce, signature) {
	const channel = getPaymentChannel();
	const isValid = await channel.verifySignature(channelId, amount, nonce, signature);

	console.log("🔍 Signature verification:", isValid ? "✅ VALID" : "❌ INVALID");

	return isValid;
}

/**
 * Get channel information
 *
 * @param {string} channelId - The payment channel ID
 * @returns {Promise<object>} Channel details
 */
async function getChannelInfo(channelId) {
	const channel = getPaymentChannel();
	const info = await channel.getChannel(channelId);

	return {
		requestId: info.requestId.toString(),
		payer: info.payer,
		payee: info.payee,
		totalDeposit: info.totalDeposit,
		withdrawn: info.withdrawn,
		nonce: info.nonce,
		isOpen: info.isOpen,
		openedAt: info.openedAt,
		timeout: info.timeout,
	};
}

/**
 * Get channel ID for a request and agent
 *
 * @param {string} requestId - The request ID
 * @param {string} agentAddress - The agent's address
 * @returns {Promise<string>} The channel ID
 */
async function getChannelId(requestId, agentAddress) {
	const channel = getPaymentChannel();
	return await channel.getChannelId(requestId, agentAddress);
}

/**
 * Close a payment channel (on-chain transaction)
 *
 * This is called by the agent to claim their funds using the signed message.
 *
 * @param {string} channelId - The payment channel ID
 * @param {BigInt} finalAmount - The final amount to claim
 * @param {number} nonce - The nonce from the signed message
 * @param {string} signature - The signature authorizing the payment
 * @param {ethers.Wallet} signer - The wallet closing the channel (usually agent)
 * @returns {Promise<string>} Transaction hash
 */
async function closeChannel(channelId, finalAmount, nonce, signature, signer) {
	const channel = new ethers.Contract(config.paymentChannelAddress, PAYMENT_CHANNEL_ABI, signer);

	console.log("\n💰 CLOSING PAYMENT CHANNEL");
	console.log("==========================");
	console.log("   Channel ID:", channelId);
	console.log("   Final Amount:", ethers.formatEther(finalAmount), "ETH");
	console.log("   Nonce:", nonce);

	const tx = await channel.closeChannel(channelId, finalAmount, nonce, signature);
	console.log("   Transaction sent:", tx.hash);

	const receipt = await tx.wait();
	console.log("   ✅ Channel closed successfully!");
	console.log("   Gas used:", receipt.gasUsed.toString());

	return tx.hash;
}

/**
 * Emergency close channel (after timeout)
 *
 * @param {string} channelId - The payment channel ID
 * @param {ethers.Wallet} agentSigner - The agent's wallet
 * @returns {Promise<string>} Transaction hash
 */
async function emergencyCloseChannel(channelId, agentSigner) {
	const channel = new ethers.Contract(config.paymentChannelAddress, PAYMENT_CHANNEL_ABI, agentSigner);

	console.log("\n⚠️  EMERGENCY CLOSING CHANNEL");
	console.log("============================");
	console.log("   Channel ID:", channelId);

	const tx = await channel.emergencyClose(channelId);
	console.log("   Transaction sent:", tx.hash);

	const receipt = await tx.wait();
	console.log("   ✅ Emergency closure complete!");

	return tx.hash;
}

/**
 * Create off-chain payment record (for tracking)
 *
 * This doesn't execute on-chain, just returns the payment data structure.
 *
 * @param {string} channelId - The payment channel ID
 * @param {string} requestId - The request ID
 * @param {string} agentAddress - The agent's address
 * @param {BigInt} amount - The payment amount
 * @param {number} nonce - The nonce
 * @param {string} signature - The signature
 * @returns {object} Payment record
 */
function createPaymentRecord(channelId, requestId, agentAddress, amount, nonce, signature) {
	return {
		channelId,
		requestId,
		agent: agentAddress,
		amount: amount.toString(),
		amountETH: ethers.formatEther(amount),
		nonce,
		signature,
		timestamp: new Date().toISOString(),
		status: "signed",
	};
}

module.exports = {
	initPaymentChannel,
	getPaymentChannel,
	signPaymentMessage,
	verifyPaymentSignature,
	getChannelInfo,
	getChannelId,
	closeChannel,
	emergencyCloseChannel,
	createPaymentRecord,
};

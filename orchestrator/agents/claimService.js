const { ethers } = require("ethers");
const axios = require("axios");

/**
 * Agent Claim Service
 *
 * This service allows agents to claim their payments from payment channels.
 * Agents retrieve their signed payment message and close the channel to receive funds.
 *
 * Usage:
 *   node claimService.js <requestId> <agentType> <agentPrivateKey>
 *
 * Example:
 *   node claimService.js 1 script 0x1234...
 */

// Payment Channel ABI
const PAYMENT_CHANNEL_ABI = ["function closeChannel(bytes32 _channelId, uint256 _amount, uint256 _nonce, bytes memory _signature) external", "function getChannel(bytes32 _channelId) external view returns (tuple(uint256 requestId, address payer, address payee, uint256 totalDeposit, uint256 withdrawn, uint256 nonce, bool isOpen, uint256 openedAt, uint256 timeout))", "event ChannelClosed(bytes32 indexed channelId, uint256 indexed requestId, address indexed payee, uint256 finalAmount, uint256 refunded)"];

/**
 * Claim payment from a payment channel
 *
 * @param {string} requestId - The video request ID
 * @param {string} agentType - The agent type (script, sound, or video)
 * @param {string} agentPrivateKey - The agent's private key
 * @param {string} rpcUrl - The RPC URL
 * @param {string} paymentChannelAddress - The payment channel contract address
 * @param {string} orchestratorUrl - The orchestrator API URL
 */
async function claimPayment(requestId, agentType, agentPrivateKey, rpcUrl, paymentChannelAddress, orchestratorUrl) {
	console.log("\n💰 AGENT PAYMENT CLAIM SERVICE");
	console.log("=".repeat(80));
	console.log("   Request ID:", requestId);
	console.log("   Agent Type:", agentType);
	console.log("   Orchestrator:", orchestratorUrl);
	console.log("   Payment Channel Contract:", paymentChannelAddress);

	// Setup provider and signer
	const provider = new ethers.JsonRpcProvider(rpcUrl);
	const agentSigner = new ethers.Wallet(agentPrivateKey, provider);
	const agentAddress = await agentSigner.getAddress();

	console.log("   Agent Wallet:", agentAddress);

	// Get payment signature from orchestrator
	console.log("\n📥 STEP 1: Retrieving Payment Signature");
	console.log("-".repeat(80));

	const signatureUrl = `${orchestratorUrl}/api/payment-signature/${requestId}/${agentType}`;
	console.log("   Fetching from:", signatureUrl);

	let paymentData;
	try {
		const response = await axios.get(signatureUrl);
		paymentData = response.data.payment;

		console.log("   ✅ Payment signature retrieved!");
		console.log("   Channel ID:", paymentData.channelId);
		console.log("   Amount:", paymentData.amountETH, "ETH");
		console.log("   Nonce:", paymentData.nonce);
		console.log("   Signature:", paymentData.signature.substring(0, 20) + "...");
	} catch (error) {
		console.error("   ❌ Failed to retrieve payment signature");
		console.error("   Error:", error.message);

		if (error.response) {
			console.error("   Status:", error.response.status);
			console.error("   Response:", error.response.data);
		}

		throw error;
	}

	// Check channel status
	console.log("\n🔍 STEP 2: Checking Channel Status");
	console.log("-".repeat(80));

	const paymentChannelContract = new ethers.Contract(paymentChannelAddress, PAYMENT_CHANNEL_ABI, agentSigner);

	try {
		const channel = await paymentChannelContract.getChannel(paymentData.channelId);

		console.log("   Channel Info:");
		console.log("     Payer:", channel.payer);
		console.log("     Payee:", channel.payee);
		console.log("     Total Deposit:", ethers.formatEther(channel.totalDeposit), "ETH");
		console.log("     Withdrawn:", ethers.formatEther(channel.withdrawn), "ETH");
		console.log("     Is Open:", channel.isOpen);

		if (!channel.isOpen) {
			console.log("   ⚠️  Channel is already closed!");
			return { success: false, reason: "Channel already closed" };
		}

		if (channel.payee.toLowerCase() !== agentAddress.toLowerCase()) {
			console.log("   ❌ You are not the payee of this channel!");
			console.log("   Expected:", channel.payee);
			console.log("   Your address:", agentAddress);
			throw new Error("Not authorized to claim this payment");
		}

		console.log("   ✅ Channel is open and you are authorized!");
	} catch (error) {
		console.error("   ❌ Failed to check channel status");
		console.error("   Error:", error.message);
		throw error;
	}

	// Get balance before
	const balanceBefore = await provider.getBalance(agentAddress);
	console.log("   Current Balance:", ethers.formatEther(balanceBefore), "ETH");

	// Close channel and claim payment
	console.log("\n💸 STEP 3: Closing Channel and Claiming Payment");
	console.log("-".repeat(80));

	try {
		// Estimate gas
		const gasEstimate = await paymentChannelContract.closeChannel.estimateGas(paymentData.channelId, paymentData.amount, paymentData.nonce, paymentData.signature);

		console.log("   Estimated Gas:", gasEstimate.toString());

		// Close channel
		console.log("   📝 Sending transaction...");
		const tx = await paymentChannelContract.closeChannel(paymentData.channelId, paymentData.amount, paymentData.nonce, paymentData.signature);

		console.log("   Transaction Hash:", tx.hash);
		console.log("   ⏳ Waiting for confirmation...");

		const receipt = await tx.wait();

		console.log("   ✅ Transaction confirmed!");
		console.log("   Block:", receipt.blockNumber);
		console.log("   Gas Used:", receipt.gasUsed.toString());

		// Get balance after
		const balanceAfter = await provider.getBalance(agentAddress);
		const received = balanceAfter - balanceBefore + receipt.gasUsed * receipt.gasPrice;

		console.log("\n📊 PAYMENT SUMMARY");
		console.log("-".repeat(80));
		console.log("   Previous Balance:", ethers.formatEther(balanceBefore), "ETH");
		console.log("   New Balance:", ethers.formatEther(balanceAfter), "ETH");
		console.log("   Received (before gas):", ethers.formatEther(received), "ETH");
		console.log("   Gas Cost:", ethers.formatEther(receipt.gasUsed * receipt.gasPrice), "ETH");
		console.log("   Net Received:", ethers.formatEther(balanceAfter - balanceBefore), "ETH");

		console.log("\n" + "=".repeat(80));
		console.log("✅ PAYMENT CLAIMED SUCCESSFULLY!");
		console.log("=".repeat(80) + "\n");

		return {
			success: true,
			transactionHash: tx.hash,
			blockNumber: receipt.blockNumber,
			gasUsed: receipt.gasUsed.toString(),
			amountReceived: ethers.formatEther(received),
			netReceived: ethers.formatEther(balanceAfter - balanceBefore),
		};
	} catch (error) {
		console.error("   ❌ Failed to close channel");
		console.error("   Error:", error.message);

		if (error.data) {
			console.error("   Error Data:", error.data);
		}

		throw error;
	}
}

/**
 * CLI Interface
 */
async function main() {
	const args = process.argv.slice(2);

	if (args.length < 3) {
		console.log("\n📖 USAGE:");
		console.log("   node claimService.js <requestId> <agentType> <agentPrivateKey> [rpcUrl] [paymentChannelAddress] [orchestratorUrl]\n");
		console.log("ARGUMENTS:");
		console.log("   requestId           - The video request ID (required)");
		console.log("   agentType           - Agent type: script, sound, or video (required)");
		console.log("   agentPrivateKey     - Your agent wallet private key (required)");
		console.log("   rpcUrl              - RPC URL (optional, defaults to env var)");
		console.log("   paymentChannelAddress - Payment channel contract address (optional, defaults to env var)");
		console.log("   orchestratorUrl     - Orchestrator API URL (optional, defaults to env var)\n");
		console.log("EXAMPLE:");
		console.log('   node claimService.js 1 script "0x1234..." \\\n');
		console.log('     "https://sepolia-rollup.arbitrum.io/rpc" \\\n');
		console.log('     "0xPaymentChannelAddress" \\\n');
		console.log('     "http://localhost:3001"\n');
		process.exit(1);
	}

	const [requestId, agentType, agentPrivateKey, rpcUrl, paymentChannelAddress, orchestratorUrl] = args;

	// Validate agent type
	if (!["script", "sound", "video"].includes(agentType)) {
		console.error("❌ Invalid agent type. Must be: script, sound, or video");
		process.exit(1);
	}

	// Get config from env or args
	const config = {
		requestId,
		agentType,
		agentPrivateKey,
		rpcUrl: rpcUrl || process.env.ARBITRUM_SEPOLIA_RPC_URL || process.env.ARBITRUM_RPC_URL,
		paymentChannelAddress: paymentChannelAddress || process.env.PAYMENT_CHANNEL_ADDRESS,
		orchestratorUrl: orchestratorUrl || process.env.BASE_URL || "http://localhost:3001",
	};

	// Validate config
	if (!config.rpcUrl) {
		console.error("❌ RPC URL not provided. Set ARBITRUM_SEPOLIA_RPC_URL env var or pass as argument.");
		process.exit(1);
	}

	if (!config.paymentChannelAddress) {
		console.error("❌ Payment channel address not provided. Set PAYMENT_CHANNEL_ADDRESS env var or pass as argument.");
		process.exit(1);
	}

	try {
		await claimPayment(config.requestId, config.agentType, config.agentPrivateKey, config.rpcUrl, config.paymentChannelAddress, config.orchestratorUrl);
	} catch (error) {
		console.error("\n❌ CLAIM FAILED");
		console.error("Error:", error.message);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	main();
}

module.exports = { claimPayment };

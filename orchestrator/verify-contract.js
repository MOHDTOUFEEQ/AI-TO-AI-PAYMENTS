/**
 * Verify Contract
 * Check if the contract at the configured address is actually MediaFactory
 */

require("dotenv").config();
const { ethers } = require("ethers");

const CONTRACT_ADDRESS = process.env.MEDIA_FACTORY_ADDRESS;
const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;

const CONTRACT_ABI = ["function nextRequestId() view returns (uint256)", "function scriptAgentWallet() view returns (address)", "function soundAgentWallet() view returns (address)", "function videoAgentWallet() view returns (address)", "function paymentChannelContract() view returns (address)"];

async function verifyContract() {
	console.log("🔍 Verifying MediaFactory Contract\n");
	console.log("📋 Configuration:");
	console.log("   Contract:", CONTRACT_ADDRESS);
	console.log("   RPC URL:", RPC_URL);
	console.log();

	const provider = new ethers.JsonRpcProvider(RPC_URL);
	const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

	try {
		console.log("🔄 Checking contract functions...\n");

		const nextRequestId = await contract.nextRequestId();
		console.log("✅ nextRequestId:", nextRequestId.toString());

		const scriptAgent = await contract.scriptAgentWallet();
		console.log("✅ scriptAgentWallet:", scriptAgent);

		const soundAgent = await contract.soundAgentWallet();
		console.log("✅ soundAgentWallet:", soundAgent);

		const videoAgent = await contract.videoAgentWallet();
		console.log("✅ videoAgentWallet:", videoAgent);

		const paymentChannel = await contract.paymentChannelContract();
		console.log("✅ paymentChannelContract:", paymentChannel);

		console.log();
		console.log("=".repeat(80));
		console.log("✅ Contract is MediaFactory and is working correctly!");
		console.log("=".repeat(80));
		console.log();

		console.log("📊 Status:");
		console.log("   • Total requests so far:", nextRequestId.toString());
		console.log("   • Expected next request ID:", nextRequestId.toString());
		console.log();

		if (nextRequestId.toString() === "0") {
			console.log("⚠️  WARNING: No requests have been made yet!");
			console.log("   This means either:");
			console.log("   1. You haven't submitted a request to THIS contract");
			console.log("   2. Or the transaction failed/reverted");
			console.log();
		}
	} catch (error) {
		console.error();
		console.error("❌ Error calling contract functions:", error.message);
		console.error();
		console.error("This might mean:");
		console.error("   1. Wrong contract address");
		console.error("   2. Contract is not MediaFactory");
		console.error("   3. Network issues");
		console.error();
		process.exit(1);
	}

	process.exit(0);
}

verifyContract();

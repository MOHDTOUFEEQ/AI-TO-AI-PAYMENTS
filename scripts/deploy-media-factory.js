const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
	console.log("\n🚀 Deploying MediaFactory with Payment Channel Support...\n");

	// Get deployer account
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying with account:", deployer.address);

	// Get balance
	const balance = await hre.ethers.provider.getBalance(deployer.address);
	console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

	// Get agent wallets from .env
	const scriptAgent = process.env.SCRIPT_AGENT_WALLET;
	const soundAgent = process.env.SOUND_AGENT_WALLET;
	const videoAgent = process.env.VIDEO_AGENT_WALLET;
	const paymentChannelAddress = process.env.PAYMENT_CHANNEL_ADDRESS;

	// Validate required addresses
	if (!scriptAgent || !soundAgent || !videoAgent) {
		throw new Error("❌ Missing agent wallets in .env:\n" + "   SCRIPT_AGENT_WALLET\n" + "   SOUND_AGENT_WALLET\n" + "   VIDEO_AGENT_WALLET");
	}

	if (!paymentChannelAddress) {
		throw new Error("❌ PAYMENT_CHANNEL_ADDRESS not set in .env\n" + "   Please deploy PaymentChannel first:\n" + "   npx hardhat run scripts/deploy-payment-channel.js --network arbitrum-sepolia");
	}

	console.log("📋 Configuration:");
	console.log("   Script Agent:", scriptAgent);
	console.log("   Sound Agent:", soundAgent);
	console.log("   Video Agent:", videoAgent);
	console.log("   Payment Channel:", paymentChannelAddress);
	console.log();

	// Deploy MediaFactory
	console.log("📝 Deploying MediaFactory...");
	const MediaFactory = await hre.ethers.getContractFactory("MediaFactory");
	const mediaFactory = await MediaFactory.deploy(scriptAgent, soundAgent, videoAgent, paymentChannelAddress);

	await mediaFactory.waitForDeployment();

	const address = await mediaFactory.getAddress();
	console.log("✅ MediaFactory deployed to:", address);

	// Get deployment transaction
	const deployTx = mediaFactory.deploymentTransaction();
	console.log("   Transaction hash:", deployTx.hash);

	// Wait for confirmations
	console.log("   Waiting for confirmations...");
	await deployTx.wait(3);
	console.log("   ✅ Confirmed!\n");

	// Verify setup
	console.log("🔍 Verifying contract setup...");
	const scriptAgentCheck = await mediaFactory.scriptAgentWallet();
	const soundAgentCheck = await mediaFactory.soundAgentWallet();
	const videoAgentCheck = await mediaFactory.videoAgentWallet();
	const paymentChannelCheck = await mediaFactory.paymentChannelContract();

	console.log("   Script Agent:", scriptAgentCheck, scriptAgentCheck === scriptAgent ? "✅" : "❌");
	console.log("   Sound Agent:", soundAgentCheck, soundAgentCheck === soundAgent ? "✅" : "❌");
	console.log("   Video Agent:", videoAgentCheck, videoAgentCheck === videoAgent ? "✅" : "❌");
	console.log("   Payment Channel:", paymentChannelCheck, paymentChannelCheck === paymentChannelAddress ? "✅" : "❌");
	console.log();

	// Save deployment info
	const deploymentInfo = {
		network: hre.network.name,
		mediaFactoryAddress: address,
		paymentChannelAddress: paymentChannelAddress,
		scriptAgentWallet: scriptAgent,
		soundAgentWallet: soundAgent,
		videoAgentWallet: videoAgent,
		deployer: deployer.address,
		timestamp: new Date().toISOString(),
		blockNumber: deployTx.blockNumber,
		transactionHash: deployTx.hash,
	};

	const deploymentPath = path.join(__dirname, "..", "deployment-media-factory.json");
	fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
	console.log("📝 Deployment info saved to:", deploymentPath);

	// Instructions for next steps
	console.log("\n" + "=".repeat(80));
	console.log("✅ DEPLOYMENT SUCCESSFUL!");
	console.log("=".repeat(80));
	console.log("\n📋 NEXT STEPS:\n");

	console.log("1. Update .env file:");
	console.log(`   MEDIA_FACTORY_ADDRESS=${address}\n`);

	console.log("2. Update frontend app.js:");
	console.log(`   const CONTRACT_ADDRESS = "${address}";\n`);

	console.log("3. Update orchestrator config (if needed):");
	console.log("   Verify config.js has correct MEDIA_FACTORY_ADDRESS\n");

	console.log("4. Verify contract on block explorer:");
	console.log(`   npx hardhat verify --network ${hre.network.name} ${address} \\\n` + `     "${scriptAgent}" \\\n` + `     "${soundAgent}" \\\n` + `     "${videoAgent}" \\\n` + `     "${paymentChannelAddress}"\n`);

	console.log("5. Test the system:");
	console.log("   a. Start orchestrator: cd orchestrator && npm start");
	console.log("   b. Open frontend and submit a test request");
	console.log("   c. Verify payment channels are opened\n");

	console.log("=".repeat(80) + "\n");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ DEPLOYMENT FAILED");
		console.error(error);
		process.exit(1);
	});

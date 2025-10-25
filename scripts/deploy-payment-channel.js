const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
	console.log("\n🚀 Deploying PaymentChannel Contract...\n");

	// Get deployer account
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying with account:", deployer.address);

	// Get balance
	const balance = await hre.ethers.provider.getBalance(deployer.address);
	console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

	// Deploy PaymentChannel
	console.log("📝 Deploying PaymentChannel...");
	const PaymentChannel = await hre.ethers.getContractFactory("PaymentChannel");
	const paymentChannel = await PaymentChannel.deploy();

	await paymentChannel.waitForDeployment();

	const paymentChannelAddress = await paymentChannel.getAddress();
	console.log("✅ PaymentChannel deployed to:", paymentChannelAddress);

	// Get deployment transaction
	const deployTx = paymentChannel.deploymentTransaction();
	console.log("   Transaction hash:", deployTx.hash);

	// Wait for confirmations
	console.log("   Waiting for confirmations...");
	await deployTx.wait(3);
	console.log("   ✅ Confirmed!\n");

	// Save deployment info
	const deploymentInfo = {
		network: hre.network.name,
		paymentChannelAddress: paymentChannelAddress,
		deployer: deployer.address,
		timestamp: new Date().toISOString(),
		blockNumber: deployTx.blockNumber,
		transactionHash: deployTx.hash,
	};

	const deploymentPath = path.join(__dirname, "..", "deployment-payment-channel.json");
	fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
	console.log("📝 Deployment info saved to:", deploymentPath);

	// Instructions for next steps
	console.log("\n" + "=".repeat(80));
	console.log("✅ DEPLOYMENT SUCCESSFUL!");
	console.log("=".repeat(80));
	console.log("\n📋 NEXT STEPS:\n");
	console.log("1. Update .env file:");
	console.log(`   PAYMENT_CHANNEL_ADDRESS=${paymentChannelAddress}\n`);

	console.log("2. Update MediaFactory contract:");
	console.log("   Option A: Redeploy MediaFactory with new PaymentChannel address");
	console.log("   Option B: Call setPaymentChannelContract() on existing MediaFactory\n");

	console.log("3. Verify contract on block explorer:");
	console.log(`   npx hardhat verify --network ${hre.network.name} ${paymentChannelAddress}\n`);

	console.log("4. Test the payment channel:");
	console.log(`   node scripts/test-payment-channel.js ${paymentChannelAddress}\n`);

	console.log("=".repeat(80) + "\n");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

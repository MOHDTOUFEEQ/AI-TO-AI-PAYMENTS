const hre = require("hardhat");

async function main() {
	console.log("🚀 Deploying PaymentContract...");

	const PaymentContract = await hre.ethers.getContractFactory("PaymentContract");
	const paymentContract = await PaymentContract.deploy();

	await paymentContract.waitForDeployment();

	const address = await paymentContract.getAddress();
	console.log("✅ PaymentContract deployed to:", address);
	console.log("📝 Add this to your .env file:");
	console.log(`PAYMENT_CONTRACT_ADDRESS=${address}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

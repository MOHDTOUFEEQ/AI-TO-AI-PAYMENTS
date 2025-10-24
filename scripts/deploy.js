const hre = require("hardhat");
require("dotenv").config();

async function main() {
	console.log("🚀 Deploying MediaFactory...");

	const scriptAgent = process.env.SCRIPT_AGENT_WALLET;
	const soundAgent = process.env.SOUND_AGENT_WALLET;
	const videoAgent = process.env.VIDEO_AGENT_WALLET;

	if (!scriptAgent || !soundAgent || !videoAgent) {
		throw new Error("SCRIPT_AGENT_WALLET, SOUND_AGENT_WALLET, and VIDEO_AGENT_WALLET must be set in .env");
	}

	const MediaFactory = await hre.ethers.getContractFactory("MediaFactory");
	const mediaFactory = await MediaFactory.deploy(scriptAgent, soundAgent, videoAgent);

	await mediaFactory.waitForDeployment();

	const address = await mediaFactory.getAddress();
	console.log("✅ MediaFactory deployed to:", address);
	console.log("🌐 Network chainId:", (await hre.ethers.provider.getNetwork()).chainId);
	console.log("📝 Add this to your .env file:");
	console.log(`MEDIA_FACTORY_ADDRESS=${address}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

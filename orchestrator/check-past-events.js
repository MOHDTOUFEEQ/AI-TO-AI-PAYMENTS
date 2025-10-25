/**
 * Check Past Events
 * This script queries for recent VideoRequested events to verify they exist
 */

require("dotenv").config();
const { ethers } = require("ethers");

const CONTRACT_ADDRESS = process.env.MEDIA_FACTORY_ADDRESS;
const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;

const CONTRACT_ABI = ["event VideoRequested(uint256 indexed requestId, address indexed user, string prompt)"];

async function checkPastEvents() {
	console.log("🔍 Checking for Past VideoRequested Events\n");
	console.log("📋 Configuration:");
	console.log("   Contract:", CONTRACT_ADDRESS);
	console.log("   RPC URL:", RPC_URL);
	console.log();

	const provider = new ethers.JsonRpcProvider(RPC_URL);
	const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

	try {
		const currentBlock = await provider.getBlockNumber();
		console.log("📦 Current block:", currentBlock);
		console.log();

		// Query last 1000 blocks (split into chunks of 10 for free tier)
		console.log("🔍 Querying events in chunks...\n");

		let allEvents = [];
		const chunkSize = 10;
		const totalBlocks = 100; // Check last 100 blocks

		for (let i = 0; i < totalBlocks; i += chunkSize) {
			const fromBlock = currentBlock - totalBlocks + i;
			const toBlock = Math.min(fromBlock + chunkSize - 1, currentBlock);

			try {
				console.log(`   Checking blocks ${fromBlock} to ${toBlock}...`);
				const filter = contract.filters.VideoRequested();
				const events = await contract.queryFilter(filter, fromBlock, toBlock);

				if (events.length > 0) {
					console.log(`   ✅ Found ${events.length} event(s)!`);
					allEvents.push(...events);
				}
			} catch (error) {
				console.log(`   ⚠️  Could not query blocks ${fromBlock}-${toBlock}: ${error.message}`);
			}
		}

		console.log();
		console.log("=".repeat(80));

		if (allEvents.length > 0) {
			console.log(`\n✅ FOUND ${allEvents.length} VideoRequested EVENT(S):\n`);

			allEvents.forEach((event, index) => {
				console.log(`Event #${index + 1}:`);
				console.log("   Request ID:", event.args.requestId.toString());
				console.log("   User:", event.args.user);
				console.log("   Prompt:", event.args.prompt);
				console.log("   Block:", event.blockNumber);
				console.log("   Transaction:", event.transactionHash);
				console.log();
			});

			console.log("🎉 Events ARE being emitted! The issue is with real-time listening.\n");
		} else {
			console.log("\n❌ NO VideoRequested events found in the last 100 blocks.");
			console.log("\nPossible reasons:");
			console.log("   1. Transaction might have failed/reverted");
			console.log("   2. Wrong contract address");
			console.log("   3. Transaction is very old (>100 blocks ago)");
			console.log("   4. Event name mismatch\n");
		}

		console.log("=".repeat(80));
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}

	process.exit(0);
}

checkPastEvents();

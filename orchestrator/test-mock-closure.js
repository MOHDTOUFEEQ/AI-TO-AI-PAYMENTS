/**
 * Test Mock Channel Closure
 *
 * This script tests the mock channel closure functionality without needing
 * a real blockchain connection or video request.
 */

const { mockCloseAllChannels, getAllBalances, initializeMockBalances } = require("./src/services/mockChannelClosure.js");
const { ethers } = require("ethers");

async function testMockClosure() {
	console.log("\n" + "=".repeat(80));
	console.log("TESTING MOCK CHANNEL CLOSURE FUNCTIONALITY");
	console.log("=".repeat(80) + "\n");

	// Initialize balances
	console.log("📊 Initializing mock balances...\n");
	initializeMockBalances();

	// Show initial balances
	console.log("📈 Initial Agent Balances:");
	const initialBalances = getAllBalances();
	console.log("   • Script Agent:", initialBalances.script, "ETH");
	console.log("   • Sound Agent:", initialBalances.sound, "ETH");
	console.log("   • Video Agent:", initialBalances.video, "ETH");
	console.log();

	// Create mock payment channels (simulating what would come from videoProcessor)
	const paymentChannels = {
		script: {
			channelId: ethers.keccak256(ethers.toUtf8Bytes("test-script-channel-1")),
			amount: "0.00003",
			signature: ethers.keccak256(ethers.toUtf8Bytes("test-script-sig-1")),
		},
		sound: {
			channelId: ethers.keccak256(ethers.toUtf8Bytes("test-sound-channel-1")),
			amount: "0.00003",
			signature: ethers.keccak256(ethers.toUtf8Bytes("test-sound-sig-1")),
		},
		video: {
			channelId: ethers.keccak256(ethers.toUtf8Bytes("test-video-channel-1")),
			amount: "0.00004",
			signature: ethers.keccak256(ethers.toUtf8Bytes("test-video-sig-1")),
		},
	};

	console.log("💳 Mock Payment Channels Created:");
	console.log("   • Script Channel:", paymentChannels.script.channelId.substring(0, 20) + "...");
	console.log("   • Sound Channel:", paymentChannels.sound.channelId.substring(0, 20) + "...");
	console.log("   • Video Channel:", paymentChannels.video.channelId.substring(0, 20) + "...");
	console.log();

	console.log("⏳ Starting mock closure in 2 seconds...\n");
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Run mock closure
	try {
		const results = await mockCloseAllChannels(paymentChannels);

		// Show final balances
		console.log("\n\n📊 FINAL VERIFICATION:");
		console.log("=".repeat(80));

		const finalBalances = getAllBalances();
		console.log("\n✅ Final Agent Balances:");
		console.log("   • Script Agent:", finalBalances.script, "ETH");
		console.log("   • Sound Agent:", finalBalances.sound, "ETH");
		console.log("   • Video Agent:", finalBalances.video, "ETH");

		console.log("\n📈 Balance Changes:");
		console.log("   • Script Agent: +" + (parseFloat(finalBalances.script) - parseFloat(initialBalances.script)).toFixed(18) + " ETH");
		console.log("   • Sound Agent: +" + (parseFloat(finalBalances.sound) - parseFloat(initialBalances.sound)).toFixed(18) + " ETH");
		console.log("   • Video Agent: +" + (parseFloat(finalBalances.video) - parseFloat(initialBalances.video)).toFixed(18) + " ETH");

		console.log("\n✅ All closures completed successfully!");
		console.log("\n" + "=".repeat(80));
		console.log("TEST PASSED ✓");
		console.log("=".repeat(80) + "\n");

		return results;
	} catch (error) {
		console.error("\n❌ TEST FAILED");
		console.error("Error:", error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

// Run the test
if (require.main === module) {
	testMockClosure()
		.then(() => {
			console.log("✅ Test completed successfully!\n");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Test failed:", error);
			process.exit(1);
		});
}

module.exports = { testMockClosure };

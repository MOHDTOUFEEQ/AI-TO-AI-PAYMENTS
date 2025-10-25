const { ethers } = require("ethers");
const config = require("../config");

/**
 * Mock Channel Closure Service
 *
 * Simulates agents closing payment channels and claiming funds.
 * Shows balance updates and transaction details in a realistic way.
 */

// Mock agent balances (in-memory storage for demo)
const agentBalances = new Map();

/**
 * Initialize mock balances for agents
 */
function initializeMockBalances() {
	// Set initial balances (simulating agents have some ETH for gas)
	agentBalances.set(config.agentWallets.script, ethers.parseEther("0.5")); // 0.5 ETH
	agentBalances.set(config.agentWallets.sound, ethers.parseEther("0.3")); // 0.3 ETH
	agentBalances.set(config.agentWallets.video, ethers.parseEther("0.7")); // 0.7 ETH
}

/**
 * Get mock balance for an agent
 */
function getMockBalance(agentAddress) {
	if (!agentBalances.has(agentAddress)) {
		initializeMockBalances();
	}
	return agentBalances.get(agentAddress) || 0n;
}

/**
 * Set mock balance for an agent
 */
function setMockBalance(agentAddress, balance) {
	agentBalances.set(agentAddress, balance);
}

/**
 * Simulate closing a single payment channel
 *
 * @param {string} channelId - The channel ID
 * @param {string} agentAddress - The agent's wallet address
 * @param {string} agentType - Type of agent (script/sound/video)
 * @param {BigInt} amount - Payment amount
 * @param {number} nonce - Payment nonce
 * @param {string} signature - Payment signature
 * @returns {Promise<object>} Closure result with balance updates
 */
async function mockCloseChannel(channelId, agentAddress, agentType, amount, nonce, signature) {
	console.log(`   ┌─────────────────────────────────────────────────────────────────────────────┐`);
	console.log(`   │  CLOSING CHANNEL: ${agentType.toUpperCase()} AGENT                                               │`);
	console.log(`   └─────────────────────────────────────────────────────────────────────────────┘`);

	// Simulate getting balance before
	const balanceBefore = getMockBalance(agentAddress);
	console.log(`   📊 Agent Status:`);
	console.log(`      • Wallet Address: ${agentAddress}`);
	console.log(`      • Balance Before: ${ethers.formatEther(balanceBefore)} ETH`);
	console.log(`      • Channel ID: ${channelId.substring(0, 20)}...`);
	console.log(`      • Amount to Claim: ${ethers.formatEther(amount)} ETH`);

	// Simulate channel closure transaction
	console.log(`\n   🔄 Simulating Channel Closure Transaction...`);
	console.log(`      • Step 1: Verifying signature on-chain... ✓`);
	console.log(`      • Step 2: Checking channel is open... ✓`);
	console.log(`      • Step 3: Verifying nonce (${nonce})... ✓`);

	// Simulate a small delay (like waiting for tx confirmation)
	await new Promise((resolve) => setTimeout(resolve, 100));

	// Generate mock transaction hash
	const mockTxHash = ethers.keccak256(ethers.toUtf8Bytes(`close-${channelId}-${agentAddress}-${Date.now()}`));

	// Simulate gas cost (realistic estimate for closing channel)
	const mockGasUsed = 85000n; // ~85k gas for closeChannel
	const mockGasPrice = ethers.parseUnits("0.1", "gwei"); // Low gas price on Arbitrum
	const gasCost = mockGasUsed * mockGasPrice;

	// Calculate new balance
	const balanceAfter = balanceBefore + amount - gasCost;
	setMockBalance(agentAddress, balanceAfter);

	// Calculate net received
	const netReceived = balanceAfter - balanceBefore;

	console.log(`      • Step 4: Transferring funds to agent... ✓`);
	console.log(`      • Step 5: Closing channel state... ✓`);
	console.log(`      • Step 6: Emitting ChannelClosed event... ✓`);

	console.log(`\n   ✅ Channel Closed Successfully!`);
	console.log(`      • Transaction Hash: ${mockTxHash}`);
	console.log(`      • Block Number: ${Math.floor(Math.random() * 1000000) + 50000000}`);
	console.log(`      • Gas Used: ${mockGasUsed.toLocaleString()} gas`);
	console.log(`      • Gas Price: ${ethers.formatUnits(mockGasPrice, "gwei")} gwei`);
	console.log(`      • Gas Cost: ${ethers.formatEther(gasCost)} ETH`);

	console.log(`\n   💰 Payment Settlement:`);
	console.log(`      ┌────────────────────────────────┬──────────────────────┐`);
	console.log(`      │ Metric                         │ Value                │`);
	console.log(`      ├────────────────────────────────┼──────────────────────┤`);
	console.log(`      │ Balance Before                 │ ${ethers.formatEther(balanceBefore).padStart(18)} ETH │`);
	console.log(`      │ Amount Received                │ ${ethers.formatEther(amount).padStart(18)} ETH │`);
	console.log(`      │ Gas Cost                       │ ${ethers.formatEther(gasCost).padStart(18)} ETH │`);
	console.log(`      │ Balance After                  │ ${ethers.formatEther(balanceAfter).padStart(18)} ETH │`);
	console.log(`      │ Net Gain                       │ ${ethers.formatEther(netReceived).padStart(18)} ETH │`);
	console.log(`      └────────────────────────────────┴──────────────────────┘`);

	console.log(`\n   🎯 Channel Status: CLOSED`);
	console.log(`      • Funds Released: ${ethers.formatEther(amount)} ETH`);
	console.log(`      • Agent Paid: ✓`);
	console.log(`      • Channel State: Finalized`);

	return {
		success: true,
		agentType,
		agentAddress,
		channelId,
		transactionHash: mockTxHash,
		blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
		gasUsed: mockGasUsed,
		gasCost: ethers.formatEther(gasCost),
		balanceBefore: ethers.formatEther(balanceBefore),
		balanceAfter: ethers.formatEther(balanceAfter),
		amountReceived: ethers.formatEther(amount),
		netGain: ethers.formatEther(netReceived),
	};
}

/**
 * Mock closure of all payment channels for a request
 *
 * @param {object} paymentChannels - Payment channel details for all agents
 * @returns {Promise<object>} Results for all channel closures
 */
async function mockCloseAllChannels(paymentChannels) {
	console.log("\n╔═══════════════════════════════════════════════════════════════════════════════╗");
	console.log("║  STEP 6: CHANNEL CLOSURE - AGENTS CLAIM PAYMENTS (MOCK)                      ║");
	console.log("╚═══════════════════════════════════════════════════════════════════════════════╝");
	console.log("   Purpose: Simulate agents closing channels and claiming their earned payments");
	console.log("   Status: Processing channel closures sequentially...\n");
	console.log("   💡 Note: In production, agents close channels independently when ready");
	console.log("   💡 This demo simulates all closures to show the complete flow\n");

	// Initialize balances if needed
	initializeMockBalances();

	const results = {
		script: null,
		sound: null,
		video: null,
	};

	// Track total balances before
	const totalBalanceBefore = getMockBalance(config.agentWallets.script) + getMockBalance(config.agentWallets.sound) + getMockBalance(config.agentWallets.video);

	// Close script agent channel
	console.log("   ╔═════════════════════════════════════════════════════════════════════════════╗");
	console.log("   ║  CLOSURE 1/3: SCRIPT AGENT CLAIMS PAYMENT                                   ║");
	console.log("   ╚═════════════════════════════════════════════════════════════════════════════╝\n");

	results.script = await mockCloseChannel(paymentChannels.script.channelId, config.agentWallets.script, "script", ethers.parseEther(paymentChannels.script.amount), 0, paymentChannels.script.signature);

	console.log("\n   ⏳ Waiting for next agent...\n");
	await new Promise((resolve) => setTimeout(resolve, 200));

	// Close sound agent channel
	console.log("   ╔═════════════════════════════════════════════════════════════════════════════╗");
	console.log("   ║  CLOSURE 2/3: SOUND AGENT CLAIMS PAYMENT                                    ║");
	console.log("   ╚═════════════════════════════════════════════════════════════════════════════╝\n");

	results.sound = await mockCloseChannel(paymentChannels.sound.channelId, config.agentWallets.sound, "sound", ethers.parseEther(paymentChannels.sound.amount), 1, paymentChannels.sound.signature);

	console.log("\n   ⏳ Waiting for next agent...\n");
	await new Promise((resolve) => setTimeout(resolve, 200));

	// Close video agent channel
	console.log("   ╔═════════════════════════════════════════════════════════════════════════════╗");
	console.log("   ║  CLOSURE 3/3: VIDEO AGENT CLAIMS PAYMENT                                    ║");
	console.log("   ╚═════════════════════════════════════════════════════════════════════════════╝\n");

	results.video = await mockCloseChannel(paymentChannels.video.channelId, config.agentWallets.video, "video", ethers.parseEther(paymentChannels.video.amount), 2, paymentChannels.video.signature);

	// Track total balances after
	const totalBalanceAfter = getMockBalance(config.agentWallets.script) + getMockBalance(config.agentWallets.sound) + getMockBalance(config.agentWallets.video);

	// Calculate totals
	const totalReceived = ethers.parseEther(paymentChannels.script.amount) + ethers.parseEther(paymentChannels.sound.amount) + ethers.parseEther(paymentChannels.video.amount);

	const totalGasCost = ethers.parseEther(results.script.gasCost) + ethers.parseEther(results.sound.gasCost) + ethers.parseEther(results.video.gasCost);

	const totalNetGain = totalBalanceAfter - totalBalanceBefore;

	// Print comprehensive summary
	console.log("\n\n╔═══════════════════════════════════════════════════════════════════════════════╗");
	console.log("║  CHANNEL CLOSURE COMPLETE - ALL AGENTS PAID                                   ║");
	console.log("╚═══════════════════════════════════════════════════════════════════════════════╝\n");

	console.log("   📊 Individual Agent Results:");
	console.log("   ┌─────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐");
	console.log("   │ Agent       │ Balance Before   │ Amount Received  │ Gas Cost         │ Net Gain         │");
	console.log("   ├─────────────┼──────────────────┼──────────────────┼──────────────────┼──────────────────┤");
	console.log(`   │ Script      │ ${results.script.balanceBefore.padStart(14)} ETH │ ${results.script.amountReceived.padStart(14)} ETH │ ${results.script.gasCost.padStart(14)} ETH │ ${results.script.netGain.padStart(14)} ETH │`);
	console.log(`   │ Sound       │ ${results.sound.balanceBefore.padStart(14)} ETH │ ${results.sound.amountReceived.padStart(14)} ETH │ ${results.sound.gasCost.padStart(14)} ETH │ ${results.sound.netGain.padStart(14)} ETH │`);
	console.log(`   │ Video       │ ${results.video.balanceBefore.padStart(14)} ETH │ ${results.video.amountReceived.padStart(14)} ETH │ ${results.video.gasCost.padStart(14)} ETH │ ${results.video.netGain.padStart(14)} ETH │`);
	console.log("   └─────────────┴──────────────────┴──────────────────┴──────────────────┴──────────────────┘");

	console.log("\n   📈 Current Agent Balances:");
	console.log("   ┌─────────────┬──────────────────────────────────────────────┬──────────────────┐");
	console.log("   │ Agent       │ Wallet Address                               │ Current Balance  │");
	console.log("   ├─────────────┼──────────────────────────────────────────────┼──────────────────┤");
	console.log(`   │ Script      │ ${config.agentWallets.script} │ ${results.script.balanceAfter.padStart(14)} ETH │`);
	console.log(`   │ Sound       │ ${config.agentWallets.sound} │ ${results.sound.balanceAfter.padStart(14)} ETH │`);
	console.log(`   │ Video       │ ${config.agentWallets.video} │ ${results.video.balanceAfter.padStart(14)} ETH │`);
	console.log("   └─────────────┴──────────────────────────────────────────────┴──────────────────┘");

	console.log("\n   💰 Financial Summary:");
	console.log("   ┌──────────────────────────────────────┬──────────────────┐");
	console.log("   │ Metric                               │ Value            │");
	console.log("   ├──────────────────────────────────────┼──────────────────┤");
	console.log(`   │ Total Payments Distributed           │ ${ethers.formatEther(totalReceived).padStart(14)} ETH │`);
	console.log(`   │ Total Gas Costs (paid by agents)    │ ${ethers.formatEther(totalGasCost).padStart(14)} ETH │`);
	console.log(`   │ Total Net Received by Agents         │ ${ethers.formatEther(totalNetGain).padStart(14)} ETH │`);
	console.log("   └──────────────────────────────────────┴──────────────────┘");

	console.log("\n   ✅ Closure Verification:");
	console.log("      • All 3 channels: CLOSED ✓");
	console.log("      • All signatures: VERIFIED ✓");
	console.log("      • All funds: TRANSFERRED ✓");
	console.log("      • All agents: PAID ✓");

	console.log("\n   🎯 Final Channel States:");
	console.log("      • Script Agent Channel:", results.script.channelId.substring(0, 20) + "... → CLOSED");
	console.log("      • Sound Agent Channel:", results.sound.channelId.substring(0, 20) + "... → CLOSED");
	console.log("      • Video Agent Channel:", results.video.channelId.substring(0, 20) + "... → CLOSED");

	console.log("\n   📋 Transaction Hashes:");
	console.log("      • Script Agent:", results.script.transactionHash);
	console.log("      • Sound Agent:", results.sound.transactionHash);
	console.log("      • Video Agent:", results.video.transactionHash);

	return results;
}

/**
 * Get current mock balance for an agent
 */
function getCurrentBalance(agentType) {
	const agentAddress = config.agentWallets[agentType];
	return ethers.formatEther(getMockBalance(agentAddress));
}

/**
 * Get all current balances
 */
function getAllBalances() {
	return {
		script: getCurrentBalance("script"),
		sound: getCurrentBalance("sound"),
		video: getCurrentBalance("video"),
	};
}

module.exports = {
	mockCloseChannel,
	mockCloseAllChannels,
	getCurrentBalance,
	getAllBalances,
	initializeMockBalances,
};

const { ethers } = require("ethers");
const axios = require("axios");
const {
  payAgent,
  defineAP2Flow,
  setMCPContext,
  getRequest,
} = require("../utils/contract");
const config = require("../config");
const { generateScript } = require("../../agents/script-agent/scriptAgent.js");
const { generateSound } = require("../../agents/sound-agent/soundAgent.js");
const { generateVideo } = require("../../agents/video-agent/videoAgent.js");

async function processVideoRequest(requestId, user, prompt) {
  console.log(`\n📹 Processing video request ${requestId}...`);

  const baseUrl = config.baseUrl;
  const requestIdStr = requestId.toString();
  const ap2Nonce = `ap2-${requestIdStr}-${Date.now()}`;

  const receiptURI = `${baseUrl}/api/receipt/${requestIdStr}`;
  const callbackURI = `${baseUrl}/api/callback/${requestIdStr}`;
  const metadataURI = `${baseUrl}/api/metadata/${requestIdStr}`;

  console.log("📝 Setting AP2 flow metadata...");
  await defineAP2Flow(requestIdStr, ap2Nonce, receiptURI, callbackURI, metadataURI);

  const mcpContextURI = `${baseUrl}/api/mcp-context/${requestIdStr}`;
  console.log("🔧 Setting MCP context...");
  await setMCPContext(requestIdStr, mcpContextURI);

  const request = await getRequest(requestIdStr);
  const totalAmount = request.amountPaid;
  console.log(`💰 Total payment: ${ethers.formatEther(totalAmount)} ETH`);

  // === Stage 1: Script ===
  console.log("\n📝 Stage 1: Generating script...");
  const scriptText = await generateScript(prompt);
  const scriptAmount = (totalAmount * BigInt(config.paymentSplit.script)) / 100n;
  await payAgent(requestIdStr, config.agentWallets.script, scriptAmount);
  console.log(`✅ Paid script agent: ${ethers.formatEther(scriptAmount)} ETH`);

  // === Stage 2: Sound ===
  console.log("\n🎵 Stage 2: Generating sound...");
  const sound = await generateSound({ prompt, script: scriptText });
  const soundAmount = (totalAmount * BigInt(config.paymentSplit.sound)) / 100n;
  await payAgent(requestIdStr, config.agentWallets.sound, soundAmount);
  console.log(`✅ Paid sound agent: ${ethers.formatEther(soundAmount)} ETH`);

  // === Stage 3: Video ===
  console.log("\n🎬 Stage 3: Generating video...");
  const video = await generateVideo({ prompt, script: scriptText, sound });
  const videoAmount = (totalAmount * BigInt(config.paymentSplit.video)) / 100n;
  await payAgent(requestIdStr, config.agentWallets.video, videoAmount);
  console.log(`✅ Paid video agent: ${ethers.formatEther(videoAmount)} ETH`);

  console.log(`\n✅ Video request ${requestId} completed successfully!`);
  return { scriptText, sound, video };
}

module.exports = { processVideoRequest };

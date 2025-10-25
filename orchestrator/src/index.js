const express = require("express");
const cors = require("cors");
const config = require("./config");
const { startEventListener } = require("./listeners/eventListener");
const routes = require("./api/routes");
const logStreamer = require("./utils/logStream");

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// SSE endpoint for log streaming
app.get("/api/logs/stream", (req, res) => {
	// Set headers for SSE
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.setHeader("Access-Control-Allow-Origin", "*");

	// Send initial connection message
	res.write(`data: ${JSON.stringify({ type: "connected", message: "Connected to log stream", timestamp: new Date().toISOString() })}\n\n`);

	// Add client to streamer
	logStreamer.addClient(res);

	// Handle client disconnect
	req.on("close", () => {
		logStreamer.removeClient(res);
	});
});

// Start server
app.listen(config.port, async () => {
	console.log("🚀 Orchestrator server started");
	console.log(`   Port: ${config.port}`);
	console.log(`   Base URL: ${config.baseUrl}`);
	console.log(`   Contract: ${config.contractAddress}`);

	// Start listening for blockchain events
	await startEventListener();
});

// Graceful shutdown
process.on("SIGINT", () => {
	console.log("\n🛑 Shutting down...");
	process.exit(0);
});

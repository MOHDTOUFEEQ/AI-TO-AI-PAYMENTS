const express = require("express");
const config = require("./config");
const { startEventListener } = require("./listeners/eventListener");
const routes = require("./api/routes");

const app = express();
app.use(express.json());

// API routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
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

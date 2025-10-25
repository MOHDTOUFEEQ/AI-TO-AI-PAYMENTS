// Log streaming utility for real-time frontend updates
const EventEmitter = require("events");

class LogStreamer extends EventEmitter {
	constructor() {
		super();
		this.clients = new Set();
		this.logBuffer = [];
		this.maxBufferSize = 1000;
	}

	// Add a client connection
	addClient(res) {
		this.clients.add(res);
		console.log(`✅ Log stream client connected. Total clients: ${this.clients.size}`);

		// Send buffered logs to new client
		this.logBuffer.forEach((log) => {
			this.sendToClient(res, log);
		});
	}

	// Remove a client connection
	removeClient(res) {
		this.clients.delete(res);
		console.log(`❌ Log stream client disconnected. Total clients: ${this.clients.size}`);
	}

	// Send log to a specific client
	sendToClient(res, log) {
		try {
			res.write(`data: ${JSON.stringify(log)}\n\n`);
		} catch (error) {
			this.removeClient(res);
		}
	}

	// Broadcast log to all connected clients
	broadcast(log) {
		// Add to buffer
		this.logBuffer.push(log);
		if (this.logBuffer.length > this.maxBufferSize) {
			this.logBuffer.shift();
		}

		// Send to all clients
		this.clients.forEach((client) => {
			this.sendToClient(client, log);
		});
	}

	// Log with specific type
	log(message, type = "info", metadata = {}) {
		const logEntry = {
			timestamp: new Date().toISOString(),
			type, // info, success, error, warning, transaction, channel, settlement
			message,
			metadata,
		};

		this.broadcast(logEntry);
		return logEntry;
	}

	// Clear all logs
	clear() {
		this.logBuffer = [];
		this.broadcast({ type: "clear", message: "Logs cleared", timestamp: new Date().toISOString() });
	}
}

// Singleton instance
const logStreamer = new LogStreamer();

// Override console.log to capture orchestrator logs
const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
	originalLog.apply(console, args);
	const message = args.join(" ");

	// Determine log type based on message content
	let type = "info";
	if (message.includes("✅") || message.includes("Complete") || message.includes("Success")) {
		type = "success";
	} else if (message.includes("❌") || message.includes("ERROR") || message.includes("Error")) {
		type = "error";
	} else if (message.includes("⚠️") || message.includes("Warning")) {
		type = "warning";
	} else if (message.includes("Transaction Hash") || message.includes("0x")) {
		type = "transaction";
	} else if (message.includes("Channel") || message.includes("CHANNEL")) {
		type = "channel";
	} else if (message.includes("Settlement") || message.includes("SETTLEMENT")) {
		type = "settlement";
	}

	logStreamer.log(message, type);
};

console.error = function (...args) {
	originalError.apply(console, args);
	const message = args.join(" ");
	logStreamer.log(message, "error");
};

module.exports = logStreamer;

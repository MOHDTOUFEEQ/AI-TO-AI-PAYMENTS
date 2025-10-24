require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

// Mock Script Agent
app.post("/api/v1/generate-script", (req, res) => {
	const { prompt } = req.body;
	console.log("\n📝 Script Agent called");
	console.log("   Prompt:", prompt);

	const script = `[MOCK SCRIPT]
Scene 1: Opening shot of ${prompt}
Scene 2: Product showcase
Scene 3: Call to action
Duration: 30 seconds`;

	console.log("   ✅ Script generated");

	return res.json({
		status: "success",
		script: script,
		metadata: {
			agent: "script",
			timestamp: new Date().toISOString(),
			prompt: prompt,
		},
	});
});

// Mock Sound Agent
app.post("/api/v1/generate-sound", (req, res) => {
	const { prompt, script } = req.body;
	console.log("\n🎵 Sound Agent called");
	console.log("   Script received:", script ? "Yes" : "No");

	const soundUrl = `https://example.com/audio/mock-${Date.now()}.mp3`;

	console.log("   ✅ Audio generated");
	console.log("   URL:", soundUrl);

	return res.json({
		status: "success",
		audioUrl: soundUrl,
		metadata: {
			agent: "sound",
			timestamp: new Date().toISOString(),
			duration: "30s",
			format: "mp3",
		},
	});
});

// Mock Video Agent
app.post("/api/v1/generate-video", (req, res) => {
	const { prompt, script, sound } = req.body;
	console.log("\n🎬 Video Agent called");
	console.log("   Script:", script ? "Received" : "Missing");
	console.log("   Sound:", sound ? "Received" : "Missing");

	const videoUrl = `https://example.com/videos/mock-${Date.now()}.mp4`;

	console.log("   ✅ Video generated");
	console.log("   URL:", videoUrl);

	return res.json({
		status: "success",
		videoUrl: videoUrl,
		metadata: {
			agent: "video",
			timestamp: new Date().toISOString(),
			duration: "30s",
			resolution: "1920x1080",
			format: "mp4",
		},
	});
});

// Health check
app.get("/health", (req, res) => {
	res.json({ status: "ok", services: ["script", "sound", "video"] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log("🤖 Mock AI Agent Services started");
	console.log(`   Port: ${PORT}`);
	console.log("   Endpoints:");
	console.log("   - POST /api/v1/generate-script");
	console.log("   - POST /api/v1/generate-sound");
	console.log("   - POST /api/v1/generate-video");
});

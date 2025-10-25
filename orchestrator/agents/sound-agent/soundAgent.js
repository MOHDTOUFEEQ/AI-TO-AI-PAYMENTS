const fs = require("fs");
const axios = require("axios");

// async function generateSound({ script }) {
//   // mock: call ElevenLabs or return placeholder
//   const outputFile = `./output/sound-${Date.now()}.mp3`;
//   fs.writeFileSync(outputFile, `Audio generated for: ${script}`);
//   return { file: outputFile, message: "Mock sound generated" };
// }

async function generateSound({ script }) {
	return "Mock sound generated";
}

module.exports = { generateSound };

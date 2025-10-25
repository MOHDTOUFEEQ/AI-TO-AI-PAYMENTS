const { execSync } = require("child_process");
const path = require("path");

// async function generateVideo({ script, sound }) {
//   const outputFile = path.join("output", `video-${Date.now()}.mp4`);
//   execSync(`echo "Video generated for ${script}" > ${outputFile}`);
//   return { file: outputFile, message: "Mock video generated" };
// }

async function generateVideo({ script, sound }) {
	return "Mock video generated";
}

module.exports = { generateVideo };

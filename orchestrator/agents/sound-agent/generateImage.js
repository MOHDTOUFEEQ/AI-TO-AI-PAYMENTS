const fs = require("fs");
const axios = require("axios");

// async function generateSound({ script }) {
//   // mock: call ElevenLabs or return placeholder
//   const outputFile = `./output/sound-${Date.now()}.mp3`;
//   fs.writeFileSync(outputFile, `Audio generated for: ${script}`);
//   return { file: outputFile, message: "Mock sound generated" };
// }

async function generateImage({ userPrompt, script,theme }) {
	console.log("🎨 Generating hero image...");

	const imagePrompt = `
  Create an appealing image for a 10-second video ad.
  
  Product: ${userPrompt}
  Theme: ${theme}
  Context: ${script}
  
  Style: ${theme.toLowerCase()}, bright pastel or natural background, clean minimal setup,
  soft natural lighting, authentic and human feel (not studio-quality).
  `;
  
	const result = await openai.images.generate({
	  model: "dall-e-3",
	  prompt: imagePrompt,
	  size: "1024x1024",
	});
  
	const imageUrl = result.data[0].url;
	console.log("✅ Image URL →", imageUrl, "\n");
	return imageUrl;
}

module.exports = { generateImage };

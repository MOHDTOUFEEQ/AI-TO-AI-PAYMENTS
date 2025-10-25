// const OpenAI = require("openai");
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// async function generateScript(prompt) {
//   const res = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "system", content: "You are a film scriptwriter." },
//       { role: "user", content: prompt },
//     ],
//   });
//   return res.choices[0].message.content;
// }	

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateScript(userPrompt) {
	
	const prompt = `
	You are a creative AI ad director.
	The user concept is: "${userPrompt}"
	
	Please produce:
	1. A short, 10-second voice-over script for a playful, modern, techy product teaser.
	   - Include voice lines and short on-screen text [in brackets].
	2. A 1-sentence image theme describing the ideal visual mood or aesthetic for the product teaser.
	   - Keep the theme concise (e.g., "Playful minimal tech vibe with pastel colors").
	`;
	
	  const res = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [{ role: "user", content: prompt }],
	  });
	
	  const fullResponse = res.choices[0].message.content.trim();
	  
	  const themeMatch = fullResponse.match(/(?:Theme|Image Theme|Visual Theme)[:\-]?\s*(.*)/i);
	  const theme = themeMatch ? themeMatch[1].trim() : "Playful minimal tech vibe";
	
	  const script = fullResponse.replace(/(?:Theme|Image Theme|Visual Theme)[:\-]?.*/i, "").trim();
	
	  console.log("✅ Script Generated ");
	
	  return { script, theme };
}

module.exports = { generateScript };

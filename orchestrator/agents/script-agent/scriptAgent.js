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

async function generateScript(prompt) {
	return "Mock script generated";
}

module.exports = { generateScript };

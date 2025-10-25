const { execSync } = require("child_process");
const path = require("path");

// async function generateVideo({ script, sound }) {
//   const outputFile = path.join("output", `video-${Date.now()}.mp4`);
//   execSync(`echo "Video generated for ${script}" > ${outputFile}`);
//   return { file: outputFile, message: "Mock video generated" };
// }

async function generateVideo({ script, imageUrl, theme}) {
	console.log("🎬 Creating KIE Veo 3.1 Fast task...");
	console.log("🖼️ Image URL:", imageUrl);
	console.log("🎨 Theme:", theme);
  
	const videoPrompt = `
  Cinematic 10-second teaser for  ${script}
  
  Visual theme: ${theme}
  Duration: 10 seconds, 16:9 ratio.
  `;
  
	try {
	  // 1️⃣ Create a new generation task
	  const { data } = await axios.post(
		"https://api.kie.ai/api/v1/veo/generate",
		{
		  prompt: videoPrompt,
		  imageUrls: [imageUrl],
		  model: "veo3_fast",
		  generationType: "REFERENCE_2_VIDEO",
		  aspectRatio: "16:9",
		  enableTranslation: true,
		  watermark: "MyBrand",
		},
		{
		  headers: {
			Authorization: `Bearer ${KIE_API_KEY}`,
			"Content-Type": "application/json",
		  },
		}
	  );
  
	  if (data.code !== 200) throw new Error(`❌ KIE error: ${data.msg}`);
  
	  const taskId = data.data.taskId;
	  console.log(`✅ Task created → ${taskId}`);
	  console.log("⏳ Waiting for KIE to finish rendering video...");
  
	  // 2️⃣ Poll the GET /record-info endpoint every 2s
	  let videoUrl = null;
	  for (let attempt = 1; attempt <= 150; attempt++) {
		const statusRes = await axios.get(
		  "https://api.kie.ai/api/v1/veo/record-info",
		  {
			params: { taskId },
			headers: { Authorization: `Bearer ${KIE_API_KEY}` },
		  }
		);
		
		const resData = statusRes.data;
	  const record = resData.data; // ✅ actual data object
	  const flag = record?.successFlag;
	  const videoUrl =
		  record?.response?.resultUrls?.[0] || record?.response?.originUrls?.[0];
  
	  console.log(`🛰️ Poll #${attempt}: successFlag=${flag}`);
	  console.log("📦 Response preview:", {
		  taskId: record?.taskId,
		  resolution: record?.response?.resolution,
		  videoUrl,
	  });
  
	  if (flag === 1 && videoUrl) {
		  console.log(`🎉 Video ready! URL: ${videoUrl}`);
		  return videoUrl
	  } else if (flag === 2 || flag === 3) {
		  console.log("❌ Video generation failed:", record?.errorMessage);
		  return;
	  }
  
  
		console.log(
		  `⌛ [${attempt}] Still processing... statusFlag=${flag} (checking again in 2s)`
		);
		await new Promise((r) => setTimeout(r, 2000)); // wait 2 seconds
	  }
  
	  if (!videoUrl) throw new Error("⚠️ Video not ready after timeout.");
  
	  // 3️⃣ Download the video
	  console.log("Video Generated");
	  return videoUrl;
	} catch (err) {
	  console.error("❌ Error generating/downloading video:", err.message);
	  if (err.response?.data) console.error(err.response.data);
	}
  }


module.exports = { generateVideo };

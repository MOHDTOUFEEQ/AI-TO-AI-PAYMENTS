function registerMcpRoutes(app) {
  app.get("/mcp/manifest.json", (req, res) => {
    res.json({
      protocol: "mcp/1.0",
      name: "Artisan Wrapper",
      version: "1.0.0",
      description: "Payment-gated AI services.",
      capabilities: ["quote", "execute", "payment"],
      endpoints: {
        quote_script: "/mcp/v1/quote-script",
        quote_sound: "/mcp/v1/quote-sound",
        quote_video: "/mcp/v1/quote-video",
        execute_script: "/api/v1/generate-script",
        execute_sound: "/api/v1/generate-sound",
        execute_video: "/api/v1/generate-video"
      },
      payment: {
        chain_id: "421614",
        asset: process.env.USDC_ADDRESS,
        recipient: process.env.WRAPPER_WALLET_ADDRESS,
        currency: "USDC",
        min_amount: "0.01"
      }
    });
  });

  app.get("/mcp/v1/quote-script", (req, res) => {
    res.json({
      protocol: "mcp/1.0",
      service: "script-generator",
      description: "Generates ad scripts using OpenAI.",
      chain_id: "421614",
      asset: process.env.USDC_ADDRESS,
      recipient: process.env.WRAPPER_WALLET_ADDRESS,
      currency: "USDC",
      price: "0.01",
      ttl: 600
    });
  });

  app.get("/mcp/v1/quote-sound", (req, res) => {
    res.json({
      protocol: "mcp/1.0",
      service: "sound-generator",
      description: "Generates voiceover/mix.",
      chain_id: "421614",
      asset: process.env.USDC_ADDRESS,
      recipient: process.env.WRAPPER_WALLET_ADDRESS,
      currency: "USDC",
      price: "0.01",
      ttl: 600
    });
  });

  app.get("/mcp/v1/quote-video", (req, res) => {
    res.json({
      protocol: "mcp/1.0",
      service: "video-generator",
      description: "Creates a visual composition.",
      chain_id: "421614",
      asset: process.env.USDC_ADDRESS,
      recipient: process.env.WRAPPER_WALLET_ADDRESS,
      currency: "USDC",
      price: "0.02",
      ttl: 600
    });
  });

  // dynamic context for a given AP2 flow
  app.get("/api/mcp-context/:requestId", (req, res) => {
    const { requestId } = req.params;
    res.json({
      protocol: "mcp/1.0",
      request_id: requestId,
      context_type: "video-generation",
      services: {
        script: { quote: "/mcp/v1/quote-script", execute: "/api/v1/generate-script" },
        sound:  { quote: "/mcp/v1/quote-sound",  execute: "/api/v1/generate-sound"  },
        video:  { quote: "/mcp/v1/quote-video",  execute: "/api/v1/generate-video"  }
      }
    });
  });
}

module.exports = { registerMcpRoutes };

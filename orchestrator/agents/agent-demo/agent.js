require("dotenv").config();
const axios = require("axios");
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_RPC_URL);
const wallet = new ethers.Wallet(process.env.AGENT_WALLET_PRIVATE_KEY, provider);
const ERC20_ABI = ["function transfer(address to, uint256 value) returns (bool)"];

(async () => {
  try {
    console.log("🚀 Calling server...");
    const res = await axios.post("http://localhost:3000/api/v1/generate-script", {});
    console.log("✅ Response:", res.data);
  } catch (err) {
    if (err.response && err.response.status === 402) {
      const invoice = err.response.data.invoice;
      console.log("💰 Received invoice:", invoice);

      const token = new ethers.Contract(invoice.asset, ERC20_ABI, wallet);
      const tx = await token.transfer(
        invoice.recipient,
        ethers.parseUnits(invoice.amount, 6)
      );
      console.log("🔗 Sent payment:", tx.hash);
      await tx.wait();
      console.log("✅ Payment confirmed.");

      const proofRes = await axios.post(
        "http://localhost:3000/api/v1/generate-script",
        {},
        { headers: { Authorization: `Bearer ${tx.hash}` } }
      );

      console.log("🎉 Final response:", proofRes.data);
    } else {
      console.error("❌ Error:", err.message);
    }
  }
})();

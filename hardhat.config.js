require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Use DEPLOYER_PRIVATE_KEY if set, otherwise fall back to ORCHESTRATOR_PRIVATE_KEY
const deployerKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.ORCHESTRATOR_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.20",
	networks: {
		"arbitrum": {
			// Arbitrum One
			url: process.env.ARBITRUM_RPC_URL || "",
			accounts: deployerKey ? [deployerKey] : [],
			chainId: 42161,
		},
		"arbitrum-sepolia": {
			// Arbitrum Sepolia Testnet
			url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "",
			accounts: deployerKey ? [deployerKey] : [],
			chainId: 421614,
		},
		"hardhat": {
			chainId: 1337,
		},
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts",
	},
};

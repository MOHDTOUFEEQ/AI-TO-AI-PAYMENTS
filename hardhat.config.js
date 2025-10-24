require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.20",
	networks: {
		arbitrum: {
			// Arbitrum One
			url: process.env.ARBITRUM_RPC_URL || "",
			accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
			chainId: 42161,
		},
		arbitrumSepolia: {
			// Arbitrum Sepolia
			url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "",
			accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
			chainId: 421614,
		},
		hardhat: {
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

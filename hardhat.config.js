/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-ethers");
// const dotenv = require("dotenv");
// dotenv.config();

module.exports = {
	solidity: "0.8.15"
	// USE THIS IF YOU PLAN TO RUN npx hardhat run <script>
	// defaultNetwork: "sepolia",
	// networks: {
	// 	hardhat: {},
	// 	sepolia: {
	// 		url: process.env.API_URL,
	// 		accounts: [`0x${process.env.PRIVATE_KEY}`],
	// 		gas: 210000000,
	// 		gasPrice: 800000000000
	// 	}
	// }
};

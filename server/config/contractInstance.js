const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });
const ethers = require("ethers");

if (!process.env.PRIVATE_KEY || !process.env.API_URL || !process.env.CONTRACT_ADDRESS) {
	throw new Error("Some variable is not defined in your environment variables for contract instance");
}

const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const { abi } = require("../../artifacts/contracts/State.sol/State.json");
const contractInstance = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

module.exports = { contractInstance };

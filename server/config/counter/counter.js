const fs = require("fs");
const path = require("path");
const ethers = require("ethers");

const createFilePath = (counterName) => path.join(__dirname, `${counterName}.txt`);

// Function to get the current counter value for a specific counter
const getCounter = async (counterName) => {
	const counterFilePath = createFilePath(counterName);
	try {
		if (!fs.existsSync(counterFilePath)) {
			await fs.promises.writeFile(counterFilePath, "0");
			return 0;
		}
		const data = await fs.promises.readFile(counterFilePath, "utf8");
		return parseInt(data, 10);
	} catch (error) {
		console.error(`Error reading ${counterName} counter file:`, error);
		throw error;
	}
};

// Function to increment and get the new counter value for a specific counter
const incrementCounter = async (counterName) => {
	try {
		const currentCounter = await getCounter(counterName);
		const newCounter = currentCounter + 1;
		const counterFilePath = createFilePath(counterName);
		await fs.promises.writeFile(counterFilePath, newCounter.toString());

		// Format the counter as bytes32
		const bytes32Counter = ethers.utils.formatBytes32String(newCounter.toString());
		return bytes32Counter;
	} catch (error) {
		console.error(`Error incrementing ${counterName} counter:`, error);
		throw error;
	}
};

module.exports = { getCounter, incrementCounter };

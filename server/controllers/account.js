const { contractInstance } = require("../config/contractInstance");
const User = require("../models/User");

// Common function to handle contract calls and transactions
async function handleContractCall(call) {
	try {
		const tx = await call;
		if (typeof tx !== "function") {
			return { success: true, data: tx };
		}
		const result = await tx.wait();
		return { success: true, data: result };
	} catch (error) {
		console.error("Contract call error:", error.message);
		return { success: false, error: error.message };
	}
}

//@desc     Get All Company
//@route    GET /account/allCompanys
//@access	Public
exports.getAllCompany = async (req, res) => {
	try {
		const companyUsers = await User.find({ role: "company" });
		if (!companyUsers) {
			throw new Error("No company found in the database");
		}

		res.status(200).json(companyUsers);
	} catch (error) {
		res.status(500).send(error.message);
	}
};

//@desc     Get All Package of Company requestor
//@route    GET /account/:companyAddress/packages
//@access	Private
exports.getCompanyPackages = async (req, res) => {
	const companyAddress = req.params.companyAddress;
	const resultContract = await handleContractCall(contractInstance.getCompanyPackages(companyAddress));
	if (resultContract.success) {
		res.json(resultContract.data);
	} else {
		res.status(500).send(resultContract.error);
	}
};

//@desc		Get account information
//@route    GET /account
//@access	Private
exports.getAccount = async (req, res) => {
	const resultContract = await handleContractCall(contractInstance.getAccount(req.user.walletAddress));
	if (resultContract.success) {
		const data = resultContract.data;
		res.json({
			role: data[0],
			unredeemedItemIDs: data[1],
			redeemedItemIDs: data[2],
			proposeTradeIDs: data[3],
			requestedTradeIDs: data[4],
			packageIDs: data[5],
			tokenBalance: data[6].toString()
		});
	} else {
		res.status(500).send(resultContract.error);
	}
};

//@desc		Increase or decrease amount of token
//@route    PUT /account/balance
//@access	Private
//@body		{ amount }, if >0 then add but <0 then decrease
exports.updateTokenBalance = async (req, res) => {
	const { amount } = req.body;
	// Validate input
	if (typeof amount !== "number") {
		return res.status(400).send("Invalid amount provided");
	}
	let resultContract;
	if (amount > 0) {
		resultContract = await handleContractCall(contractInstance.increaseAccountToken(req.user.walletAddress, amount));
	} else {
		resultContract = await handleContractCall(contractInstance.decreaseAccountToken(req.user.walletAddress, -amount));
	}
	if (resultContract.success) {
		res.json({ success: true });
	} else {
		res.status(500).send(resultContract.error);
	}
};

//@desc     For user to redeem their items
//@route    PUT /account/items/:itemID
//@access	Private
exports.redeemUserItem = async (req, res) => {
	const itemID = req.params.itemID;
	// Validate input
	if (!itemID) {
		return res.status(400).send("Item ID is required");
	}
	const resultContract = await handleContractCall(contractInstance.redeemUserItem(req.user.walletAddress, itemID));
	if (resultContract.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(resultContract.error);
	}
};

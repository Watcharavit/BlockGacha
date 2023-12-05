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
		res.status(200).json(companyUsers);
	} catch (error) {
		res.status(500);
	}
};

//@desc     Get All Package of Company requestor
//@route    GET /account/:companyID/packages
//@access	Private
exports.getCompanyPackages = async (req, res) => {
	const companyID = req.params.companyID;
	const result = await handleContractCall(contractInstance.getCompanyPackages(companyID));
	if (result.success) {
		res.json(result.data);
	} else {
		res.status(500).send(result.error);
	}
};

//@desc		Get account information
//@route    GET /account
//@access	Private
exports.getAccount = async (req, res) => {
	const result = await handleContractCall(contractInstance.getAccount(req.user.walletAddress));
	if (result.success) {
		const data = result.data;
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
		res.status(500).send(result.error);
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
	let result;
	if (amount > 0) {
		result = await handleContractCall(contractInstance.increaseAccountToken(req.user.walletAddress, amount));
	} else {
		result = await handleContractCall(contractInstance.decreaseAccountToken(req.user.walletAddress, -amount));
	}
	if (result.success) {
		res.json({ success: true });
	} else {
		res.status(500).send(result.error);
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
	const result = await handleContractCall(contractInstance.redeemUserItem(req.user.walletAddress, itemID));
	if (result.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

const { contractInstance } = require("../config/contractInstance");

// Common function to handle contract calls and transactions
async function handleContractCall(callPromise) {
	try {
		const result = await callPromise;
		return { success: true, data: result };
	} catch (error) {
		console.error("Contract call error:", error);
		return { success: false, error: error.message };
	}
}

//@desc     Get All Package of Company requestor
//@route    GET /account/company
//@access	Private
exports.getCompanyPackages = async (req, res) => {
	const result = await handleContractCall(contractInstance.getCompanyPackages(req.user.walletAddress));
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
	let balancePromise;
	if (amount > 0) {
		balancePromise = contractInstance.increaseAccountToken(req.user.walletAddress, amount);
	} else {
		balancePromise = contractInstance.decreaseAccountToken(req.user.walletAddress, -amount);
	}
	const result = await handleContractCall(balancePromise);
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
	const tx = await contractInstance.redeemUserItem(req.user.walletAddress, itemID);
	const result = await handleContractCall(tx.wait());
	if (result.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

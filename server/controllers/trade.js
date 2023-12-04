const { contractInstance } = require("../config/contractInstance");
const { incrementCounter } = require("../config/counter/counter");

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

//@desc     Get Trade by ID
//@route    GET /trade/:tradeID
//@access	Public
exports.getTrade = async (req, res) => {
	const tradeID = req.params.tradeID;
	const result = await handleContractCall(contractInstance.getTrade(tradeID));
	if (result.success) {
		const data = result.data;
		res.json({
			proposeItemID: data[0],
			requestItemID: data[1],
			requestTo: data[2],
			proposeBy: data[3],
			isDone: data[4]
		});
	} else {
		res.status(500).send(result.error);
	}
};

//@desc		Propose a trade
//@route    POST /trade/proposed
//@access	Private
//@body 	{ requestTo, proposeItemID, requestItemID }
exports.proposeTrade = async (req, res) => {
	const { requestTo, proposeItemID, requestItemID } = req.body;
	// Validate input
	if (!requestTo || !proposeItemID || !requestItemID) {
		return res.status(400).send("Invalid input data");
	}
	const tradeID = await incrementCounter("tradeIDCounter");
	const result = await handleContractCall(contractInstance.proposeTrade(tradeID, req.user.walletAddress, requestTo, proposeItemID, requestItemID));
	if (result.success) {
		res.status(201).json({ success: true, tradeID: tradeID });
	} else {
		res.status(500).send(result.error);
	}
};

//@desc		Accept propose trade
//@route    PUT /trade/accepted/:tradeID
//@access	Private
exports.acceptPropose = async (req, res) => {
	const tradeID = req.params.tradeID;
	const result = await handleContractCall(contractInstance.acceptPropose(req.user.walletAddress, tradeID));
	if (result.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

const { contractStateInstance } = require("../config/contractInstance");

//@desc     Get Item by ID
//@route    GET /state/items/:id
//@access
exports.getItem = async (req, res) => {
	try {
		const itemID = req.params.id;
		const product = await contractStateInstance.getItem(itemID);
		res.send(product);
	} catch (err) {
		res.status(500).send(err.message);
		console.log(err.stack);
	}
};

//@desc     Create or update Item
//@route    POST /state/items
//@access
exports.setItem = async (req, res) => {
	try {
		const { companyAddress, itemID, itemName, itemRate } = req.body;
		const tx = await contractStateInstance.setItem(companyAddress, itemID, itemName, itemRate);
		await tx.wait();
		res.json({ success: true });
	} catch (err) {
		res.status(500).send(err.message);
		console.log(err.stack);
	}
};

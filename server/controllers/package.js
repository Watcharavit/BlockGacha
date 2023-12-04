const { contractInstance } = require("../config/contractInstance");
const { incrementCounter } = require("../config/counter/counter");
const Item = require("../models/Item");
const Package = require("../models/Package");

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

//@desc     Get Item by ID
//@route    GET /package/items/:itemID
//@access	Public
exports.getItem = async (req, res) => {
	const itemID = req.params.itemID;
	const result = await handleContractCall(contractInstance.getItem(itemID));
	const item = await Item.findById(itemID);
	if (result.success && item) {
		const data = result.data;
		res.json({
			itemID: data[0],
			itemName: data[1],
			itemRate: data[3],
			...(item.picture && { itemPicture: item.picture })
		});
	} else {
		res.status(500).send(result.error);
	}
};

//@desc     Create Item
//@route    POST /package/items
//@access	Private
//@body 	{ itemName, itemRate, itemPicture(optional) }
exports.createItem = async (req, res) => {
	const { itemName, itemRate, itemPicture } = req.body;
	// Validate input
	if (!itemName || !itemRate) {
		return res.status(400).send("Invalid input data");
	}
	const itemID = await incrementCounter("itemIDCounter");
	const tx = await contractInstance.createItem(req.user.walletAddress, itemID, itemName, itemRate);
	const result = await handleContractCall(tx.wait());
	const item = await Item.create({ _id: itemID, picture: itemPicture });
	if (result.success && item) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

//@desc     Update Item
//@route    PUT /package/items/:itemID
//@access	Private
//@body 	{ itemName, itemRate, itemPicture(optional) }
exports.updateItem = async (req, res) => {
	const itemID = req.params.itemID;
	const { itemName, itemRate, itemPicture } = req.body;
	// Validate input
	if (!itemName || !itemRate) {
		return res.status(400).send("Invalid input data");
	}
	const tx = await contractInstance.updateItem(req.user.walletAddress, itemID, itemName, itemRate);
	const result = await handleContractCall(tx.wait());
	let item;
	if (itemPicture) {
		item = await Item.findByIdAndUpdate(
			itemID,
			{ picture: itemPicture },
			{
				new: true,
				runValidators: true
			}
		);
	}
	if (result.success && item) {
		res.status(200).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

//@desc     Get Package by ID
//@route    GET /package/packages/:packageID
//@access	Public
exports.getPackage = async (req, res) => {
	const packageID = req.params.packageID;
	const result = await handleContractCall(contractInstance.getPackage(packageID));
	const package = await Package.findById(packageID);
	if (result.success && package) {
		const data = result.data;
		res.json({
			packageID: data[0],
			packageName: data[1],
			itemIDList: data[2],
			packageStatus: data[5],
			...(package.picture && { packagePicture: package.picture })
		});
	} else {
		res.status(500).send(result.error);
	}
};

//@desc     Create Package
//@route    POST /package/packages
//@access	Private
//@body 	{ packageName, price, status, packagePicture(optional) }
exports.createPackage = async (req, res) => {
	const { packageName, price, status, packagePicture } = req.body;
	// Validate input
	if (!packageName || !price || typeof status !== "boolean") {
		return res.status(400).send("Invalid input data");
	}
	const packageID = await incrementCounter("packageIDCounter");
	const tx = await contractInstance.createPackage(req.user.walletAddress, packageID, packageName, price, status);
	const result = await handleContractCall(tx.wait());
	const package = await Package.create({ _id: packageID, picture: packagePicture });
	if (result.success && package) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

//@desc     Update Package
//@route    PUT /package/packages/:packageID
//@access	Private
//@body 	{ packageName, price, status, packagePicture(optional) }
exports.updatePackage = async (req, res) => {
	const packageID = req.params.packageID;
	const { packageName, price, status, packagePicture } = req.body;
	// Validate input
	if (!packageName || !price || typeof status !== "boolean") {
		return res.status(400).send("Invalid input data");
	}
	const tx = await contractInstance.updatePackage(req.user.walletAddress, packageID, packageName, price, status);
	const result = await handleContractCall(tx.wait());
	let package;
	if (packagePicture) {
		package = await Package.findByIdAndUpdate(
			packageID,
			{ picture: packagePicture },
			{
				new: true,
				runValidators: true
			}
		);
	}
	if (result.success && package) {
		res.status(200).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

//@desc     Add itemID to package
//@route    POST /package/packages/:packageID/items/:itemID
//@access
exports.addItemToPackage = async (req, res) => {
	const packageID = req.params.packageID;
	const itemID = req.params.itemID;
	// Validate input
	if (!itemID) {
		return res.status(400).send("Invalid input data");
	}
	const tx = await contractInstance.addItemToPackage(req.user.walletAddress, itemID, packageID);
	const result = await handleContractCall(tx.wait());
	if (result.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};

//@desc     Remove itemID to package
//@route    DELETE /package/packages/:packageID
//@access
exports.removeItemFromPackage = async (req, res) => {
	const packageID = req.params.packageID;
	const { itemID } = req.body;
	// Validate input
	if (!itemID) {
		return res.status(400).send("Invalid input data");
	}
	const tx = await contractInstance.removeItemFromPackage(req.user.walletAddress, itemID, packageID);
	const result = await handleContractCall(tx.wait());
	if (result.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(result.error);
	}
};
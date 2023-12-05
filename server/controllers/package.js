const { contractInstance } = require("../config/contractInstance");
const { incrementCounter } = require("../config/counter/counter");
const Item = require("../models/Item");
const Package = require("../models/Package");
const mongoose = require("mongoose");

// Common function to handle contract calls and transactions
async function handleContractCall(callFunction) {
	try {
		const tx = await callFunction;
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

// Common function to handle contract calls and transactions
async function handleDBCall(callFunction) {
	try {
		const result = await callFunction;
		return { success: true, data: result };
	} catch (error) {
		console.error("MongoDB call error:", error.message);
		return { success: false, error: error.message };
	}
}

//@desc     Get Item by ID
//@route    GET /package/items/:itemID
//@access	Public
exports.getItem = async (req, res) => {
	const itemID = req.params.itemID;

	try {
		// Fetch package details from the smart contract
		const resultContract = await handleContractCall(contractInstance.getItem(itemID));
		if (!resultContract.success) {
			throw new Error(resultContract.error);
		}

		// Retrieve item data from MongoDB
		const item = await Item.findById(itemID);
		if (!item) {
			throw new Error("Item not found in the database");
		}

		const data = resultContract.data;

		res.json({
			itemID: data[0],
			itemName: data[1],
			itemRate: data[2].toString(),
			companyOwner: data[3],
			...(item.picture && { itemPicture: item.picture })
		});
	} catch (error) {
		res.status(500).send(error.message);
	}
};

//@desc     Create Item
//@route    POST /package/items
//@access	Private
//@body 	{ itemName, itemRate, itemPicture(optional) }
exports.createItem = async (req, res) => {
	const { itemName, itemRate, itemPicture } = req.body;
	if (!itemName || !itemRate) {
		return res.status(400).send("Invalid input data");
	}

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const itemID = await incrementCounter("itemIDCounter");

		// First, make the change in MongoDB
		const resultDB = await handleDBCall(Item.create([{ _id: itemID, picture: itemPicture }], { session: session }));
		if (!resultDB.success) {
			throw new Error(resultDB.error);
		}

		// Then, make the contract call
		const resultContract = await handleContractCall(contractInstance.createItem(req.user.walletAddress, itemID, itemName, itemRate));
		if (!resultContract.success) {
			throw new Error(resultContract.error);
		}

		// If everything goes well, commit the transaction
		await session.commitTransaction();
		res.status(201).json({ success: true, itemID: itemID });
	} catch (error) {
		// If there's an error, abort the transaction and roll back any changes
		await session.abortTransaction();
		res.status(500).send(error.message);
	} finally {
		session.endSession();
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

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		let update = {};
		if (itemPicture) {
			update.picture = itemPicture;
		}

		// Update the item in MongoDB within the transaction
		const resultDB = await handleDBCall(Item.findByIdAndUpdate(itemID, update, { new: true, runValidators: true, session }));
		if (!resultDB.success) {
			throw new Error(resultDB.error);
		}

		// Make the smart contract call
		const resultContract = await handleContractCall(contractInstance.updateItem(req.user.walletAddress, itemID, itemName, itemRate));
		if (!resultContract.success) {
			throw new Error(resultContract.error);
		}

		// If contract call is successful, commit the transaction
		await session.commitTransaction();
		res.status(200).json({ success: true });
	} catch (error) {
		// If there's an error, abort the transaction and roll back any changes
		await session.abortTransaction();
		res.status(500).send(error.message);
	} finally {
		session.endSession();
	}
};

//@desc     Get Package by ID
//@route    GET /package/packages/:packageID
//@access	Public
exports.getPackage = async (req, res) => {
	const packageID = req.params.packageID;

	try {
		// Fetch package details from the smart contract
		const resultContract = await handleContractCall(contractInstance.getPackage(packageID));
		if (!resultContract.success) {
			throw new Error(resultContract.error);
		}

		// Retrieve package data from MongoDB
		const package = await Package.findById(packageID);
		if (!package) {
			throw new Error("Package not found in the database");
		}

		const data = resultContract.data;

		res.json({
			packageID: data[0],
			packageName: data[1],
			itemIDList: data[2],
			price: data[4].toString(),
			packageStatus: data[5],
			...(package.picture && { packagePicture: package.picture })
		});
	} catch (error) {
		res.status(500).send(error.message);
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

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const packageID = await incrementCounter("packageIDCounter");

		// First, create the package in MongoDB within the transaction
		const resultDB = await handleDBCall(Package.create([{ _id: packageID, picture: packagePicture }], { session: session }));
		if (!resultDB.success) {
			throw new Error(resultDB.error);
		}

		// Then, make the smart contract call
		const resultContract = await handleContractCall(contractInstance.createPackage(req.user.walletAddress, packageID, packageName, price, status));
		if (!resultContract.success) {
			throw new Error(resultContract.error);
		}

		// If everything goes well, commit the transaction
		await session.commitTransaction();
		res.status(201).json({ success: true, packageID: packageID });
	} catch (error) {
		// If there's an error, abort the transaction and roll back any changes
		await session.abortTransaction();
		res.status(500).send(error.message);
	} finally {
		session.endSession();
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

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		let update = {};
		if (packagePicture) {
			update.picture = packagePicture;
		}

		// First, update the package in MongoDB within the transaction
		const resultDB = await handleDBCall(Package.findByIdAndUpdate(packageID, update, { new: true, runValidators: true, session }));
		if (!resultDB.success) {
			throw new Error(resultDB.error);
		}

		// Then, make the smart contract call
		const resultContract = await handleContractCall(contractInstance.updatePackage(req.user.walletAddress, packageID, packageName, price, status));
		if (!resultContract.success) {
			throw new Error(resultContract.error);
		}

		// If everything goes well, commit the transaction
		await session.commitTransaction();
		res.status(200).json({ success: true });
	} catch (error) {
		// If there's an error, abort the transaction and roll back any changes
		await session.abortTransaction();
		res.status(500).send(error.message);
	} finally {
		session.endSession();
	}
};

//@desc     Add itemID to package
//@route    POST /package/packages/:packageID/items/:itemID
//@access	Private
exports.addItemToPackage = async (req, res) => {
	const packageID = req.params.packageID;
	const itemID = req.params.itemID;

	// Validate input
	if (!itemID) {
		return res.status(400).send("Invalid input data");
	}

	const resultContract = await handleContractCall(contractInstance.addItemToPackage(req.user.walletAddress, itemID, packageID));

	if (resultContract.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(resultContract.error);
	}
};

//@desc     Remove itemID to package
//@route    DELETE /package/packages/:packageID/items/:itemID
//@access	Privat
exports.removeItemFromPackage = async (req, res) => {
	const packageID = req.params.packageID;
	const itemID = req.params.itemID;

	// Validate input
	if (!itemID) {
		return res.status(400).send("Invalid input data");
	}

	const resultContract = await handleContractCall(contractInstance.removeItemFromPackage(req.user.walletAddress, itemID, packageID));

	if (resultContract.success) {
		res.status(201).json({ success: true });
	} else {
		res.status(500).send(resultContract.error);
	}
};

//@desc     Random to add itemID to user
//@route    POST /package/random/:packageID
//@access
exports.pullGacha = async (req, res) => {
	const packageID = req.params.packageID;
	const resultContract = await handleContractCall(contractInstance.pullGacha(packageID, req.user.walletAddress));
	if (resultContract.success) {
		const transactionReceipt = resultContract.data;
		res.status(201).json(transactionReceipt);
	} else {
		res.status(500).send(resultContract.error);
	}
};

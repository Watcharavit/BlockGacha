const { contractStateInstance } = require("../config/contractInstance");

// Get Item by ID
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

// Create a new item
exports.createItem = async (req, res) => {
    try {
        const { companyAddress, itemID, itemName, itemRate } = req.body;
        await contractStateInstance.createItem(companyAddress, itemID, itemName, itemRate);
        res.status(201).send('Item created successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Update an existing item
exports.updateItem = async (req, res) => {
    try {
        const { companyAddress, itemName, itemRate } = req.body;
        const itemID = req.params.id;
        await contractStateInstance.updateItem(companyAddress, itemID, itemName, itemRate);
        res.status(200).send('Item updated successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Add an item to a package
exports.addItemToPackage = async (req, res) => {
    try {
        const { companyAddress } = req.body;
        const { itemId, packageId } = req.params;
        await contractStateInstance.addItemToPackage(companyAddress, itemId, packageId);
        res.status(200).send('Item added to package successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Remove an item from a package
exports.removeItemFromPackage = async (req, res) => {
    try {
        const { companyAddress } = req.body;
        const { itemId, packageId } = req.params;
        await contractStateInstance.removeItemFromPackage(companyAddress, itemId, packageId);
        res.status(200).send('Item removed from package successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Get Package by ID
exports.getPackage = async (req, res) => {
    try {
        const packageID = req.params.id;
        const package = await contractStateInstance.getPackage(packageID);
        res.json(package);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Create a new package
exports.createPackage = async (req, res) => {
    try {
        const { companyAddress, packageID, packageName, price, status } = req.body;
        await contractStateInstance.createPackage(companyAddress, packageID, packageName, price, status);
        res.status(201).send('Package created successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Update an existing package
exports.updatePackage = async (req, res) => {
    try {
        const { companyAddress, packageName, price, status } = req.body;
        const packageID = req.params.id;
        await contractStateInstance.updatePackage(companyAddress, packageID, packageName, price, status);
        res.status(200).send('Package updated successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Get Account by Address
exports.getAccount = async (req, res) => {
    try {
        const address = req.params.address;
        const account = await contractStateInstance.getAccount(address);
        res.json(account);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Register a new account
exports.registerAccount = async (req, res) => {
    try {
        const { address, role } = req.body;
        await contractStateInstance.registerAccount(address, role);
        res.status(201).send('Account registered successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Update token balance for an account
exports.updateAccountTokens = async (req, res) => {
    try {
        const { address, amount } = req.body;
        await contractStateInstance.increaseAccountToken(address, amount);
        res.status(200).send('Account token balance updated');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Add an item to a user's unredeemed items
exports.addUserItem = async (req, res) => {
    try {
        const { userAddress, itemID } = req.body;
        await contractStateInstance.addUserItem(userAddress, itemID);
        res.status(200).send('Item added to user');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Remove an item from a user's unredeemed items
exports.removeUserItem = async (req, res) => {
    try {
        const { userAddress } = req.body;
        const itemID = req.params.itemId;
        await contractStateInstance.removeUserItem(userAddress, itemID);
        res.status(200).send('Item removed from user');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Redeem an item for a user
exports.redeemUserItem = async (req, res) => {
    try {
        const { userAddress } = req.body;
        const itemID = req.params.itemId;
        await contractStateInstance.redeemUserItem(userAddress, itemID);
        res.status(200).send('Item redeemed by user');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Get Trade by ID
exports.getTrade = async (req, res) => {
    try {
        const tradeID = req.params.id;
        const trade = await contractStateInstance.getTrade(tradeID);
        res.json(trade);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Propose a new trade
exports.proposeTrade = async (req, res) => {
    try {
        const { tradeID, proposerAddress, requestTo, proposeItemID, requestItemID } = req.body;
        await contractStateInstance.proposeTrade(tradeID, proposerAddress, requestTo, proposeItemID, requestItemID);
        res.status(201).send('Trade proposed successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Accept a trade proposal
exports.acceptTrade = async (req, res) => {
    try {
        const { userAddress } = req.body;
        const tradeID = req.params.id;
        await contractStateInstance.acceptPropose(userAddress, tradeID);
        res.status(200).send('Trade accepted');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Get all packages owned by a company
exports.getCompanyPackages = async (req, res) => {
    try {
        const companyAddress = req.params.companyAddress;
        const packages = await contractStateInstance.getCompanyPackages(companyAddress);
        res.json(packages);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Perform a gacha pull
exports.pullGacha = async (req, res) => {
    try {
        const { packageId, userAddress } = req.params;
        await contractStateInstance.pullGacha(packageId, userAddress);
        res.status(200).send('Gacha pull successful');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

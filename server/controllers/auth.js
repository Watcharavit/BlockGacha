const User = require("../models/User");
const { contractInstance } = require("../config/contractInstance");
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

//@desc     Register user
//@route    POST /auth/register
//@access   Public
exports.register = async (req, res, next) => {
	const { name, walletAddress, email, password, role } = req.body;

	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		// First, create the user in MongoDB within the transaction
		const user = await User.create(
			[
				{
					name,
					walletAddress,
					email,
					password,
					role
				}
			],
			{ session: session }
		);

		let resultContract;
		if (role == "user") {
			resultContract = await handleContractCall(contractInstance.registerAccount(walletAddress, 0));
		} else if (role == "company") {
			resultContract = await handleContractCall(contractInstance.registerAccount(walletAddress, 1));
		}

		if (!resultContract.success) {
			throw new Error(resultContract.error);
		}

		// If everything goes well, commit the transaction
		await session.commitTransaction();
		sendTokenResponse(user[0], 200, res); // Assuming sendTokenResponse sends the response
	} catch (error) {
		// If there's an error, abort the transaction and roll back any changes
		await session.abortTransaction();
		res.status(400).json({
			success: false,
			message: error.message
		});
		console.log(error.stack);
	} finally {
		session.endSession();
	}
};

//@desc   Login user
//@route  POST /auth/login
//@access Public
exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ success: false, msg: "Please provide an email and password" });
		}
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(400).json({
				success: false,
				msg: "Invalid credentials"
			});
		}
		const isMatch = await user.matchPassword(password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				msg: "Invalid credentials"
			});
		}
		sendTokenResponse(user, 200, res);
	} catch (err) {
		return res.status(401).json({
			success: false,
			msg: "Cannot convert email or password to string"
		});
	}
};

const sendTokenResponse = (user, statusCode, res) => {
	const token = user.getSignedJwtToken();
	const options = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
		httpOnly: true
	};
	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}
	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		_id: user._id,
		name: user.name,
		walletAddress: user.walletAddress,
		email: user.email,
		token
	});
};

//@desc   Get current Logged in user
//@route  POST /auth/me
//@access Private
exports.getMe = async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		data: user
	});
};

//@desc   Log user out / clear cookie
//@route  GET /auth/logout
//@access Private
exports.logout = async (req, res, next) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});
	res.status(200).json({
		success: true,
		data: {}
	});
};

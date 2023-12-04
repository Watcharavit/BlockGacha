const User = require("../models/User");
const { contractInstance } = require("../config/contractInstance");

//@desc     Register user
//@route    POST /auth/register
//@access   Public
exports.register = async (req, res, next) => {
	try {
		const { name, walletAddress, email, password, role } = req.body;
		if (role == "user") {
			const tx = await contractInstance.registerAccount(walletAddress, 0);
			await tx.wait();
		} else if (role == "company") {
			const tx = await contractInstance.registerAccount(walletAddress, 1);
			await tx.wait();
		}
		const user = await User.create({
			name,
			walletAddress,
			email,
			password,
			role
		});
		sendTokenResponse(user, 200, res);
	} catch (err) {
		res.status(400).json({
			success: false
		});
		console.log(err.stack);
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

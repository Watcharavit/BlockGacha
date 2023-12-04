const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: [true, "Please add packageID"]
	},
	picture: {
		type: String
	}
});

module.exports = mongoose.model("Package", PackageSchema);

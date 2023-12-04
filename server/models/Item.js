const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: [true, "Please add itemID"]
	},
	picture: {
		type: String
	}
});

module.exports = mongoose.model("Item", ItemSchema);

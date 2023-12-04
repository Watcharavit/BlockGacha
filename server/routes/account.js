const express = require("express");
const router = express.Router();
const { getAccount, getCompanyPackages, redeemUserItem, updateTokenBalance } = require("../controllers/account");
const { protect, authorize } = require("../middleware/auth");

router.route("/").get(protect, authorize("company"), getAccount);
router.route("/company").get(protect, authorize("company"), getCompanyPackages);
router.route("/balance").put(protect, updateTokenBalance);
router.route("/items/:itemID").put(protect, authorize("user"), redeemUserItem);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getAccount, getAllCompany, getCompanyPackages, redeemUserItem, updateTokenBalance } = require("../controllers/account");
const { protect, authorize } = require("../middleware/auth");

router.route("/").get(protect, getAccount);
router.route("/company").get(protect, authorize("company"), getCompanyPackages);
router.route("/allCompany").get(protect, getAllCompany);
router.route("/balance").put(protect, updateTokenBalance);
router.route("/items/:itemID").put(protect, authorize("user"), redeemUserItem);

module.exports = router;

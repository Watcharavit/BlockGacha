const express = require("express");
const { getTrade, acceptPropose, proposeTrade } = require("../controllers/trade");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.route("/:tradeID").get(getTrade);
router.route("/proposed").post(protect, proposeTrade);
router.route("/accepted/:tradeID").put(protect, acceptPropose);

module.exports = router;

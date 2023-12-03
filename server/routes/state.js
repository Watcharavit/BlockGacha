const express = require("express");
const { getItem, setItem } = require("../controllers/state");
const router = express.Router();
const { protect } = require("../middleware/auth");

router.get("/items/:id", getItem);
router.post("/items", setItem);

module.exports = router;

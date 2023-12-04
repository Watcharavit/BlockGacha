const express = require("express");
const router = express.Router();
const { getItem, createItem, updateItem, getPackage, createPackage, updatePackage, addItemToPackage, removeItemFromPackage } = require("../controllers/package");
const { protect, authorize } = require("../middleware/auth");

// Item routes
router.route("/items").post(protect, authorize("company"), createItem);
router.route("/items/:itemID").get(getItem).put(protect, authorize("company"), updateItem);

// Package routes
router.route("/packages").post(protect, authorize("company"), createPackage);
router.route("/packages/:packageID").get(getPackage).put(protect, authorize("company"), updatePackage);

// Others
router.route("/packages/:packageID/items/:itemID").post(protect, authorize("company"), addItemToPackage).delete(protect, authorize("company"), removeItemFromPackage);

module.exports = router;

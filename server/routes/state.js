const express = require("express");
const {
  getItem,
  createItem,
  updateItem,
  addItemToPackage,
  removeItemFromPackage,
  getPackage,
  createPackage,
  updatePackage,
  getAccount,
  registerAccount,
  updateAccountTokens,
  addUserItem,
  removeUserItem,
  redeemUserItem,
  getTrade,
  proposeTrade,
  acceptTrade,
  getCompanyPackages,
  pullGacha
  // Add more controller methods as needed
} = require("../controllers/state");
const router = express.Router();

// Item routes
router.get('/items/:id', getItem);
router.post('/items', createItem);
router.put('/items/:id', updateItem);
router.post('/items/:itemId/package/:packageId', addItemToPackage);
router.delete('/items/:itemId/package/:packageId', removeItemFromPackage);

// Package routes
router.get('/packages/:id', getPackage);
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);

// Account routes
router.get('/accounts/:address', getAccount);
router.post('/accounts', registerAccount);
router.put('/accounts/:address/tokens', updateAccountTokens);
router.post('/accounts/:address/items', addUserItem);
router.delete('/accounts/:address/items/:itemId', removeUserItem);
router.post('/accounts/:address/items/:itemId/redeem', redeemUserItem);

// Trade routes
router.get('/trades/:id', getTrade);
router.post('/trades', proposeTrade);
router.put('/trades/:id/accept', acceptTrade);

// Miscellaneous routes
router.get('/packages/company/:companyAddress', getCompanyPackages);
router.post('/gacha/:packageId/user/:userAddress', pullGacha);

module.exports = router;

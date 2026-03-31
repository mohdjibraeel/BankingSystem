const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controller/transaction.controller");

const router = express.Router();

/**
 * POST /api/transactions
 * Description: Create a new transaction
 */

router.post(
  "/",
  authMiddleware.authMiddleware,
  transactionController.createTransaction,
);

/**
 * POST /api/transactions/system/intial-funds
 * Description: Initialize system funds (admin only)
 */
router.post(
  "/system/intial-funds",
  authMiddleware.authSystemUserMiddleware,
  transactionController.CreateInitializeFundsTransaction,
);

module.exports = router;

const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 *  1. Validate request
 *  2. Validate idempotency key
 *  3. Check account status
 *  4. Derive sender balance from ledger
 *  5. Create transaction (PENDING)
 *  6. Create DEBIT ledger entry
 *  7. Create CREDIT ledger entry
 *  8. Mark transaction COMPLETED
 *  9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
  /**
   * 1. Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({ message: "Invalid from or to account" });
  }
  /**
   * 2.Validate idempotency
   */
  const isTractionExists = await transactionModel.findOne({ idempotencyKey });

  if (isTractionExists) {
    if (isTractionExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isTractionExists,
      });
    }
    if (isTractionExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is pending",
        transaction: isTractionExists,
      });
    }
    if (isTractionExists.status === "FAILED") {
      return res.status(200).json({
        message: "Transaction already failed",
        transaction: isTractionExists,
      });
    }
    if (isTractionExists.status === "REVERSED") {
      return res.status(200).json({
        message: "Transaction was reversed,please try again",
        transaction: isTractionExists,
      });
    }
  }

  /**
   * 3. Check account status
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({ message: "Both accounts must be active" });
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance, current balance: ${balance}, requested: ${amount}`,
    });
  }

  /**
   * 5. Create transaction (PENDING)
   */
  let transaction;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount: fromAccount,
            toAccount: toAccount,
            amount: amount,
            idempotencyKey: idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transactions: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await (() => {
      //setTimeout to simulate delay in processing transaction and to test idempotency key handling
      return new Promise((resolve) => {
        setTimeout(resolve, 20 * 1000);
      });
    })();

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transactions: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    await transactionModel.findByIdAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    res
      .status(400)
      .json({
        message:
          "Transaction is pending, please wait a moment,we are processing it",
      });
  }
  /**
   * 10. Send email notification
   */
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );
  return res
    .status(201)
    .json({ message: "Transaction successful", transaction });
}

async function CreateInitializeFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const toUserAccount = await accountModel.findOne({ _id: toAccount });
  if (!toUserAccount) {
    return res.status(404).json({ message: "Invalid to account" });
  }
  const fromUserAccount = await accountModel.findOne({ user: req.user._id });
  if (!fromUserAccount) {
    return res.status(404).json({ message: "System user account not found" });
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount: toAccount,
    amount: amount,
    idempotencyKey: idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transactions: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );
  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transactions: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );
  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();
  return res.status(201).json({
    message: "Initialize funds transaction completed successfully",
    transaction,
  });
}

module.exports = { createTransaction, CreateInitializeFundsTransaction };

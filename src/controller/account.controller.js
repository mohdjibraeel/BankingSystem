const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
  const user = req.user;
  const account = await accountModel.create({
    user: user._id,
  });

  res.status(201).json({
    account: account,
  });
}

async function getAllAccountsController(req, res) {
  const user = req.user;
  const accounts = await accountModel.find({ user: user._id });
  res.status(200).json({
    accounts: accounts,
  });
}

async function getAccountByIdController(req, res) {
  const accountId = req.params.accountId;
  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });
  if (!account) {
    return res.status(404).json({ message: "Account not found" });
  }
  const balance = await account.getBalance();
  res.status(200).json({
    account: account._id,
    balance: balance,
  });
}

module.exports = {
  createAccountController,
  getAllAccountsController,
  getAccountByIdController
};

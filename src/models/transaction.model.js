const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "fromAccount is required"],
    index: true,
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "toAccount is required"],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, "amount is required"],
    min: [0, "amount must be greater than or equal to 0"],
  },
  idempotencyKey: {
    type: String,
    required: [true, "idempotencyKey is required"],
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
});

const transactionModel=mongoose.model("transaction", transactionSchema);  

module.exports=transactionModel;
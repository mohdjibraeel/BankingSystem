const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    index: true,
    immutable: true,
  },
  transactions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    index: true,
    required: true,
    immmutable: true,
  },
  amount: {
    type: Number,
    required: true,
    immutable: true,
  },
  type: {
    type: String,
    enum: ["debit", "credit"],
    required: true,
    immutable: true,
  },

});

function preventLedgerModification(){
  throw new Error("Ledger entries cannot be modified or deleted");
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
  
const Ledger = mongoose.model("Ledger", ledgerSchema);

module.exports = Ledger;

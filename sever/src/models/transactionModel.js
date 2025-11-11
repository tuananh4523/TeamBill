import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true, unique: true },
    refCode: { type: String, required: true },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer", "payment"],
      required: true,
    },
    direction: { type: String, enum: ["in", "out"], required: true },
    category: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    fee: { type: Number, default: 0 },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    deviceInfo: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now },
    confirmedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    versionKey: false,
    collection: "transactions",
  }
);

const Transaction =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
export default Transaction;

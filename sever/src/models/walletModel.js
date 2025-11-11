import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    refCode: { type: String, unique: true, required: true },
    walletName: { type: String, required: true, trim: true },
    walletType: { type: String, enum: ["personal", "group"], default: "personal" },
    balance: { type: Number, default: 0 },
    totalDeposit: { type: Number, default: 0 },
    totalWithdraw: { type: Number, default: 0 },
    withdrawLimit: { type: Number, default: 0 },
    depositLimit: { type: Number, default: 0 },

    bankAccount_holderName: { type: String, default: "" },
    bankAccount_number: { type: String, default: "" },
    bankAccount_bankCode: { type: String, default: "" },
    bankAccount_napasCode: { type: String, default: "" },
    bankAccount_bankName: { type: String, default: "" },

    status: {
      type: String,
      enum: ["active", "inactive", "locked"],
      default: "active",
    },
    pinCode: { type: String, default: "" },
    isLinkedBank: { type: Boolean, default: false },
    activatedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    versionKey: false,
    collection: "wallets",
  }
);

const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
export default Wallet;

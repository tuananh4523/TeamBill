import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId là bắt buộc"],
    },

    refCode: {
      type: String,
      required: [true, "refCode là bắt buộc"],
      unique: true,
    },

    walletName: {
      type: String,
      default: "Ví chính",
      trim: true,
      maxlength: [100, "walletName không được vượt quá 100 ký tự"],
    },

    walletType: {
      type: String,
      enum: ["PERSONAL", "GROUP"],
      default: "PERSONAL",
    },

    balance: {
      type: Number,
      default: 0,
      min: [0, "Số dư không thể âm"],
    },

    totalDeposit: {
      type: Number,
      default: 0,
    },

    totalWithdraw: {
      type: Number,
      default: 0,
    },

    withdrawLimit: {
      type: Number,
      default: 50000000,
    },

    depositLimit: {
      type: Number,
      default: 100000000,
    },

    bankAccount: {
      holderName: { type: String, required: true, trim: true },
      number: { type: String, required: true, trim: true },
      bankCode: { type: String, required: true },
      napasCode: { type: String, required: true },
      bankName: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "LOCKED", "SUSPENDED"],
      default: "ACTIVE",
    },

    pinCode: { type: String },

    isLinkedBank: { type: Boolean, default: true },

    activatedAt: { type: Date, default: Date.now },

    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);

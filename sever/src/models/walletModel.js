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
      maxlength: 100,
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
      min: [0, "Tổng nạp không thể âm"],
    },

    totalWithdraw: {
      type: Number,
      default: 0,
      min: [0, "Tổng rút không thể âm"],
    },

    withdrawLimit: {
      type: Number,
      default: 50000000,
      min: 0,
    },

    depositLimit: {
      type: Number,
      default: 100000000,
      min: 0,
    },

    bankAccount: {
      holderName: {
        type: String,
        required: [true, "Tên chủ tài khoản là bắt buộc"],
        trim: true,
      },
      number: {
        type: String,
        required: [true, "Số tài khoản là bắt buộc"],
        trim: true,
      },
      bankCode: {
        type: String,
        required: [true, "Mã ngân hàng là bắt buộc"],
      },
      napasCode: {
        type: String,
        required: [true, "Mã Napas là bắt buộc"],
      },
      bankName: {
        type: String,
        required: [true, "Tên ngân hàng là bắt buộc"],
      },
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

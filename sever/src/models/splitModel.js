// models/splitModel.js
import mongoose from "mongoose";

/**
 * SplitMember: lưu chi tiết ai trả bao nhiêu / nợ bao nhiêu
 */
const splitMemberSchema = new mongoose.Schema(
  {
    splitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Split",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    name: { type: String, required: true },
    paid: { type: Number, default: 0 },
    owed: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }, // paid - owed
  },
  { timestamps: true }
);

/**
 * Split: bản chia tiền của một Expense
 */
const splitSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    total: { type: Number, required: true },
    method: {
      type: String,
      enum: ["EQUAL", "PERCENTAGE", "CUSTOM"],
      default: "EQUAL",
    },
    currency: { type: String, default: "VND" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SplitMember =
  mongoose.models.SplitMember || mongoose.model("SplitMember", splitMemberSchema);
export default mongoose.models.Split || mongoose.model("Split", splitSchema);

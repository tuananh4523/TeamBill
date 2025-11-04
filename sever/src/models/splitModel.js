import mongoose from "mongoose";

/**
 * Bảng Split: lưu thông tin chia tiền của một khoản chi tiêu (Expense)
 */
const splitSchema = new mongoose.Schema(
  {
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      required: [true, "expenseId là bắt buộc"],
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "teamId là bắt buộc"],
    },

    total: {
      type: Number,
      required: [true, "Tổng số tiền là bắt buộc"],
      min: [0, "Tổng số tiền không thể âm"],
    },

    method: {
      type: String,
      enum: ["EQUAL", "PERCENTAGE", "CUSTOM"],
      default: "EQUAL",
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "VND",
      maxlength: [10, "Mã tiền tệ không hợp lệ"],
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * Bảng SplitMember: chi tiết chia tiền của từng thành viên
 */
const splitMemberSchema = new mongoose.Schema(
  {
    splitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Split",
      required: [true, "splitId là bắt buộc"],
    },

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: [true, "memberId là bắt buộc"],
    },

    name: {
      type: String,
      trim: true,
      required: [true, "Tên thành viên là bắt buộc"],
      minlength: [2, "Tên phải có ít nhất 2 ký tự"],
      maxlength: [100, "Tên không được vượt quá 100 ký tự"],
    },

    paid: {
      type: Number,
      default: 0,
      min: [0, "Số tiền trả không thể âm"],
    },

    owed: {
      type: Number,
      default: 0,
      min: [0, "Số tiền nợ không thể âm"],
    },

    balance: {
      type: Number,
      default: 0, // Tự động tính = paid - owed
    },
  },
  { timestamps: true }
);

/* ================== EXPORT ================== */
// Tránh lỗi “OverwriteModelError” khi hot reload trong dev
export const SplitMember =
  mongoose.models.SplitMember || mongoose.model("SplitMember", splitMemberSchema);

const Split = mongoose.models.Split || mongoose.model("Split", splitSchema);
export default Split;

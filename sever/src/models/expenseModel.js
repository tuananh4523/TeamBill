import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "teamId là bắt buộc"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tạo khoản chi tiêu là bắt buộc"],
    },

    title: {
      type: String,
      required: [true, "Tiêu đề khoản chi tiêu là bắt buộc"],
      trim: true,
      minlength: [2, "Tiêu đề phải có ít nhất 2 ký tự"],
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },

    amount: {
      type: Number,
      required: [true, "Số tiền là bắt buộc"],
      min: [0, "Số tiền phải lớn hơn hoặc bằng 0"],
    },

    category: {
      type: String,
      trim: true,
      maxlength: [100, "Tên danh mục không được vượt quá 100 ký tự"],
      default: "Khác",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Mô tả không được vượt quá 500 ký tự"],
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: false, // có thể chưa xác định ai trả
    },

    splitMethod: {
      type: String,
      enum: ["EQUAL", "PERCENTAGE", "CUSTOM"],
      default: "EQUAL",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // tự động tạo createdAt và updatedAt
  }
);

export default mongoose.model("Expense", expenseSchema);

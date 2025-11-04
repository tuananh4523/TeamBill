import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên nhóm là bắt buộc"],
      trim: true,
      minlength: [2, "Tên nhóm phải có ít nhất 2 ký tự"],
      maxlength: [100, "Tên nhóm không được vượt quá 100 ký tự"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Mô tả không được vượt quá 500 ký tự"],
      default: "",
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    refCode: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    membersCount: {
      type: Number,
      default: 1,
      min: [0, "Số lượng thành viên không thể âm"],
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },

    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },

    totalExpense: {
      type: Number,
      default: 0,
      min: [0, "Tổng chi tiêu không thể âm"],
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// ✅ Tránh lỗi khi reload trong môi trường dev
const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);
export default Team;

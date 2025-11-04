import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId là bắt buộc"],
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "teamId là bắt buộc"],
    },

    name: {
      type: String,
      trim: true,
      required: [true, "Tên thành viên là bắt buộc"],
      minlength: [2, "Tên thành viên phải có ít nhất 2 ký tự"],
      maxlength: [100, "Tên thành viên không được vượt quá 100 ký tự"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Email không hợp lệ"],
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      default: "member",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },

    contribution: {
      type: Number,
      default: 0,
      min: [0, "Giá trị đóng góp không được âm"],
    },

    balance: {
      type: Number,
      default: 0,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

export default mongoose.model("Member", memberSchema);

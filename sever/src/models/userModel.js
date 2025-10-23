// models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    fullName: String,
    avatar: String,
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    dateOfBirth: Date,
    role: { type: String, enum: ["admin", "member"], default: "member" },
    isVerified: { type: Boolean, default: false },
    verifyToken: String,
    resetToken: String,
    resetTokenExpiry: Date,
    lastLogin: Date,
    isActive: { type: Boolean, default: true },
    address: String,
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 👇 Dòng này là “chìa khóa vàng”
export default mongoose.models.User || mongoose.model("User", userSchema);

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import { userSchema } from "../schema/userSchema.js";
import { createDefaultCategoriesForUser } from "../controllers/categoryController.js";

const JWT_SECRET = process.env.JWT_SECRET || "teamBill_secret";

/* ============================================================
   ĐĂNG KÝ / TẠO NGƯỜI DÙNG MỚI
============================================================ */
export const registerUser = async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });

    const { username, password, email, fullName, phone, gender, address, role } =
      req.body;

    const existUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existUser)
      return res.status(400).json({ message: "Email hoặc tên đăng nhập đã tồn tại" });

    // Mã hóa mật khẩu và tạo token xác minh
    const hashedPassword = await bcryptjs.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // Tạo người dùng mới
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      fullName,
      phone,
      gender,
      address: address || "",
      role: role || "member",
      isVerified: false,
      verifyToken,
      isActive: true,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await createDefaultCategoriesForUser(newUser._id);

    // === Tự động tạo ví cá nhân ===
    const refCode = `WAL-${Date.now().toString(36).toUpperCase()}`;
    const wallet = await Wallet.create({
      userId: newUser._id,
      refCode,
      walletName: `Ví của ${newUser.username}`,
      walletType: "personal",
      balance: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      withdrawLimit: 0,
      depositLimit: 0,
      bankAccount_holderName: "",
      bankAccount_number: "",
      bankAccount_bankCode: "",
      bankAccount_napasCode: "",
      bankAccount_bankName: "",
      status: "active",
      pinCode: "",
      isLinkedBank: false,
      activatedAt: new Date(),
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Tạo token JWT cho người dùng mới
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    // Phản hồi về client
    res.status(201).json({
      message: "Tạo tài khoản và ví thành công",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
      wallet: {
        id: wallet._id,
        walletName: wallet.walletName,
        refCode: wallet.refCode,
        balance: wallet.balance,
        status: wallet.status,
      },
    });
  } catch (err) {
    console.error("[registerUser] Lỗi:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi tạo người dùng", error: err.message });
  }
};
/* ============================================================
   ĐĂNG NHẬP
============================================================ */
export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Thiếu thông tin đăng nhập" });

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Mật khẩu không chính xác" });

    if (!user.isActive)
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi đăng nhập", error: err.message });
  }
};

/* ============================================================
   CRUD NGƯỜI DÙNG
============================================================ */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng",
      error: err.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy thông tin người dùng",
      error: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật" });

    res.status(200).json({ message: "Cập nhật thành công", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi cập nhật người dùng", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy người dùng để xóa" });
    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi xóa người dùng", error: err.message });
  }
};

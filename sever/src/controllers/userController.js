// controllers/userController.js
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { userSchema } from "../schema/userSchema.js";

const JWT_SECRET = process.env.JWT_SECRET || "teamBill_secret";

// ===================== ĐĂNG KÝ =====================
export const signup = async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({ message: error.details.map((m) => m.message) });

    const { username, password, email, fullName, phone, gender } = req.body;
    const existUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existUser)
      return res.status(400).json({ message: "Email hoặc tên đăng nhập đã tồn tại" });

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      fullName,
      phone,
      gender,
      isVerified: false,
      isActive: true,
      joinedAt: new Date(),
    });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ===================== ĐĂNG NHẬP =====================
export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!user)
      return res.status(404).json({ error: "Người dùng không tồn tại" });

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ error: "Mật khẩu không chính xác" });

    if (!user.isActive)
      return res.status(403).json({ error: "Tài khoản đã bị khóa" });

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
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ nội bộ", detail: error.message });
  }
};

// ===================== TÌM KIẾM NGƯỜI DÙNG =====================
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
    })
      .select("_id username fullName email avatar role")
      .limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

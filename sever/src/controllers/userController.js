import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { userSchema } from "../schema/userSchema.js";

const JWT_SECRET = process.env.JWT_SECRET || "teamBill_secret"; // ⚙️ Khóa bí mật JWT, nên lưu trong .env

// ===================== ĐĂNG KÝ =====================
export const signup = async (req, res) => {
  try {
    const { username, password, email, age } = req.body;

    // ✅ Validate dữ liệu đầu vào
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({ message: error.details.map(m => m.message) });

    // ✅ Kiểm tra email đã tồn tại chưa
    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    // ✅ Mã hóa mật khẩu
    const hashedPassword = await bcryptjs.hash(password, 10);

    // ✅ Tạo người dùng
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      age,
    });

    // ✅ Sinh token JWT
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    // ✅ Phản hồi về client
    return res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        age: newUser.age,
        role: newUser.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ===================== ĐĂNG NHẬP =====================
export const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });

    // ✅ Cho phép đăng nhập bằng username hoặc email
    const existUser = await User.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!existUser)
      return res.status(400).json({ error: "Người dùng không tồn tại" });

    // ✅ Kiểm tra mật khẩu
    const isPasswordCorrect = await bcryptjs.compare(password, existUser.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ error: "Mật khẩu không đúng" });

    // ✅ Sinh token JWT mới
    const token = jwt.sign({ userId: existUser._id }, JWT_SECRET, { expiresIn: "7d" });

    // ✅ Trả về thông tin user và token
    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: existUser._id,
        username: existUser.username,
        email: existUser.email,
        age: existUser.age,
        role: existUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Lỗi máy chủ nội bộ", detail: error.message });
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
      ],
    })
      .select("_id username email")
      .limit(10);

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

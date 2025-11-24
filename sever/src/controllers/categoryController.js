import Category from "../models/categoryModel.js";
import { categorySchema } from "../schema/categorySchema.js";

// src/utils/defaultCategories.js

export const defaultCategories = [
  { name: "Ăn uống", color: "blue", description: "Chi phí ăn uống" },
  { name: "Shopping", color: "red", description: "Mua sắm" },
  { name: "Cafe", color: "purple", description: "Đi cafe" },
  { name: "Đi lại", color: "green", description: "Grab, taxi, xăng xe" },
  { name: "Giải trí", color: "gold", description: "Xem phim, karaoke" },
  { name: "Khác", color: "gray", description: "Chi tiêu linh tinh" },
];


/* ============================================================
   LẤY DANH MỤC THEO USER
============================================================ */
export const getCategoriesByUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId)
      return res.status(400).json({ message: "Thiếu userId" });

    const categories = await Category.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh mục",
      error: err.message,
    });
  }
};

/* ============================================================
   TẠO DANH MỤC
============================================================ */
export const createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error)
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((e) => e.message),
      });

    const category = await Category.create(req.body);

    res.status(201).json({
      message: "Tạo danh mục thành công",
      category,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi tạo danh mục",
      error: err.message,
    });
  }
};

/* ============================================================
   CẬP NHẬT DANH MỤC
============================================================ */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Category.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });

    res.status(200).json({
      message: "Cập nhật danh mục thành công",
      category: updated,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật",
      error: err.message,
    });
  }
};

/* ============================================================
   XÓA DANH MỤC
============================================================ */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });

    res.status(200).json({ message: "Xóa danh mục thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xóa",
      error: err.message,
    });
  }
};

/* ============================================================
   TẠO DANH MỤC MẶC ĐỊNH CHO USER MỚI
============================================================ */
export const createDefaultCategoriesForUser = async (userId) => {
  try {
    const payload = defaultCategories.map((c) => ({
      ...c,
      userId,
    }));

    await Category.insertMany(payload);

    return true;
  } catch (err) {
    console.error("Lỗi tạo danh mục mặc định:", err);
    return false;
  }
};

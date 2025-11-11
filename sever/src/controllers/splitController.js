import Split from "../models/splitModel.js";
import { splitSchema } from "../schema/splitSchema.js";

/* ============================================================
   TẠO SPLIT MỚI
============================================================ */
export const createSplit = async (req, res) => {
  try {
    const { error } = splitSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const { expenseId, teamId, total, method, currency, date } = req.body;

    const split = await Split.create({
      expenseId,
      teamId,
      total,
      method,
      currency,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Tạo split thành công",
      split,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi tạo split",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY DANH SÁCH SPLIT THEO TEAM
============================================================ */
export const getSplitsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) return res.status(400).json({ message: "Thiếu mã nhóm (teamId)" });

    const splits = await Split.find({ teamId }).sort({ date: -1 });
    res.status(200).json(splits);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách split",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY SPLIT THEO EXPENSE
============================================================ */
export const getSplitByExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const split = await Split.findOne({ expenseId });
    if (!split)
      return res.status(404).json({ message: "Không tìm thấy split của expense này" });
    res.status(200).json(split);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy split theo expenseId",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY CHI TIẾT SPLIT
============================================================ */
export const getSplitById = async (req, res) => {
  try {
    const { id } = req.params;
    const split = await Split.findById(id);
    if (!split) return res.status(404).json({ message: "Không tìm thấy split" });
    res.status(200).json(split);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết split",
      error: err.message,
    });
  }
};

/* ============================================================
   CẬP NHẬT SPLIT
============================================================ */
export const updateSplit = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = splitSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const updatedSplit = await Split.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedSplit)
      return res.status(404).json({ message: "Không tìm thấy split để cập nhật" });

    res.status(200).json({
      message: "Cập nhật split thành công",
      split: updatedSplit,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật split",
      error: err.message,
    });
  }
};

/* ============================================================
   XÓA SPLIT
============================================================ */
export const deleteSplit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Split.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy split để xóa" });
    res.status(200).json({ message: "Xóa split thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xóa split",
      error: err.message,
    });
  }
};

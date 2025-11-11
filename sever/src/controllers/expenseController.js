import Expense from "../models/expenseModel.js";
import { expenseSchema } from "../schema/expenseSchema.js";

/* ============================================================
   TẠO CHI TIÊU MỚI
============================================================ */
export const createExpense = async (req, res) => {
  try {
    const { error } = expenseSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const {
      teamId,
      createdBy,
      title,
      amount,
      category,
      description,
      paidBy,
      splitMethod,
      date,
    } = req.body;

    const expense = await Expense.create({
      teamId,
      createdBy,
      title,
      amount,
      category,
      description,
      status: "pending",
      paidBy,
      splitMethod,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Tạo chi tiêu thành công",
      expense,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi tạo chi tiêu",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY DANH SÁCH CHI TIÊU THEO NHÓM
============================================================ */
export const getExpensesByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      return res.status(400).json({ message: "Thiếu mã nhóm (teamId)" });
    }

    const expenses = await Expense.find({ teamId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách chi tiêu",
      error: err.message,
    });
  }
};

/* ============================================================
   XEM CHI TIẾT CHI TIÊU
============================================================ */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    if (!expense) return res.status(404).json({ message: "Không tìm thấy chi tiêu" });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết chi tiêu",
      error: err.message,
    });
  }
};

/* ============================================================
   CẬP NHẬT CHI TIÊU
============================================================ */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = expenseSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedExpense)
      return res.status(404).json({ message: "Không tìm thấy chi tiêu để cập nhật" });

    res.status(200).json({
      message: "Cập nhật chi tiêu thành công",
      expense: updatedExpense,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật chi tiêu",
      error: err.message,
    });
  }
};

/* ============================================================
   XÓA CHI TIÊU
============================================================ */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy chi tiêu để xóa" });
    res.status(200).json({ message: "Xóa chi tiêu thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xóa chi tiêu",
      error: err.message,
    });
  }
};

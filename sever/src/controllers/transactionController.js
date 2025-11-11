import Transaction from "../models/transactionModel.js";
import Wallet from "../models/walletModel.js";
import { transactionSchema } from "../schema/transactionSchema.js";

/* ============================================================
   TẠO GIAO DỊCH MỚI
============================================================ */
export const createTransaction = async (req, res) => {
  try {
    const { error } = transactionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const {
      walletId,
      userId,
      type,
      direction,
      category,
      amount,
      fee,
      description,
      deviceInfo,
    } = req.body;

    // Kiểm tra ví tồn tại
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: "Không tìm thấy ví" });
    }

    const balanceBefore = wallet.balance;
    const balanceAfter =
      direction === "in"
        ? balanceBefore + amount - (fee || 0)
        : balanceBefore - amount - (fee || 0);

    // Cập nhật số dư ví
    wallet.balance = balanceAfter;
    wallet.lastUpdated = new Date();
    await wallet.save();

    const code = `TXN-${Date.now().toString(36).toUpperCase()}`;
    const refCode = wallet.refCode;

    const transaction = await Transaction.create({
      walletId,
      userId,
      code,
      refCode,
      type,
      direction,
      category,
      amount,
      fee: fee || 0,
      balanceBefore,
      balanceAfter,
      description: description || "",
      status: "completed",
      deviceInfo: deviceInfo || "",
      date: new Date(),
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Tạo giao dịch thành công",
      transaction,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi tạo giao dịch",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY DANH SÁCH GIAO DỊCH THEO VÍ
============================================================ */
export const getTransactionsByWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    if (!walletId)
      return res.status(400).json({ message: "Thiếu mã ví (walletId)" });

    const transactions = await Transaction.find({ walletId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách giao dịch",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY CHI TIẾT GIAO DỊCH
============================================================ */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction)
      return res.status(404).json({ message: "Không tìm thấy giao dịch" });
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết giao dịch",
      error: err.message,
    });
  }
};

/* ============================================================
   CẬP NHẬT GIAO DỊCH (chỉ cho admin hoặc khi pending)
============================================================ */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = transactionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedTransaction)
      return res.status(404).json({ message: "Không tìm thấy giao dịch để cập nhật" });

    res.status(200).json({
      message: "Cập nhật giao dịch thành công",
      transaction: updatedTransaction,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật giao dịch",
      error: err.message,
    });
  }
};

/* ============================================================
   XÓA GIAO DỊCH
============================================================ */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy giao dịch để xóa" });
    res.status(200).json({ message: "Xóa giao dịch thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xóa giao dịch",
      error: err.message,
    });
  }
};

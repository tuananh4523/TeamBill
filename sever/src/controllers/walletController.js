import Wallet from "../models/walletModel.js";
import { walletSchema } from "../schema/walletSchema.js";

/* ============================================================
   TẠO VÍ MỚI
============================================================ */
export const createWallet = async (req, res) => {
  try {
    const { error } = walletSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const {
      userId,
      walletName,
      walletType,
      balance,
      totalDeposit,
      totalWithdraw,
      withdrawLimit,
      depositLimit,
      bankAccount_holderName,
      bankAccount_number,
      bankAccount_bankCode,
      bankAccount_napasCode,
      bankAccount_bankName,
      pinCode,
    } = req.body;

    const refCode = `WAL-${Date.now().toString(36).toUpperCase()}`;

    const wallet = await Wallet.create({
      userId,
      refCode,
      walletName,
      walletType: walletType || "personal",
      balance: balance || 0,
      totalDeposit: totalDeposit || 0,
      totalWithdraw: totalWithdraw || 0,
      withdrawLimit: withdrawLimit || 0,
      depositLimit: depositLimit || 0,
      bankAccount_holderName: bankAccount_holderName || "",
      bankAccount_number: bankAccount_number || "",
      bankAccount_bankCode: bankAccount_bankCode || "",
      bankAccount_napasCode: bankAccount_napasCode || "",
      bankAccount_bankName: bankAccount_bankName || "",
      status: "active",
      pinCode,
      isLinkedBank: !!bankAccount_number,
      activatedAt: new Date(),
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Tạo ví thành công",
      wallet,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi tạo ví",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY DANH SÁCH VÍ (CÁ NHÂN / NHÓM)
============================================================ */
export const getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find().sort({ createdAt: -1 });
    res.status(200).json(wallets);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách ví",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY CHI TIẾT VÍ
============================================================ */
// controllers/walletController.js
export const getWalletById = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await Wallet.findById(id);

    if (!wallet) {
      return res.status(404).json({
        message: "Không tìm thấy ví",
        data: null,
      });
    }

    res.status(200).json({
      message: "Lấy thông tin ví thành công",
      data: wallet,
    });
  } catch (err) {
    console.error("[getWalletById] Error:", err);
    res.status(500).json({
      message: "Lỗi server khi lấy thông tin ví",
      error: err.message,
      data: null,
    });
  }
};


/* ============================================================
   CẬP NHẬT VÍ
============================================================ */
export const updateWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = walletSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const updatedWallet = await Wallet.findByIdAndUpdate(
      id,
      { ...req.body, lastUpdated: new Date(), updatedAt: new Date() },
      { new: true }
    );

    if (!updatedWallet)
      return res.status(404).json({ message: "Không tìm thấy ví để cập nhật" });

    res.status(200).json({
      message: "Cập nhật ví thành công",
      wallet: updatedWallet,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật ví",
      error: err.message,
    });
  }
};

/* ============================================================
   XÓA VÍ
============================================================ */
export const deleteWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Wallet.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy ví để xóa" });
    res.status(200).json({ message: "Xóa ví thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xóa ví",
      error: err.message,
    });
  }
};

import express from "express";
import {
  createWallet,
  getWalletInfo,
  getTransactions,
  deposit,
  withdraw,
  createVietQR,
} from "../controllers/walletController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const walletRouter = express.Router();

/* ================== MIDDLEWARE XÁC THỰC ================== */
// 👉 Có thể comment dòng này khi test nhanh
walletRouter.use(verifyToken);

/* ================== QUẢN LÝ VÍ ================== */
// Tạo ví mới
walletRouter.post("/wallet/create", createWallet);

// Lấy thông tin ví (theo userId)
walletRouter.get("/wallet/info", getWalletInfo);

// Lấy danh sách giao dịch
walletRouter.get("/wallet/transactions", getTransactions);

/* ================== NẠP / RÚT TIỀN ================== */
// Nạp tiền vào ví
walletRouter.post("/wallet/deposit", deposit);

// Rút tiền khỏi ví
walletRouter.post("/wallet/withdraw", withdraw);

/* ================== TẠO MÃ QR THANH TOÁN ================== */
// Tạo ảnh QR VietQR mock
walletRouter.post("/wallet/qr", createVietQR);

/* ================== Fallback nếu không khớp route ================== */
walletRouter.use((req, res) => {
  res.status(404).json({
    message: "Không tìm thấy endpoint trong module Wallet",
  });
});

export default walletRouter;

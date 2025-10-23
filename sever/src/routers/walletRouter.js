// routes/walletRouter.js
import express from "express";
import {
  createWallet,
  getWalletInfo,
  getTransactions,
  napTien,
  rutTien,
  taoQRVietQR,
} from "../controllers/walletController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/wallet/create", createWallet);
router.get("/wallet/info", getWalletInfo);
router.get("/wallet/transactions", getTransactions);
router.post("/wallet/deposit", napTien);
router.post("/wallet/withdraw", rutTien);
router.post("/wallet/qr", taoQRVietQR);

// Fallback nếu route không tồn tại
router.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy endpoint trong module Wallet" });
});

export default router;

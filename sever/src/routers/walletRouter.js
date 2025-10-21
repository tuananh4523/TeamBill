// routes/walletRouter.js
import express from "express";
import {
  createWallet,
  getWalletInfo,
  getTransactions,
  createTransaction,
  taoQRVietQR,
  xacNhanNapTien,
  rutTien,
} from "../controllers/walletController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👉 Có thể comment dòng verifyToken để test nhanh Postman
router.use(verifyToken);

router.post("/wallet/create", createWallet);
router.get("/wallet/info", getWalletInfo);
router.get("/wallet/transactions", getTransactions);
router.post("/wallet/transaction", createTransaction);
router.post("/wallet/qr", taoQRVietQR);
router.post("/wallet/confirm-topup", xacNhanNapTien);
router.post("/wallet/withdraw", rutTien);

export default router;

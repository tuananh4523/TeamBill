// routes/paymentRouter.js
import express from "express";
import { createVietQRDeposit, confirmVietQRDeposit } from "../controllers/paymentController.js";
import { validate } from "../middleware/validate.js";
import { vietqrDepositSchema } from "../schema/paymentSchema.js";

const paymentRouter = express.Router();

// Tạo QR nạp tiền cho 1 ví
paymentRouter.post(
  "/payments/wallet/:walletId/deposit/vietqr",
  validate(vietqrDepositSchema),
  createVietQRDeposit
);

// Xác nhận giao dịch nạp tiền (sau khi đã chuyển khoản)
paymentRouter.post(
  "/payments/deposit/:transactionId/confirm",
  confirmVietQRDeposit
);

export default paymentRouter;

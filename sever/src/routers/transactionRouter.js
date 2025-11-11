import express from "express";
import {
  createTransaction,
  getTransactionsByWallet,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { validate } from "../middleware/validate.js";
import { transactionSchema } from "../schema/transactionSchema.js";

const transactionRouter = express.Router();

// Lấy danh sách giao dịch theo ví
// GET /api/transactions/wallet/:walletId
transactionRouter.get("/transactions/wallet/:walletId", getTransactionsByWallet);

// Lấy chi tiết 1 giao dịch
// GET /api/transactions/:id
transactionRouter.get("/transactions/:id", getTransactionById);

// Tạo giao dịch mới
// POST /api/transactions
transactionRouter.post("/transactions", validate(transactionSchema), createTransaction);

// Cập nhật giao dịch
// PUT /api/transactions/:id
transactionRouter.put("/transactions/:id", validate(transactionSchema), updateTransaction);

// Xóa giao dịch
// DELETE /api/transactions/:id
transactionRouter.delete("/transactions/:id", deleteTransaction);

export default transactionRouter;

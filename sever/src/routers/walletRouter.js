import express from "express";
import {
  createWallet,
  getWallets,
  getWalletById,
  updateWallet,
  deleteWallet,
} from "../controllers/walletController.js";
import { validate } from "../middleware/validate.js";
import { walletSchema } from "../schema/walletSchema.js";

const walletRouter = express.Router();

// Lấy danh sách ví
// GET /api/wallets
walletRouter.get("/wallets", getWallets);

// Lấy chi tiết 1 ví
// GET /api/wallets/:id
walletRouter.get("/wallets/:id", getWalletById);

// Tạo ví mới
// POST /api/wallets
walletRouter.post("/wallets", validate(walletSchema), createWallet);

// Cập nhật ví
// PUT /api/wallets/:id
walletRouter.put("/wallets/:id", validate(walletSchema), updateWallet);

// Xóa ví
// DELETE /api/wallets/:id
walletRouter.delete("/wallets/:id", deleteWallet);

export default walletRouter;

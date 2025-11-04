import express from "express";
import {
  createSplit,
  getSplits,
  getSplitById,
  updateSplit,
  deleteSplit,
  getSplitsSummary,
} from "../controllers/splitController.js";
import { validate } from "../middleware/validate.js";
import { splitSchema } from "../schema/splitSchema.js";
// import { verifyToken } from "../middleware/authMiddleware.js";

const splitRouter = express.Router();

/* ================== MIDDLEWARE XÁC THỰC ================== */
// 👉 Bỏ comment để bật xác thực toàn bộ API
// splitRouter.use(verifyToken);

/* ================== CRUD CHIA TIỀN ================== */
// Tạo Split mới cùng danh sách SplitMember
splitRouter.post("/splits", validate(splitSchema), createSplit);

// Lấy danh sách Split (?teamId=... &expenseId=...)
splitRouter.get("/splits", getSplits);

// Lấy chi tiết 1 Split (kèm SplitMember)
splitRouter.get("/splits/:id", getSplitById);

// Cập nhật Split và danh sách SplitMember
splitRouter.put("/splits/:id", validate(splitSchema), updateSplit);

// Xóa Split và toàn bộ SplitMember liên quan
splitRouter.delete("/splits/:id", deleteSplit);

/* ================== TỔNG HỢP CHIA TIỀN ================== */
// Tổng hợp số dư, đã chi, đã nợ của từng thành viên
splitRouter.get("/splits/summary", getSplitsSummary);

export default splitRouter;

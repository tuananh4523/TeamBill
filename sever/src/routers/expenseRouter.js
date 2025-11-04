import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpensesSummary,
  getSummaryByCategory,
} from "../controllers/expenseController.js";
import { validate } from "../middleware/validate.js";
import { expenseSchema } from "../schema/expenseSchema.js";
// import { verifyToken } from "../middleware/authMiddleware.js";

const expenseRouter = express.Router();

/* ================== MIDDLEWARE XÁC THỰC ================== */
// 👉 Bỏ comment khi cần bảo vệ toàn bộ API
// expenseRouter.use(verifyToken);

/* ================== SUMMARY (THỐNG KÊ) ================== */
// Tổng hợp chi tiêu (lọc theo teamId, createdBy, category, status)
expenseRouter.get("/expenses/summary", getExpensesSummary);

// Tổng hợp chi tiêu theo danh mục
expenseRouter.get("/expenses/summary/category", getSummaryByCategory);

/* ================== CRUD CHI TIÊU ================== */
// Tạo mới khoản chi tiêu
expenseRouter.post("/expenses", validate(expenseSchema), createExpense);

// Lấy danh sách chi tiêu (?teamId=&createdBy=&category=&status=)
expenseRouter.get("/expenses", getExpenses);

// Lấy chi tiêu theo ID
expenseRouter.get("/expenses/:id", getExpenseById);

// Cập nhật chi tiêu
expenseRouter.put("/expenses/:id", validate(expenseSchema), updateExpense);

// Xoá chi tiêu
expenseRouter.delete("/expenses/:id", deleteExpense);

export default expenseRouter;

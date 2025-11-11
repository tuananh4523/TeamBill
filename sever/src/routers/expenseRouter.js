import express from "express";
import {
  createExpense,
  getExpensesByTeam,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";
import { validate } from "../middleware/validate.js";
import { expenseSchema } from "../schema/expenseSchema.js";

const expenseRouter = express.Router();

// ==================== CHI TIÊU ====================

// Lấy danh sách chi tiêu theo nhóm
// GET /api/expenses/team/:teamId
expenseRouter.get("/expenses/team/:teamId", getExpensesByTeam);

// Lấy chi tiết một chi tiêu
// GET /api/expenses/:id
expenseRouter.get("/expenses/:id", getExpenseById);

// Tạo chi tiêu mới
// POST /api/expenses
expenseRouter.post("/expenses", validate(expenseSchema), createExpense);

// Cập nhật chi tiêu
// PUT /api/expenses/:id
expenseRouter.put("/expenses/:id", validate(expenseSchema), updateExpense);

// Xóa chi tiêu
// DELETE /api/expenses/:id
expenseRouter.delete("/expenses/:id", deleteExpense);

export default expenseRouter;

import express from "express";
import {
  createSplit,
  getSplitsByTeam,
  getSplitByExpense,
  getSplitById,
  updateSplit,
  deleteSplit,
} from "../controllers/splitController.js";
import { validate } from "../middleware/validate.js";
import { splitSchema } from "../schema/splitSchema.js";

const splitRouter = express.Router();

// Lấy tất cả split theo team
// GET /api/splits/team/:teamId
splitRouter.get("/splits/team/:teamId", getSplitsByTeam);

// Lấy split theo expenseId
// GET /api/splits/expense/:expenseId
splitRouter.get("/splits/expense/:expenseId", getSplitByExpense);

// Lấy chi tiết 1 split
// GET /api/splits/:id
splitRouter.get("/splits/:id", getSplitById);

// Tạo split mới
// POST /api/splits
splitRouter.post("/splits", validate(splitSchema), createSplit);

// Cập nhật split
// PUT /api/splits/:id
splitRouter.put("/splits/:id", validate(splitSchema), updateSplit);

// Xóa split
// DELETE /api/splits/:id
splitRouter.delete("/splits/:id", deleteSplit);

export default splitRouter;

import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpensesSummary
} from "../controllers/expenseController.js";
import { validate } from "../middleware/validate.js";
import { expenseSchema } from "../schema/expenseSchema.js";

const expenseRouter = express.Router();
// Summary
expenseRouter.get("/expenses/summary", getExpensesSummary);
// CRUD
expenseRouter.post("/expenses", validate(expenseSchema), createExpense);
expenseRouter.put("/expenses/:id", validate(expenseSchema), updateExpense);
expenseRouter.get("/expenses", getExpenses);
expenseRouter.get("/expenses/:id", getExpenseById);
expenseRouter.delete("/expenses/:id", deleteExpense);



export default expenseRouter;

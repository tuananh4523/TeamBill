import express from "express";
import {
  createCategory,
  getCategoriesByUser,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { validate } from "../middleware/validate.js";
import { categorySchema } from "../schema/categorySchema.js";

const categoryRouter = express.Router();

categoryRouter.get("/categories", getCategoriesByUser);
categoryRouter.post("/categories", validate(categorySchema), createCategory);
categoryRouter.put("/categories/:id", validate(categorySchema), updateCategory);
categoryRouter.delete("/categories/:id", deleteCategory);

export default categoryRouter;

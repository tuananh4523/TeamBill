// routes/splitRouter.js
import express from "express";
import {
  createSplit,
  getSplits,
  getSplitById,
  updateSplit,
  deleteSplit,
  getSplitsSummary,
} from "../controllers/components/splitController.js";
import { validate } from "../../middleware/validate.js";
import { splitSchema } from "../../schema/splitSchema.js";

const splitRouter = express.Router();

splitRouter.post("/splits", validate(splitSchema), createSplit);
splitRouter.get("/splits", getSplits);
splitRouter.get("/splits/:id", getSplitById);
splitRouter.put("/splits/:id", validate(splitSchema), updateSplit);
splitRouter.delete("/splits/:id", deleteSplit);
splitRouter.get("/splits/summary", getSplitsSummary);

export default splitRouter;

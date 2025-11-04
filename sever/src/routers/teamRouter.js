import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
} from "../controllers/teamController.js";
import { validate } from "../middleware/validate.js";
import { teamSchema } from "../schema/teamSchema.js";

const teamRouter = express.Router();

// CRUD chính
teamRouter.post("/teams", validate(teamSchema), createTeam);
teamRouter.get("/teams", getTeams);
teamRouter.get("/teams/:id", getTeamById);
teamRouter.put("/teams/:id", validate(teamSchema), updateTeam);
teamRouter.delete("/teams/:id", deleteTeam);

// Lấy danh sách thành viên của 1 nhóm
teamRouter.get("/teams/:id/members", getTeamMembers);

export default teamRouter;

import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from "../controllers/teamController.js";
import { validate } from "../middleware/validate.js";
import { teamSchema } from "../schema/teamSchema.js";

const teamRouter = express.Router();

// Danh sách tất cả nhóm
// GET /api/teams
teamRouter.get("/teams", getTeams);

// Chi tiết nhóm
// GET /api/teams/:id
teamRouter.get("/teams/:id", getTeamById);

// Tạo nhóm mới
// POST /api/teams
teamRouter.post("/teams", validate(teamSchema), createTeam);

// Cập nhật nhóm
// PUT /api/teams/:id
teamRouter.put("/teams/:id", validate(teamSchema), updateTeam);

// Xóa nhóm
// DELETE /api/teams/:id
teamRouter.delete("/teams/:id", deleteTeam);

export default teamRouter;

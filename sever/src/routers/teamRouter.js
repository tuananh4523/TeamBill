// import express from "express";
// import {
//   createTeam,
//   getTeams,
//   getTeamById,
//   updateTeam,
//   deleteTeam,
// } from "../controllers/teamController.js";
// import { validate } from "../middleware/validate.js";
// import { teamSchema, teamUpdateSchema } from "../schema/teamSchema.js";

// const teamRouter = express.Router();

// // CRUD team với validate
// teamRouter.post("/teams", validate(teamSchema), createTeam);
// teamRouter.get("/teams", getTeams);
// teamRouter.get("/teams/:id", getTeamById);
// teamRouter.put("/teams/:id", validate(teamUpdateSchema), updateTeam);
// teamRouter.delete("/teams/:id", deleteTeam);A
// export default teamRouter;
import express from "express";
import Team from "../models/teamModel.js";
import Member from "../models/memberModel.js";

const router = express.Router();

/**
 * Lấy danh sách tất cả team kèm thành viên
 */
router.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find().populate("members");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Lấy chi tiết 1 team theo ID
 */
router.get("/teams/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("members");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Thêm team mới
 * POST /api/teams
 * body: { name: "Tên team" }
 */
router.post("/teams", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Team name is required" });

    const team = new Team({ name, members: [] });
    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Thêm member vào 1 team
 * POST /api/teams/:id/members
 * body: { name, email, avatar }
 */
router.post("/teams/:id/members", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const { name, email, avatar } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const member = new Member({ name, email, avatar, team: team._id });
    await member.save();

    // Thêm member vào team
    team.members.push(member._id);
    await team.save();

    res.status(201).json(await team.populate("members"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

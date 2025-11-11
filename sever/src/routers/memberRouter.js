import express from "express";
import {
  createMember,
  getMembersByTeam,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";
import { validate } from "../middleware/validate.js";
import { memberSchema } from "../schema/memberSchema.js";

const memberRouter = express.Router();

// Lấy danh sách thành viên theo team
// GET /api/members/team/:teamId
memberRouter.get("/members/team/:teamId", getMembersByTeam);

// Lấy chi tiết 1 thành viên
// GET /api/members/:id
memberRouter.get("/members/:id", getMemberById);

// Thêm thành viên mới
// POST /api/members
memberRouter.post("/members", validate(memberSchema), createMember);

// Cập nhật thông tin thành viên
// PUT /api/members/:id
memberRouter.put("/members/:id", validate(memberSchema), updateMember);

// Xóa thành viên khỏi nhóm
// DELETE /api/members/:id
memberRouter.delete("/members/:id", deleteMember);

export default memberRouter;

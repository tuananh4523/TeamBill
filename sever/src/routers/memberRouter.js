import express from "express";
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  addMemberToTeam,
} from "../controllers/memberController.js";
import { validate } from "../middleware/validate.js";
import { memberSchema } from "../schema/memberSchema.js";
// import { verifyToken } from "../middleware/authMiddleware.js";

const memberRouter = express.Router();

/* ================== MIDDLEWARE XÁC THỰC ================== */
// 👉 Bỏ comment nếu muốn bảo vệ toàn bộ API
// memberRouter.use(verifyToken);

/* ================== CRUD THÀNH VIÊN ================== */
// Lấy danh sách thành viên (?teamId=... &userId=... &status=...)
memberRouter.get("/members", getMembers);

// Lấy thông tin chi tiết 1 thành viên
memberRouter.get("/members/:id", getMemberById);

// Tạo mới một thành viên (thủ công hoặc dùng khi seed)
memberRouter.post("/members", validate(memberSchema), createMember);

// Cập nhật thông tin thành viên
memberRouter.put("/members/:id", validate(memberSchema), updateMember);

// Xoá thành viên khỏi hệ thống
memberRouter.delete("/members/:id", deleteMember);

/* ================== THÊM USER VÀO TEAM ================== */
// Thêm user vào nhóm cụ thể (teamId ở params)
memberRouter.post("/members/team/:teamId", addMemberToTeam);

export default memberRouter;

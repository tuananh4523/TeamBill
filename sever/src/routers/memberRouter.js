// routers/memberRouter.js
import express from "express";
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";

const memberRouter = express.Router();

memberRouter.get("/members", getMembers);       // GET tất cả member
memberRouter.get("/members/:id", getMemberById); // GET 1 member theo id
memberRouter.post("/members", createMember);     // POST thêm mới
memberRouter.put("/members/:id", updateMember);  // PUT cập nhật
memberRouter.delete("/members/:id", deleteMember); // DELETE xóa


export default memberRouter;

import express from "express";
import {
  registerUser,
  signin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { userSchema } from "../schema/userSchema.js";

const userRouter = express.Router();

// Đăng ký / Tạo tài khoản
userRouter.post("/users/signup", validate(userSchema), registerUser);

// Đăng nhập
userRouter.post("/users/signin", signin);

// Lấy danh sách người dùng
userRouter.get("/users", getUsers);

// Lấy chi tiết người dùng
userRouter.get("/users/:id", getUserById);

// Cập nhật người dùng
userRouter.put("/users/:id", validate(userSchema), updateUser);

// Xóa người dùng
userRouter.delete("/users/:id", deleteUser);

export default userRouter;

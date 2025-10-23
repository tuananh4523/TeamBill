import express from "express";
import { signup, signin, searchUsers } from "../controllers/userController.js";

const usersRouter = express.Router();
usersRouter.post("/user/signup", signup);
usersRouter.post("/user/signin", signin);
usersRouter.get("/users/search", searchUsers);

export default usersRouter;

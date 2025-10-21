import express from "express";
import { connectDB } from "./config/DB.js";
import usersRouter from "./routers/usersRouter.js";
import "dotenv/config";
import memberRouter from "./routers/memberRouter.js"
import expenseRouter from "./routers/expenseRouter.js";
import splitRouter from "./routers/splitRouter.js";
import teamRouter from "./routers/teamRouter.js";
import walletRouter from "./routers/walletRouter.js";

const app = express();

app.use(express.json());

console.log("usersRouter:", usersRouter);
console.log("memberRouter:", memberRouter);
console.log("expenseRouter:", expenseRouter);
console.log("splitRouter:", splitRouter);
console.log("teamRouter:", teamRouter);
// Routes
app.use("/api", usersRouter);
app.use("/api", memberRouter);
app.use("/api", expenseRouter);
app.use("/api", splitRouter);
app.use("/api", teamRouter);
app.use("/api", walletRouter);


// Kết nối DB
connectDB();

// Xuất cho vite-plugin-node
export const viteNodeApp = app;
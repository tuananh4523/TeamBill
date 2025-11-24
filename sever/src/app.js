import express from 'express'
import { connectDB } from './config/DB.js'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import usersRouter from './routers/usersRouter.js'
import memberRouter from './routers/memberRouter.js'
import expenseRouter from './routers/expenseRouter.js'
import splitRouter from './routers/splitRouter.js'
import teamRouter from './routers/teamRouter.js'
import walletRouter from './routers/walletRouter.js'
import transactionRouter from './routers/transactionRouter.js'
import paymentRouter from "./routers/paymentRouter.js";
import categoryRouter from "./routers/categoryRouter.js";

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept'
    ]
  })
)

app.options(
  /.*/,
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)

app.use(express.json())
app.use(cookieParser())

console.log('usersRouter:', usersRouter)
console.log('memberRouter:', memberRouter)
console.log('expenseRouter:', expenseRouter)
console.log('splitRouter:', splitRouter)
console.log('teamRouter:', teamRouter)
console.log('walletRouter:', walletRouter)
console.log('transactionRouter', transactionRouter)
console.log('paymentRouter', paymentRouter)
console.log('categoryRouter', categoryRouter)

// Routes components
app.use('/api', usersRouter)
app.use('/api', memberRouter)
app.use('/api', expenseRouter)
app.use('/api', splitRouter)
app.use('/api', teamRouter)
app.use('/api', walletRouter)
app.use('/api', transactionRouter)
app.use("/api", paymentRouter);
app.use("/api", categoryRouter);

// Kết nối DB
connectDB()

// Xuất cho vite-plugin-node
export const viteNodeApp = app

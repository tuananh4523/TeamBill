import express from 'express'
import { connectDB } from './config/DB.js'
import 'dotenv/config'
import cors from 'cors'
import usersRouter from './routers/usersRouter.js'
import memberRouter from './routers/memberRouter.js'
import expenseRouter from './routers/expenseRouter.js'
import splitRouter from './routers/splitRouter.js'
import teamRouter from './routers/teamRouter.js'
import walletRouter from './routers/walletRouter.js'
// import dashboardRouter from "./routes/dashboard/index.js";

const app = express()

app.use(express.json())

app.use(
  cors({
    origin: '*',
    credentials: true, // Cho phép cookie & token
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept'
    ]
  })
)
// ✅ Đáp ứng preflight thủ công (bắt buộc với credentials)
app.options(/^.*$/, (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept'
  )
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  return res.sendStatus(200)
})
// app.options(
//   '*',
//   cors({
//     origin: 'http://localhost:3000',
//     credentials: true
//   })
// )

console.log('usersRouter:', usersRouter)
console.log('memberRouter:', memberRouter)
console.log('expenseRouter:', expenseRouter)
console.log('splitRouter:', splitRouter)
console.log('teamRouter:', teamRouter)

// Xử lý các yêu cầu từ Let's Encrypt hoặc các dịch vụ tương tự
app.get(/^\/\.well-known\/.*/, (req, res) => {
  res.status(204).end()
})

// Routes components
app.use('/api', usersRouter)
app.use('/api', memberRouter)
app.use('/api', expenseRouter)
app.use('/api', splitRouter)
app.use('/api', teamRouter)
app.use('/api', walletRouter)

// Router dashboard
// app.use("/api", dashboardRouter);

// Kết nối DB
connectDB()

// Xuất cho vite-plugin-node
export const viteNodeApp = app

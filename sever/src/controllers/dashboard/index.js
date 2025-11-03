// controllers/dashboardController.js
import User from "../models/userModel.js";
import Team from "../models/teamModel.js";
import Member from "../models/memberModel.js";
import Expense from "../models/expenseModel.js";
import ViTien from "../models/walletModel.js";
import GiaoDich from "../models/transactionModel.js";
import Split, { SplitMember } from "../models/splitModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTeams,
      totalMembers,
      totalExpenses,
      totalSplits,
      walletStats,
      expenseStats,
      topSpenders,
    ] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      Member.countDocuments(),
      Expense.countDocuments(),
      Split.countDocuments(),

      ViTien.aggregate([
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$soDu" },
            totalNap: { $sum: "$tongNap" },
            totalRut: { $sum: "$tongRut" },
          },
        },
      ]),

      Expense.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),

      SplitMember.aggregate([
        {
          $group: {
            _id: "$name",
            netBalance: { $sum: "$balance" },
            totalPaid: { $sum: "$paid" },
            totalOwed: { $sum: "$owed" },
          },
        },
        { $sort: { netBalance: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Thống kê giao dịch theo tháng
    const monthlyTransactions = await GiaoDich.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          income: {
            $sum: {
              $cond: [{ $eq: ["$direction", "CONG"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$direction", "TRU"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json({
      totalUsers,
      totalTeams,
      totalMembers,
      totalExpenses,
      totalSplits,
      wallet: walletStats[0] || { totalBalance: 0, totalNap: 0, totalRut: 0 },
      expenses: expenseStats[0] || { totalAmount: 0 },
      topSpenders,
      monthlyTransactions,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu dashboard", error: err.message });
  }
};

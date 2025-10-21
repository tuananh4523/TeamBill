import Expense from "../models/expenseModel.js";

// // Tạo expense mới
// export const createExpense = async (req, res) => {
//   try {
//     const expense = await Expense.create(req.body);
//     res.status(201).json(expense);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Lấy tất cả expenses
// export const getExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find().sort({ createdAt: -1 });
//     res.json(expenses);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Lấy 1 expense theo id
// export const getExpenseById = async (req, res) => {
//   try {
//     const expense = await Expense.findById(req.params.id);
//     if (!expense) return res.status(404).json({ error: "Không tìm thấy expense" });
//     res.json(expense);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Cập nhật expense
// export const updateExpense = async (req, res) => {
//   try {
//     const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!expense) return res.status(404).json({ error: "Không tìm thấy expense" });
//     res.json(expense);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Xoá expense
// export const deleteExpense = async (req, res) => {
//   try {
//     const expense = await Expense.findByIdAndDelete(req.params.id);
//     if (!expense) return res.status(404).json({ error: "Không tìm thấy expense" });
//     res.json({ message: "Xoá thành công" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Summary (tổng hợp chi tiêu)
// export const getExpensesSummary = async (req, res) => {
//   try {
//     const total = await Expense.aggregate([
//       { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } }
//     ]);
//     if (total.length === 0) {
//       return res.json({ totalAmount: 0, count: 0 });
//     }
//     res.json(total[0]);
//   } catch (error) {
//     console.error("Summary error:", error);
//     res.status(500).json({ error: error.message });
//   }
// }

// ================== CREATE ==================
export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body)
    res.status(201).json(expense)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ================== READ ==================
// Lấy tất cả expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Lấy 1 expense theo id
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
    if (!expense) {
      return res.status(404).json({ error: 'Không tìm thấy expense' })
    }
    res.json(expense)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ================== UPDATE ==================
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!expense) {
      return res.status(404).json({ error: 'Không tìm thấy expense' })
    }
    res.json(expense)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// ================== DELETE ==================
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) {
      return res.status(404).json({ error: 'Không tìm thấy expense' })
    }
    res.json({ message: 'Xoá thành công' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ================== SUMMARY ==================
export const getExpensesSummary = async (req, res) => {
  try {
    const total = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])

    if (total.length === 0) {
      return res.json({ totalAmount: 0, count: 0 })
    }

    res.json({
      totalAmount: total[0].totalAmount,
      count: total[0].count
    })
  } catch (error) {
    console.error('❌ Summary error:', error)
    res.status(500).json({ error: error.message })
  }
}

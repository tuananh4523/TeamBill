import Expense from "../models/expenseModel.js";

/* ================== CREATE ================== */
export const createExpense = async (req, res) => {
  try {
    const {
      teamId,
      createdBy,
      title,
      amount,
      category,
      description,
      status,
      paidBy,
      splitMethod,
      date,
    } = req.body;

    if (!teamId || !createdBy || !title || !amount) {
      return res.status(400).json({
        error: "Thiếu thông tin bắt buộc (teamId, createdBy, title, amount)",
      });
    }

    const expense = await Expense.create({
      teamId,
      createdBy,
      title,
      amount,
      category,
      description,
      status: status || "PENDING",
      paidBy,
      splitMethod,
      date: date || new Date(),
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================== READ ALL ================== */
export const getExpenses = async (req, res) => {
  try {
    const filter = {};

    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const expenses = await Expense.find(filter)
      .populate("teamId", "name description")
      .populate("createdBy", "fullName email avatar")
      .populate("paidBy", "name email avatar role")
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================== READ ONE ================== */
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("teamId", "name description")
      .populate("createdBy", "fullName email avatar")
      .populate("paidBy", "name email avatar role");

    if (!expense) {
      return res.status(404).json({ error: "Không tìm thấy khoản chi tiêu" });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================== UPDATE ================== */
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!expense) {
      return res.status(404).json({ error: "Không tìm thấy khoản chi tiêu" });
    }

    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================== DELETE ================== */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Không tìm thấy khoản chi tiêu" });
    }
    res.json({ message: "Xoá thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================== SUMMARY (TỔNG HỢP) ================== */
export const getExpensesSummary = async (req, res) => {
  try {
    const match = {};

    if (req.query.teamId) match.teamId = req.query.teamId;
    if (req.query.createdBy) match.createdBy = req.query.createdBy;
    if (req.query.category) match.category = req.query.category;
    if (req.query.status) match.status = req.query.status;

    const result = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary =
      result.length > 0
        ? { totalAmount: result[0].totalAmount, count: result[0].count }
        : { totalAmount: 0, count: 0 };

    res.json(summary);
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ================== SUMMARY BY CATEGORY ================== */
export const getSummaryByCategory = async (req, res) => {
  try {
    const match = {};
    if (req.query.teamId) match.teamId = req.query.teamId;

    const result = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const formatted = result.map((r) => ({
      category: r._id || "Không xác định",
      totalAmount: r.totalAmount,
      count: r.count,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/splitController.js
import Split, { SplitMember } from "../models/splitModel.js";
import Expense from "../models/expenseModel.js";

/**
 * Tạo Split mới (và tạo luôn SplitMember tương ứng)
 */
export const createSplit = async (req, res) => {
  try {
    const { expenseId, teamId, total, method, currency, members } = req.body;

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: "Không tìm thấy Expense" });

    const split = await Split.create({ expenseId, teamId, total, method, currency });

    const membersData = members.map((m) => ({
      splitId: split._id,
      memberId: m.memberId,
      name: m.name,
      paid: m.paid,
      owed: m.owed,
      balance: m.paid - m.owed,
    }));
    await SplitMember.insertMany(membersData);

    res.status(201).json({
      message: "Tạo chia tiền thành công",
      split,
      members: membersData,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo chia tiền", error: error.message });
  }
};

/**
 * Lấy danh sách tất cả Splits (kèm các SplitMember)
 */
export const getSplits = async (req, res) => {
  try {
    const splits = await Split.find()
      .populate("expenseId", "title amount")
      .populate("teamId", "name")
      .sort({ createdAt: -1 });

    const splitsWithMembers = await Promise.all(
      splits.map(async (split) => {
        const members = await SplitMember.find({ splitId: split._id });
        return { ...split.toObject(), members };
      })
    );

    res.json(splitsWithMembers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách splits", error: error.message });
  }
};

/**
 * Lấy chi tiết 1 Split
 */
export const getSplitById = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id)
      .populate("expenseId", "title amount")
      .populate("teamId", "name");
    if (!split) return res.status(404).json({ message: "Không tìm thấy split" });

    const members = await SplitMember.find({ splitId: split._id });
    res.json({ ...split.toObject(), members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cập nhật Split & các SplitMember
 */
export const updateSplit = async (req, res) => {
  try {
    const { total, method, currency, members } = req.body;
    const split = await Split.findByIdAndUpdate(
      req.params.id,
      { total, method, currency },
      { new: true }
    );
    if (!split) return res.status(404).json({ message: "Không tìm thấy split" });

    await SplitMember.deleteMany({ splitId: split._id });
    const newMembers = members.map((m) => ({
      splitId: split._id,
      memberId: m.memberId,
      name: m.name,
      paid: m.paid,
      owed: m.owed,
      balance: m.paid - m.owed,
    }));
    await SplitMember.insertMany(newMembers);

    res.json({ message: "Cập nhật chia tiền thành công", split, members: newMembers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Xóa Split & các SplitMember liên quan
 */
export const deleteSplit = async (req, res) => {
  try {
    const split = await Split.findByIdAndDelete(req.params.id);
    if (!split) return res.status(404).json({ message: "Không tìm thấy split" });

    await SplitMember.deleteMany({ splitId: split._id });
    res.json({ message: "Xóa chia tiền thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Tổng hợp số tiền từng người
 */
export const getSplitsSummary = async (req, res) => {
  try {
    const summary = await SplitMember.aggregate([
      {
        $group: {
          _id: "$name",
          totalPaid: { $sum: "$paid" },
          totalOwed: { $sum: "$owed" },
          netBalance: { $sum: "$balance" },
          count: { $sum: 1 },
        },
      },
      { $sort: { netBalance: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tổng hợp chia tiền", error: error.message });
  }
};

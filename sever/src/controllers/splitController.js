import Split, { SplitMember } from "../models/splitModel.js";
import Expense from "../models/expenseModel.js";

/* ================== TẠO SPLIT MỚI ================== */
export const createSplit = async (req, res) => {
  try {
    const { expenseId, teamId, total, method, currency, members } = req.body;

    if (!expenseId || !teamId || typeof total !== "number" || !Array.isArray(members)) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin bắt buộc hoặc dữ liệu không hợp lệ" });
    }

    // Kiểm tra chi tiêu tồn tại
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Không tìm thấy khoản chi tiêu (Expense)" });
    }

    // Tạo Split chính
    const split = await Split.create({
      expenseId,
      teamId,
      total,
      method: method || "EQUAL",
      currency: currency || "VND",
      date: new Date(),
    });

    // Chuẩn bị danh sách thành viên chia tiền
    const membersData = members.map((m) => ({
      splitId: split._id,
      memberId: m.memberId,
      name: m.name?.trim(),
      paid: Number(m.paid) || 0,
      owed: Number(m.owed) || 0,
      balance: (Number(m.paid) || 0) - (Number(m.owed) || 0),
    }));

    await SplitMember.insertMany(membersData);

    res.status(201).json({
      message: "Tạo chia tiền thành công",
      split,
      members: membersData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo chia tiền",
      error: error.message,
    });
  }
};

/* ================== LẤY DANH SÁCH SPLIT ================== */
export const getSplits = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.expenseId) filter.expenseId = req.query.expenseId;

    const splits = await Split.find(filter)
      .populate("expenseId", "title amount category")
      .populate("teamId", "name")
      .sort({ createdAt: -1 });

    // Kèm danh sách thành viên mỗi split
    const result = await Promise.all(
      splits.map(async (split) => {
        const members = await SplitMember.find({ splitId: split._id });
        return { ...split.toObject(), members };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách chia tiền",
      error: error.message,
    });
  }
};

/* ================== LẤY CHI TIẾT 1 SPLIT ================== */
export const getSplitById = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id)
      .populate("expenseId", "title amount category")
      .populate("teamId", "name");

    if (!split) {
      return res.status(404).json({ message: "Không tìm thấy chia tiền" });
    }

    const members = await SplitMember.find({ splitId: split._id });
    res.status(200).json({ ...split.toObject(), members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================== CẬP NHẬT SPLIT ================== */
export const updateSplit = async (req, res) => {
  try {
    const { total, method, currency, members } = req.body;

    const split = await Split.findByIdAndUpdate(
      req.params.id,
      { total, method, currency },
      { new: true, runValidators: true }
    );

    if (!split) {
      return res.status(404).json({ message: "Không tìm thấy chia tiền" });
    }

    // Xóa danh sách cũ và thêm lại
    await SplitMember.deleteMany({ splitId: split._id });

    const newMembers = (members || []).map((m) => ({
      splitId: split._id,
      memberId: m.memberId,
      name: m.name?.trim(),
      paid: Number(m.paid) || 0,
      owed: Number(m.owed) || 0,
      balance: (Number(m.paid) || 0) - (Number(m.owed) || 0),
    }));

    await SplitMember.insertMany(newMembers);

    res.status(200).json({
      message: "Cập nhật chia tiền thành công",
      split,
      members: newMembers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================== XOÁ SPLIT ================== */
export const deleteSplit = async (req, res) => {
  try {
    const split = await Split.findByIdAndDelete(req.params.id);
    if (!split) {
      return res.status(404).json({ message: "Không tìm thấy chia tiền" });
    }

    await SplitMember.deleteMany({ splitId: split._id });
    res.status(200).json({ message: "Xoá chia tiền thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================== TỔNG HỢP SỐ DƯ (SUMMARY) ================== */
export const getSplitsSummary = async (req, res) => {
  try {
    const match = {};
    if (req.query.teamId) match.teamId = req.query.teamId;

    const summary = await SplitMember.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$memberId",
          name: { $first: "$name" },
          totalPaid: { $sum: "$paid" },
          totalOwed: { $sum: "$owed" },
          netBalance: { $sum: "$balance" },
          count: { $sum: 1 },
        },
      },
      { $sort: { netBalance: -1 } },
    ]);

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tổng hợp chia tiền",
      error: error.message,
    });
  }
};

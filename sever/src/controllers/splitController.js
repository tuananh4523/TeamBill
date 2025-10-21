// controllers/splitController.js
import Split from "../models/splitModel.js";

// Tạo split mới
export const createSplit = async (req, res) => {
  try {
    const split = await Split.create(req.body);
    res.status(201).json(split);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Lấy tất cả splits
export const getSplits = async (req, res) => {
  try {
    const splits = await Split.find().sort({ createdAt: -1 });
    res.json(splits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy split theo ID
export const getSplitById = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id);
    if (!split) return res.status(404).json({ error: "Không tìm thấy split" });
    res.json(split);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật split
export const updateSplit = async (req, res) => {
  try {
    const split = await Split.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!split) return res.status(404).json({ error: "Không tìm thấy split" });
    res.json(split);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xoá split
export const deleteSplit = async (req, res) => {
  try {
    const split = await Split.findByIdAndDelete(req.params.id);
    if (!split) return res.status(404).json({ error: "Không tìm thấy split" });
    res.json({ message: "Xoá thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Summary: tổng hợp số tiền từng người đã trả
export const getSplitsSummary = async (req, res) => {
  try {
    const summary = await Split.aggregate([
      { $unwind: "$members" },
      {
        $group: {
          _id: "$members.name",
          totalPaid: { $sum: "$members.paid" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

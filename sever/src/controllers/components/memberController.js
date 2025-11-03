// controllers/memberController.js
import Member from "../models/memberModel.js";
import User from "../models/userModel.js";

// Lấy danh sách tất cả member
export const getMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết 1 member theo id
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm member mới
export const createMember = async (req, res) => {
  try {
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật member
export const updateMember = async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMember) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa member
export const deleteMember = async (req, res) => {
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Member not found" });
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMemberToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role, status } = req.body;

    const exist = await Member.findOne({ teamId, userId });
    if (exist) {
      return res.status(400).json({ message: "Người dùng đã có trong nhóm" });
    }

    const user = await User.findById(userId).select("username email");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const newMember = await Member.create({
      teamId,
      userId,
      role,
      status: status || "Active",
    });

    res.status(201).json({
      _id: newMember._id,
      teamId: newMember.teamId,
      name: user.username,
      email: user.email,
      role: newMember.role,
      status: newMember.status,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
import Member from "../models/memberModel.js";
import User from "../models/userModel.js";
import Team from "../models/teamModel.js";

/* ================== LẤY DANH SÁCH THÀNH VIÊN ================== */
export const getMembers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.status) filter.status = req.query.status;

    const members = await Member.find(filter)
      .populate("userId", "fullName email avatar username")
      .populate("teamId", "name description createdAt")
      .sort({ joinedAt: -1 });

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================== LẤY CHI TIẾT MỘT THÀNH VIÊN ================== */
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate("userId", "fullName email avatar username")
      .populate("teamId", "name description");

    if (!member) {
      return res.status(404).json({ message: "Không tìm thấy thành viên" });
    }

    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================== THÊM THÀNH VIÊN ================== */
export const createMember = async (req, res) => {
  try {
    const { userId, teamId, role, status, contribution, balance, joinedAt } = req.body;

    if (!userId || !teamId) {
      return res.status(400).json({ message: "Thiếu userId hoặc teamId" });
    }

    // Kiểm tra trùng lặp
    const exist = await Member.findOne({ userId, teamId });
    if (exist) {
      return res.status(400).json({ message: "Thành viên đã tồn tại trong nhóm" });
    }

    // Lấy thông tin user để đồng bộ name, email, avatar
    const user = await User.findById(userId).select("fullName email avatar username");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const member = await Member.create({
      userId,
      teamId,
      name: user.fullName || user.username,
      email: user.email,
      avatar: user.avatar,
      role: role || "member",
      status: status || "active",
      contribution: contribution || 0,
      balance: balance || 0,
      joinedAt: joinedAt || new Date(),
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================== CẬP NHẬT THÀNH VIÊN ================== */
export const updateMember = async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMember) {
      return res.status(404).json({ message: "Không tìm thấy thành viên" });
    }

    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================== XOÁ THÀNH VIÊN ================== */
export const deleteMember = async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ message: "Không tìm thấy thành viên" });
    }
    res.status(200).json({ message: "Xoá thành viên thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================== THÊM USER VÀO TEAM ================== */
export const addMemberToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role, status } = req.body;

    if (!teamId || !userId) {
      return res.status(400).json({ message: "Thiếu teamId hoặc userId" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Không tìm thấy nhóm" });
    }

    const exist = await Member.findOne({ teamId, userId });
    if (exist) {
      return res.status(400).json({ message: "Người dùng đã có trong nhóm" });
    }

    const user = await User.findById(userId).select("username email fullName avatar");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const newMember = await Member.create({
      teamId,
      userId,
      name: user.fullName || user.username,
      email: user.email,
      avatar: user.avatar,
      role: role || "member",
      status: status || "active",
      contribution: 0,
      balance: 0,
      joinedAt: new Date(),
    });

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

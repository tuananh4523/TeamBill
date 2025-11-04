import Team from "../models/teamModel.js";
import Member from "../models/memberModel.js";

/* ================== TẠO TEAM MỚI ================== */
export const createTeam = async (req, res) => {
  try {
    const { name, description, avatar, privacy, status } = req.body;

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Tên nhóm là bắt buộc và phải có ít nhất 2 ký tự" });
    }

    const createdBy = req.user?._id || null;

    // Tạo mã nhóm duy nhất (refCode)
    const refCode = `TEAM-${Date.now().toString(36).toUpperCase()}`;

    const team = await Team.create({
      name: name.trim(),
      description: description?.trim() || "",
      avatar: avatar || "",
      refCode,
      createdBy,
      membersCount: 1,
      walletId: null,
      privacy: privacy || "private",
      status: status || "active",
      totalExpense: 0,
      lastActivity: new Date(),
    });

    res.status(201).json({
      message: "Tạo nhóm thành công",
      team,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================== LẤY DANH SÁCH TEAM ================== */
export const getTeams = async (req, res) => {
  try {
    const filter = {};
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.privacy) filter.privacy = req.query.privacy;

    const teams = await Team.find(filter)
      .populate("createdBy", "fullName email username avatar")
      .populate("walletId", "walletName balance status")
      .select(
        "_id name description avatar refCode createdBy membersCount totalExpense privacy status createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================== LẤY CHI TIẾT TEAM ================== */
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("createdBy", "fullName email username avatar")
      .populate("walletId", "walletName balance status");

    if (!team) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================== CẬP NHẬT TEAM ================== */
export const updateTeam = async (req, res) => {
  try {
    const { name, description, avatar, privacy, status } = req.body;

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        avatar,
        privacy,
        status,
        lastActivity: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!team) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    res.status(200).json({
      message: "Cập nhật nhóm thành công",
      team,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ================== XOÁ TEAM ================== */
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    await Member.deleteMany({ teamId: req.params.id });

    res.status(200).json({
      message: "Đã xoá nhóm và toàn bộ thành viên liên quan",
      deletedTeam: team,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================== LẤY DANH SÁCH THÀNH VIÊN TRONG TEAM ================== */
export const getTeamMembers = async (req, res) => {
  try {
    const members = await Member.find({ teamId: req.params.id })
      .populate("userId", "fullName email username avatar")
      .select("_id userId name email avatar role status contribution balance joinedAt createdAt");

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

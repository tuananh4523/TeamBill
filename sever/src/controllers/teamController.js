import Team from "../models/teamModel.js";
import { teamSchema } from "../schema/teamSchema.js";

/* ============================================================
   TẠO NHÓM MỚI
============================================================ */
export const createTeam = async (req, res) => {
  try {
    const { error } = teamSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const { name, description, avatar, createdBy, walletId, privacy } = req.body;

    // Tạo mã refCode ngẫu nhiên
    const refCode = `TEAM-${Date.now().toString(36).toUpperCase()}`;

    const team = await Team.create({
      name,
      description,
      avatar: avatar || "",
      refCode,
      createdBy,
      membersCount: 1,
      walletId: walletId || null,
      privacy: privacy || "private",
      status: "active",
      totalExpense: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Tạo nhóm thành công",
      team,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi tạo nhóm",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY DANH SÁCH NHÓM
============================================================ */
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách nhóm",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY NHÓM THEO ID
============================================================ */
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Không tìm thấy nhóm" });
    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy thông tin nhóm",
      error: err.message,
    });
  }
};

/* ============================================================
   CẬP NHẬT NHÓM
============================================================ */
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = teamSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedTeam)
      return res.status(404).json({ message: "Không tìm thấy nhóm để cập nhật" });

    res.status(200).json({
      message: "Cập nhật nhóm thành công",
      team: updatedTeam,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật nhóm",
      error: err.message,
    });
  }
};

/* ============================================================
   XÓA NHÓM
============================================================ */
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy nhóm để xóa" });
    res.status(200).json({ message: "Xóa nhóm thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xóa nhóm",
      error: err.message,
    });
  }
};

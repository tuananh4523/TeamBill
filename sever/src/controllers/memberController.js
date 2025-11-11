import Member from "../models/memberModel.js";
import { memberSchema } from "../schema/memberSchema.js";

/* ============================================================
   TẠO THÀNH VIÊN MỚI
============================================================ */
export const createMember = async (req, res) => {
  try {
    const { error } = memberSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const { userId, teamId, name, email, avatar, role, status, contribution, balance } =
      req.body;

    // Kiểm tra trùng email trong cùng team
    const existMember = await Member.findOne({ teamId, email });
    if (existMember)
      return res.status(400).json({ message: "Thành viên đã tồn tại trong nhóm" });

    const member = await Member.create({
      userId,
      teamId,
      name,
      email,
      avatar: avatar || "",
      role: role || "member",
      status: status || "active",
      joinedAt: new Date(),
      contribution: contribution || 0,
      balance: balance || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: "Thêm thành viên thành công",
      member,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi tạo thành viên",
      error: err.message,
    });
  }
};

/* ============================================================
   LẤY DANH SÁCH THÀNH VIÊN THEO TEAM
============================================================ */
export const getMembersByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) return res.status(400).json({ message: "Thiếu mã nhóm (teamId)" });

    const members = await Member.find({ teamId }).sort({ joinedAt: 1 });
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách thành viên",
      error: err.message,
    });
  }
};

/* ============================================================
   XEM CHI TIẾT MỘT THÀNH VIÊN
============================================================ */
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: "Không tìm thấy thành viên" });
    res.status(200).json(member);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi lấy thông tin thành viên",
      error: err.message,
    });
  }
};

/* ============================================================
   CẬP NHẬT THÀNH VIÊN
============================================================ */
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = memberSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: error.details.map((m) => m.message),
      });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedMember)
      return res.status(404).json({ message: "Không tìm thấy thành viên để cập nhật" });

    res.status(200).json({
      message: "Cập nhật thành viên thành công",
      member: updatedMember,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật thành viên",
      error: err.message,
    });
  }
};

/* ============================================================
   XÓA THÀNH VIÊN
============================================================ */
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Member.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy thành viên để xóa" });

    res.status(200).json({ message: "Xóa thành viên thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi server khi xóa thành viên",
      error: err.message,
    });
  }
};

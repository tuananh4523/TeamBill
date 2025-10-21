import Team from "../models/teamModel.js";

// Tạo team mới
export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const team = await Team.create({ name });
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Lấy tất cả teams
export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().select("_id name").sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy team theo ID
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Không tìm thấy team" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật team
export const updateTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!team) return res.status(404).json({ error: "Không tìm thấy team" });
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xoá team
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ error: "Không tìm thấy team" });
    res.json({ message: "Xoá thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy members của 1 team
export const getTeamMembers = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).select("members");
    if (!team) return res.status(404).json({ error: "Không tìm thấy team" });
    res.json(team.members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

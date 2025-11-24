import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import API, { ITeam, IMember } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ApiError {
  message?: string;
  error?: string;
}

/* ===========================================================
   LẤY DANH SÁCH NHÓM USER THAM GIA
=========================================================== */
export const useUserTeams = () => {
  const { user } = useAuth();

  return useQuery<ITeam[], AxiosError<ApiError>>({
    queryKey: ["userTeams", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const userId = String(user?.id);

      // Lấy tất cả nhóm
      const { data: allTeams } = await API.get<ITeam[]>("/teams");

      // Lấy tất cả thành viên theo từng team → chạy song song
      const membersList = await Promise.all(
        allTeams.map((team) =>
          API.get<IMember[]>(`/members/team/${team._id ?? team.id}`)
        )
      );

      // Lọc nhóm user đang thuộc về
      const userTeams = allTeams.filter((team, idx) =>
        membersList[idx].data.some((m) => m.userId === userId)
      );

      return userTeams;
    },
  });
};

/* ===========================================================
   LẤY CHI TIẾT NHÓM USER THAM GIA
=========================================================== */
export const useUserTeamById = (id?: string) => {
  const { user } = useAuth();

  return useQuery<ITeam, AxiosError<ApiError>>({
    queryKey: ["userTeam", id],
    enabled: !!id && !!user?.id,
    queryFn: async () => {
      if (!id) throw new Error("Thiếu mã nhóm.");
      const userId = String(user?.id);

      const { data: team } = await API.get<ITeam>(`/teams/${id}`);
      const { data: members } = await API.get<IMember[]>(`/members/team/${id}`);

      if (!members.some((m) => m.userId === userId))
        throw new Error("Bạn không thuộc nhóm này.");

      return team;
    },
  });
};

/* ===========================================================
   TẠO NHÓM (USER LÀ NGƯỜI TẠO)
=========================================================== */
export const useUserTeamCreate = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation<
    { message: string; team: ITeam },
    AxiosError<ApiError>,
    Partial<ITeam>
  >({
    mutationFn: async (payload) => {
      const userId = String(user?.id);

      // 1) Tạo group
      const res = await API.post<{ message: string; team: ITeam }>("/teams", {
        ...payload,
        createdBy: userId,
      });

      const team = res.data.team;
      const teamId = team._id ?? team.id;

      // 2) Tự động thêm thành viên owner
      await API.post("/members", {
        teamId,
        userId,
        name: user?.username ?? "Người tạo nhóm",
        email: user?.email ?? "",
        role: "owner",
        status: "active",
      });

      return res.data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userTeams"] });
      message.success("Tạo nhóm thành công!");
    },

    onError: (err) => {
      message.error(err.response?.data?.message || "Không thể tạo nhóm");
    },
  });
};


/* ===========================================================
   CẬP NHẬT NHÓM (CHỈ NGƯỜI TẠO)
=========================================================== */
export const useUserTeamUpdate = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation<
    { message: string; team: ITeam },
    AxiosError<ApiError>,
    { id: string; data: Partial<ITeam> }
  >({
    mutationFn: async ({ id, data }) => {
      const userId = String(user?.id);

      const { data: team } = await API.get<ITeam>(`/teams/${id}`);
      if (team.createdBy !== userId)
        throw new Error("Chỉ người tạo mới có quyền cập nhật nhóm này.");

      const res = await API.put(`/teams/${id}`, data);
      return res.data;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["userTeams"] });
      qc.invalidateQueries({ queryKey: ["userTeam", res.team._id ?? res.team.id] });
      message.success("Cập nhật nhóm thành công");
    },
    onError: (err) => {
      message.error(err.response?.data?.message || "Không thể cập nhật nhóm");
    },
  });
};

/* ===========================================================
   XÓA NHÓM
=========================================================== */
export const useUserTeamDelete = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation<
    { message: string },
    AxiosError<ApiError>,
    string
  >({
    mutationFn: async (id) => {
      const userId = String(user?.id);
      const { data: team } = await API.get<ITeam>(`/teams/${id}`);

      if (team.createdBy !== userId)
        throw new Error("Chỉ người tạo mới có quyền xóa nhóm này.");

      const res = await API.delete(`/teams/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["userTeams"] });
      message.success(res.message);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || "Không thể xóa nhóm");
    },
  });
};

/* ===========================================================
   LẤY THÀNH VIÊN THEO TEAM
=========================================================== */
export const useTeamMembers = (teamId?: string) => {
  return useQuery<IMember[], AxiosError<ApiError>>({
    queryKey: ["teamMembers", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data } = await API.get(`/members/team/${teamId}`);
      return data;
    },
  });
};

/* ===========================================================
   CẬP NHẬT TÊN NHÓM
=========================================================== */
export const useTeamRename = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation<
    { message: string; team: ITeam },
    AxiosError<ApiError>,
    { id: string; name: string }
  >({
    mutationFn: async ({ id, name }) => {
      const userId = String(user?.id);

      // Kiểm tra quyền
      const { data: team } = await API.get<ITeam>(`/teams/${id}`);
      if (team.createdBy !== userId) {
        throw new Error("Chỉ người tạo mới được sửa tên nhóm.");
      }

      // Gọi API cập nhật tên
      const res = await API.put(`/teams/${id}`, { name });
      return res.data;
    },

    onSuccess: (res) => {
      message.success(res.message || "Cập nhật tên nhóm thành công");

      qc.invalidateQueries({ queryKey: ["userTeams"] });
      qc.invalidateQueries({ queryKey: ["userTeam", res.team._id ?? res.team.id] });
    },

    onError: (err) => {
      message.error(err.response?.data?.message || "Không thể cập nhật tên nhóm");
    },
  });
};

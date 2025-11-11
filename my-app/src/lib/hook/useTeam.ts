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
    queryFn: async (): Promise<ITeam[]> => {
      if (!user?.id) throw new Error("Chưa đăng nhập.");

      // 1. Lấy danh sách tất cả nhóm
      const { data: allTeams } = await API.get<ITeam[]>("/teams");

      // 2. Lọc nhóm user tham gia
      const userTeams: ITeam[] = [];

      for (const team of allTeams) {
        const teamId = team._id || team.id;
        const { data: members } = await API.get<IMember[]>(`/members/team/${teamId}`);
        const isMember = members.some((m) => m.userId === user.id);
        if (isMember) userTeams.push(team);
      }

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
    queryKey: ["userTeam", id, user?.id],
    enabled: !!id && !!user?.id,
    queryFn: async (): Promise<ITeam> => {
      if (!user?.id) throw new Error("Chưa đăng nhập.");
      if (!id) throw new Error("Thiếu mã nhóm.");

      const { data: team } = await API.get<ITeam>(`/teams/${id}`);

      // Kiểm tra user có trong nhóm không
      const { data: members } = await API.get<IMember[]>(`/members/team/${id}`);
      const isMember = members.some((m) => m.userId === user.id);

      if (!isMember) throw new Error("Bạn không thuộc nhóm này.");
      return team;
    },
  });
};

/* ===========================================================
   TẠO NHÓM MỚI (GẮN USER HIỆN TẠI LÀ NGƯỜI TẠO)
=========================================================== */
export const useUserTeamCreate = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation<
    { message: string; team: ITeam },
    AxiosError<ApiError>,
    Omit<ITeam, "_id" | "createdBy">
  >({
    mutationFn: async (data) => {
      if (!user?.id) throw new Error("Chưa đăng nhập.");
      const payload = { ...data, createdBy: user.id };
      const res = await API.post<{ message: string; team: ITeam }>("/teams", payload);
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Tạo nhóm thành công");
      qc.invalidateQueries({ queryKey: ["userTeams"] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Không thể tạo nhóm");
    },
  });
};

/* ===========================================================
   CẬP NHẬT NHÓM (CHỈ CHO PHÉP USER LÀ NGƯỜI TẠO)
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
      if (!user?.id) throw new Error("Chưa đăng nhập.");

      // Kiểm tra quyền sở hữu nhóm
      const { data: team } = await API.get<ITeam>(`/teams/${id}`);
      if (team.createdBy !== user.id)
        throw new Error("Chỉ người tạo mới có quyền cập nhật nhóm này.");

      const res = await API.put<{ message: string; team: ITeam }>(
        `/teams/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Cập nhật nhóm thành công");
      qc.invalidateQueries({ queryKey: ["userTeams"] });
      qc.invalidateQueries({ queryKey: ["userTeam", res.team._id] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Không thể cập nhật nhóm");
    },
  });
};

/* ===========================================================
   XÓA NHÓM (CHỈ CHO PHÉP USER LÀ NGƯỜI TẠO)
=========================================================== */
export const useUserTeamDelete = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      if (!user?.id) throw new Error("Chưa đăng nhập.");

      const { data: team } = await API.get<ITeam>(`/teams/${id}`);
      if (team.createdBy !== user.id)
        throw new Error("Chỉ người tạo mới có quyền xóa nhóm này.");

      const res = await API.delete<{ message: string }>(`/teams/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Đã xóa nhóm");
      qc.invalidateQueries({ queryKey: ["userTeams"] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Không thể xóa nhóm");
    },
  });
};

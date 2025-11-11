import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import API, { IMember } from "@/lib/api";

interface ApiError {
  message?: string;
  error?: string;
}

/* Lấy danh sách thành viên theo teamId */
export const useMembersByTeam = (teamId?: string) =>
  useQuery<IMember[], AxiosError<ApiError>>({
    queryKey: ["members", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const res = await API.get<IMember[]>(`/members/team/${teamId}`);
      return res.data;
    },
  });

/* Lấy chi tiết thành viên */
export const useMemberById = (id?: string) =>
  useQuery<IMember, AxiosError<ApiError>>({
    queryKey: ["member", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await API.get<IMember>(`/members/${id}`);
      return res.data;
    },
  });

/* Thêm thành viên */
export const useMemberCreate = () => {
  const qc = useQueryClient();
  return useMutation<
    { message: string; member: IMember },
    AxiosError<ApiError>,
    IMember
  >({
    mutationFn: async (data) => {
      const res = await API.post<{ message: string; member: IMember }>(
        "/members",
        data
      );
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Thêm thành viên thành công");
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
};

/* Cập nhật thành viên */
export const useMemberUpdate = () => {
  const qc = useQueryClient();
  return useMutation<
    { message: string; member: IMember },
    AxiosError<ApiError>,
    { id: string; data: Partial<IMember> }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await API.put<{ message: string; member: IMember }>(
        `/members/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Cập nhật thành viên thành công");
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["member", res.member._id] });
    },
  });
};

/* Xóa thành viên */
export const useMemberDelete = () => {
  const qc = useQueryClient();
  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await API.delete<{ message: string }>(`/members/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Đã xóa thành viên");
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
};

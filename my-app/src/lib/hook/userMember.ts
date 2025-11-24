import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { message } from "antd";
import { api } from "../apiClient";

const KEY = "members";

/* ===============================================
   KIỂU LỖI CHUNG
=============================================== */
interface ApiError {
  message?: string;
  error?: string;
}

/* ===============================================
   KIỂU DỮ LIỆU MEMBER
=============================================== */
export interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  team?: string; // teamId
}

/* ===============================================
   LẤY DANH SÁCH TẤT CẢ MEMBERS
=============================================== */
export const useMembers = () =>
  useQuery<Member[], AxiosError<ApiError>>({
    queryKey: [KEY],
    queryFn: async () => {
      const res = await api.get("/members");
      return res.data as Member[];
    },
  });

/* ===============================================
   LẤY CHI TIẾT 1 MEMBER
=============================================== */
export const useMember = (id?: string) =>
  useQuery<Member, AxiosError<ApiError>>({
    queryKey: [KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/members/${id}`);
      return res.data as Member;
    },
  });

/* ===============================================
   TẠO MEMBER
   (Team hook style: trả về { message, member })
=============================================== */
export const useMemberCreate = () => {
  const qc = useQueryClient();

  return useMutation<
    { message: string; member: Member }, // return
    AxiosError<ApiError>,               // error
    Omit<Member, "_id">                 // payload
  >({
    mutationFn: async (data) => {
      const res = await api.post<{ message: string; member: Member }>(
        "/members",
        data
      );
      return res.data;
    },

    onSuccess: (res) => {
      message.success(res.message || "Thêm thành viên thành công");
      qc.invalidateQueries({ queryKey: [KEY] });
    },

    onError: (error) => {
      message.error(error.response?.data?.message || "Không thể tạo thành viên");
    },
  });
};

/* ===============================================
   CẬP NHẬT MEMBER
   (Team hook style: return { message, member })
=============================================== */
export const useMemberUpdate = () => {
  const qc = useQueryClient();

  return useMutation<
    { message: string; member: Member },
    AxiosError<ApiError>,
    { id: string; data: Partial<Member> }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<{ message: string; member: Member }>(
        `/members/${id}`,
        data
      );
      return res.data;
    },

    onSuccess: (res) => {
      message.success(res.message || "Cập nhật thành viên thành công");
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, res.member._id] });
    },

    onError: (error) => {
      message.error(error.response?.data?.message || "Không thể cập nhật thành viên");
    },
  });
};

/* ===============================================
   XOÁ MEMBER
   (Team hook style: return { message })
=============================================== */
export const useMemberDelete = () => {
  const qc = useQueryClient();

  return useMutation<
    { message: string },           // return
    AxiosError<ApiError>,         // error
    string                        // id
  >({
    mutationFn: async (id) => {
      const res = await api.delete<{ message: string }>(`/members/${id}`);
      return res.data;
    },

    onSuccess: (res) => {
      message.success(res.message || "Xoá thành viên thành công");
      qc.invalidateQueries({ queryKey: [KEY] });
    },

    onError: (error) => {
      message.error(error.response?.data?.message || "Không thể xoá thành viên");
    },
  });
};

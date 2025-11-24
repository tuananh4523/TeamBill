import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import API, { ISplit } from "@/lib/api";

interface ApiError {
  message?: string;
  error?: string;
}

/* ============================================================
   LẤY TẤT CẢ SPLIT THEO TEAM
============================================================ */
export const useSplitsByTeam = (teamId?: string) =>
  useQuery<ISplit[], AxiosError<ApiError>>({
    queryKey: ["splits", "team", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const res = await API.get<ISplit[]>(`/splits/team/${teamId}`);
      return res.data;
    },
  });

/* ============================================================
   LẤY SPLIT THEO expenseId
============================================================ */
export const useSplitByExpense = (expenseId?: string) =>
  useQuery<ISplit, AxiosError<ApiError>>({
    queryKey: ["split", "expense", expenseId],
    enabled: !!expenseId,
    queryFn: async () => {
      const res = await API.get<ISplit>(`/splits/expense/${expenseId}`);
      return res.data;
    },
  });

/* ============================================================
   LẤY 1 SPLIT THEO ID
============================================================ */
export const useSplitById = (id?: string) =>
  useQuery<ISplit, AxiosError<ApiError>>({
    queryKey: ["split", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await API.get<ISplit>(`/splits/${id}`);
      return res.data;
    },
  });

/* ============================================================
   TẠO SPLIT
============================================================ */
export const useSplitCreate = () => {
  const qc = useQueryClient();

  return useMutation<
    { message: string; split: ISplit },
    AxiosError<ApiError>,
    ISplit
  >({
    mutationFn: async (data) => {
      const res = await API.post<{ message: string; split: ISplit }>(
        "/splits",
        data
      );
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Tạo split thành công");
      qc.invalidateQueries({ queryKey: ["splits"] });
    },
  });
};

/* ============================================================
   CẬP NHẬT SPLIT
============================================================ */
export const useSplitUpdate = () => {
  const qc = useQueryClient();

  return useMutation<
    { message: string; split: ISplit },
    AxiosError<ApiError>,
    { id: string; data: Partial<ISplit> }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await API.put<{ message: string; split: ISplit }>(
        `/splits/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Cập nhật split thành công");
      qc.invalidateQueries({ queryKey: ["splits"] });
    },
  });
};

/* ============================================================
   XOÁ SPLIT
============================================================ */
export const useSplitDelete = () => {
  const qc = useQueryClient();

  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await API.delete<{ message: string }>(`/splits/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Xóa split thành công");
      qc.invalidateQueries({ queryKey: ["splits"] });
    },
  });
};

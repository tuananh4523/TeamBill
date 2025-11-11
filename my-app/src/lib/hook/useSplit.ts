import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import API, { ISplit } from "@/lib/api";

interface ApiError {
  message?: string;
  error?: string;
}

/* Lấy danh sách chia tiền theo teamId */
export const useSplitsByTeam = (teamId?: string) =>
  useQuery<ISplit[], AxiosError<ApiError>>({
    queryKey: ["splits", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const res = await API.get<ISplit[]>(`/splits/team/${teamId}`);
      return res.data;
    },
  });

/* Lấy chia tiền theo expenseId */
export const useSplitsByExpense = (expenseId?: string) =>
  useQuery<ISplit, AxiosError<ApiError>>({
    queryKey: ["split", expenseId],
    enabled: !!expenseId,
    queryFn: async () => {
      const res = await API.get<ISplit>(`/splits/expense/${expenseId}`);
      return res.data;
    },
  });

/* Tạo chia tiền */
export const useSplitCreate = () => {
  const qc = useQueryClient();
  return useMutation<
    { message: string; split: ISplit },
    AxiosError<ApiError>,
    ISplit
  >({
    mutationFn: async (data) => {
      const res = await API.post<{ message: string; split: ISplit }>("/splits", data);
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Tạo chia tiền thành công");
      qc.invalidateQueries({ queryKey: ["splits"] });
    },
  });
};

/* Cập nhật chia tiền */
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
      message.success(res.message || "Cập nhật chia tiền thành công");
      qc.invalidateQueries({ queryKey: ["splits"] });
    },
  });
};

/* Xóa chia tiền */
export const useSplitDelete = () => {
  const qc = useQueryClient();
  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await API.delete<{ message: string }>(`/splits/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Đã xóa chia tiền");
      qc.invalidateQueries({ queryKey: ["splits"] });
    },
  });
};

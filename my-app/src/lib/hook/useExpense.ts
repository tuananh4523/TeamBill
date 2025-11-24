import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import API, { IExpense } from "@/lib/api";

interface ApiError {
  message?: string;
  error?: string;
}

/* Lấy danh sách chi tiêu theo teamId */
export const useExpensesByTeam = (teamId?: string) =>
  useQuery<IExpense[], AxiosError<ApiError>>({
    queryKey: ["expenses", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const res = await API.get<IExpense[]>(`/expenses/team/${teamId}`);
      return res.data;
    },
  });

/* Lấy chi tiết chi tiêu */
export const useExpenseById = (id?: string) =>
  useQuery<IExpense, AxiosError<ApiError>>({
    queryKey: ["expense", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await API.get<IExpense>(`/expenses/${id}`);
      return res.data;
    },
  });

/* Tạo chi tiêu */
export const useExpenseCreate = () => {
  const qc = useQueryClient();
  return useMutation<
    { message: string; expense: IExpense },
    AxiosError<ApiError>,
    IExpense
  >({
    mutationFn: async (data) => {
      const res = await API.post<{ message: string; expense: IExpense }>(
        "/expenses",
        data
      );
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Tạo chi tiêu thành công");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

/* Cập nhật chi tiêu */
export const useExpenseUpdate = () => {
  const qc = useQueryClient();
  return useMutation<
    { message: string; expense: IExpense },
    AxiosError<ApiError>,
    { id: string; data: Partial<IExpense> }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await API.put<{ message: string; expense: IExpense }>(
        `/expenses/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Cập nhật chi tiêu thành công");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["expense", res.expense._id] });
    },
  });
};

/* Xóa chi tiêu */
export const useExpenseDelete = () => {
  const qc = useQueryClient();
  return useMutation<{ message: string }, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await API.delete<{ message: string }>(`/expenses/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      message.success(res.message || "Đã xóa chi tiêu");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });  
};

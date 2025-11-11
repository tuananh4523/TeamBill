import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import api from "@/lib/apiClient";

/* ============================================================
   TYPES
   ============================================================ */
export interface ITransaction {
  _id?: string;
  walletId: string;
  userId: string;
  code?: string;
  refCode?: string;
  type: "deposit" | "withdraw" | "transfer" | "payment";
  direction: "in" | "out";
  category?: string;
  amount: number;
  fee?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description?: string;
  status?: "pending" | "completed" | "failed";
  deviceInfo?: string;
  date?: string;
  confirmedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IApiError {
  message?: string;
  error?: string;
}

/* ============================================================
   HOOKS - TRANSACTION
   ============================================================ */

/** Lấy danh sách giao dịch theo walletId */
export const useTransactionsByWallet = (walletId: string) =>
  useQuery<ITransaction[], AxiosError<IApiError>>({
    queryKey: ["transactions", "wallet", walletId],
    queryFn: async () => {
      const res = await api.get<ITransaction[]>(
        `/transactions/wallet/${walletId}`
      );
      return res.data;
    },
    enabled: !!walletId,
  });

/** Lấy chi tiết giao dịch */
export const useTransactionById = (id: string) =>
  useQuery<ITransaction, AxiosError<IApiError>>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const res = await api.get<ITransaction>(`/transactions/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

/** Tạo giao dịch mới */
export const useCreateTransaction = () => {
  const qc = useQueryClient();

  return useMutation<
    { message: string; transaction: ITransaction },
    AxiosError<IApiError>,
    Omit<ITransaction, "_id" | "createdAt" | "updatedAt">
  >({
    mutationFn: async (data) => {
      const res = await api.post<{ message: string; transaction: ITransaction }>(
        "/transactions",
        data
      );
      return res.data;
    },
    onSuccess: () => {
      message.success("Tạo giao dịch thành công");
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Lỗi khi tạo giao dịch");
    },
  });
};

/** Cập nhật giao dịch */
export const useUpdateTransaction = () => {
  const qc = useQueryClient();

  return useMutation<
    { message: string; transaction: ITransaction },
    AxiosError<IApiError>,
    { id: string; data: Partial<ITransaction> }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<{ message: string; transaction: ITransaction }>(
        `/transactions/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật giao dịch thành công");
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật giao dịch");
    },
  });
};

/** Xóa giao dịch */
export const useDeleteTransaction = () => {
  const qc = useQueryClient();

  return useMutation<{ message: string }, AxiosError<IApiError>, string>({
    mutationFn: async (id) => {
      const res = await api.delete<{ message: string }>(`/transactions/${id}`);
      return res.data;
    },
    onSuccess: () => {
      message.success("Đã xóa giao dịch");
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Lỗi khi xóa giao dịch");
    },
  });
};

/** Lấy tất cả giao dịch của người dùng (nhiều ví) */
export const useTransactionsByUser = (userId: string) =>
  useQuery<ITransaction[], AxiosError<IApiError>>({
    queryKey: ["transactions", "user", userId],
    queryFn: async () => {
      const res = await api.get<ITransaction[]>("/transactions", {
        params: { userId },
      });
      return res.data;
    },
    enabled: !!userId,
  });

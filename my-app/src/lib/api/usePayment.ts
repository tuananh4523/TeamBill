import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "payments";

export type PaymentStatus = "HOÀN TẤT" | "THẤT BẠI" | "ĐANG XỬ LÝ";

export interface Payment {
  _id: string;
  name: string;
  date: string;
  amount: number;
  status: PaymentStatus;
}

// Lấy danh sách thanh toán
export const usePayments = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: async () => (await api.get("/payments")).data as Payment[],
  });

// Thêm thanh toán
export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Payment, "_id">) =>
      (await api.post("/payments", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// Cập nhật
export const useUpdatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Payment) =>
      (await api.put(`/payments/${data._id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// Xóa
export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/payments/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

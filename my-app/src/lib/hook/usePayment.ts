import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import api from "@/lib/apiClient";

export interface IPayment {
  userId: string;
  amount: number;
  description?: string;
  type: "NAP" | "RUT" | "CHUYEN" | "THANHTOAN";
}

interface IApiError {
  message?: string;
  error?: string;
}

export const useCreatePayment = () => {
  return useMutation<{ message: string; balance: number }, AxiosError<IApiError>, IPayment>({
    mutationFn: async (data) => {
      const res = await api.post<{ message: string; balance: number }>("/transactions", data);
      return res.data;
    },
    onSuccess: (data) => {
      message.success(`Giao dịch thành công. Số dư mới: ${data.balance.toLocaleString()}₫`);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Lỗi khi tạo giao dịch");
    },
  });
};

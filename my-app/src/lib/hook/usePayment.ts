import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import api from "@/lib/apiClient";


interface IApiError {
  message?: string;
  error?: string;
}

export interface ITransaction {
  id: string;
  walletId: string;
  userId: string;
  code: string;
  refCode: string;
  type: "deposit" | "withdraw" | "transfer" | "payment";
  direction: "in" | "out";
  category?: string;
  amount: number;
  fee: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  status: "pending" | "completed" | "failed";
  deviceInfo?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  walletId: string;
  userId: string;
  type: "deposit" | "withdraw" | "transfer" | "payment";
  direction: "in" | "out";
  amount: number;
  description?: string;
  category?: string;
}


interface ICreatePaymentResponse {
  message: string;
  transaction: ITransaction;
}

export const useCreatePayment = () => {
  return useMutation<ICreatePaymentResponse, AxiosError<IApiError>, IPayment>({
    mutationFn: async (data) => {
      const res = await api.post<ICreatePaymentResponse>("/transactions", data);
      return res.data;
    },

    onSuccess: (res) => {
      message.success(res.message || "Giao dịch thành công");
    },

    onError: (error) => {
      message.error(error.response?.data?.message || "Lỗi khi tạo giao dịch");
    },
  });
};

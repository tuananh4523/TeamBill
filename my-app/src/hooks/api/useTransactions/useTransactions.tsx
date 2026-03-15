import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import {
  Transaction,
  TransactionListResponse,
  TransactionDetailResponse,
  CreateTransactionPayload,
  UpdateTransactionPayload
} from "@/types"

/** API trả về array trực tiếp. */
export function useGetTransactionsByWallet(walletId: string) {
  return useQuery({
    queryKey: ["transactions", walletId],
    queryFn: async () => {
      const res = await apiClient<Transaction[] | TransactionListResponse>(
        `/transactions/wallet/${walletId}`
      )
      return Array.isArray(res) ? res : (res as TransactionListResponse).data ?? []
    },
    enabled: !!walletId
  })
}

/** API trả về transaction trực tiếp (không bọc { data }). */
export function useGetTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const res = await apiClient<Transaction | TransactionDetailResponse>(
        `/transactions/${id}`
      )
      return (res as TransactionDetailResponse).data ?? (res as Transaction)
    },
    enabled: !!id
  })
}


// tạo transaction
export function useCreateTransaction() {

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTransactionPayload) => {
      const res = await apiClient<Transaction | TransactionDetailResponse>(
        `/transactions`,
        { method: "POST", body: payload }
      )
      return (res as TransactionDetailResponse).data ?? (res as Transaction)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }
  })
}


// cập nhật transaction
export function useUpdateTransaction() {

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string
      payload: UpdateTransactionPayload
    }) => {

      const res = await apiClient<Transaction | TransactionDetailResponse>(
        `/transactions/${id}`,
        { method: "PUT", body: payload }
      )
      return (res as TransactionDetailResponse).data ?? (res as Transaction)
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }
  })
}


// xoá transaction
export function useDeleteTransaction() {

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(`/transactions/${id}`, { method: "DELETE" }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }
  })
}
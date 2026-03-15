import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import {
  VietQRDepositPayload,
  VietQRDepositResponse,
  ConfirmDepositResponse
} from "@/types"

export function useCreateVietQRDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      walletId,
      data
    }: {
      walletId: string
      data: VietQRDepositPayload
    }) =>
      apiClient<VietQRDepositResponse>(
        `/payments/wallet/${walletId}/deposit/vietqr`,
        { method: "POST", body: data }
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
    }
  })
}


// xác nhận đã chuyển khoản
export function useConfirmDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactionId: string) =>
      apiClient<ConfirmDepositResponse>(
        `/payments/deposit/${transactionId}/confirm`,
        { method: "POST" }
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["wallets"] })
    }
  })
}
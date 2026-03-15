import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import { Wallet, CreateWalletPayload, UpdateWalletPayload } from "@/types"

export function useGetWalletsQuery() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: () => apiClient<Wallet[]>("/wallets"),
  })
}

export function useGetWallets() {
  return { getWallets: () => apiClient<Wallet[]>("/wallets") }
}

export function useGetWallet() {
  return {
    getWallet: (id: string) =>
      apiClient<{ data: Wallet } | Wallet>(`/wallets/${id}`).then(
        (r) => ("data" in r && r.data ? r.data : (r as Wallet))
      ),
  }
}

export function useCreateWallet() {
  return {
    createWallet: (data: CreateWalletPayload) =>
      apiClient<{ wallet: Wallet }>("/wallets", { method: "POST", body: data }),
  }
}

export function useUpdateWallet() {
  return {
    updateWallet: (id: string, data: UpdateWalletPayload) =>
      apiClient<{ wallet: Wallet }>(`/wallets/${id}`, { method: "PUT", body: data }),
  }
}

export function useDeleteWallet() {
  return {
    deleteWallet: (id: string) =>
      apiClient<{ message: string }>(`/wallets/${id}`, { method: "DELETE" }),
  }
}
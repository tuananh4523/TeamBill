import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/apiClient"
import { Split } from "@/types"

export function useGetSplitsByTeam(teamId: string) {
  return useQuery({
    queryKey: ["splits", "team", teamId],
    queryFn: () => apiClient<Split[]>(`/splits/team/${teamId}`),
    enabled: !!teamId,
  })
}

export function useGetSplitByExpense(expenseId: string) {
  return useQuery({
    queryKey: ["splits", "expense", expenseId],
    queryFn: () => apiClient<Split>(`/splits/expense/${expenseId}`),
    enabled: !!expenseId,
  })
}

export function useGetSplit(id: string) {
  return useQuery({
    queryKey: ["split", id],
    queryFn: () => apiClient<Split>(`/splits/${id}`),
    enabled: !!id,
  })
}

export function useCreateSplit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Split>) =>
      apiClient(`/splits`, { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["splits"] })
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })
}

export function useUpdateSplit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Split> }) =>
      apiClient(`/splits/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["splits"] })
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })
}

export function useDeleteSplit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/splits/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["splits"] })
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })
}
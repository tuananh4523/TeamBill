import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Expense, CreateExpensePayload, UpdateExpensePayload } from "@/types";

export function useGetExpensesByTeam(teamId: string) {
  return useQuery({
    queryKey: ["expenses", teamId],
    queryFn: () => apiClient<Expense[]>(`/expenses/team/${teamId}`),
    enabled: !!teamId,
  });
}

export function useGetExpense(id: string) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => apiClient<Expense>(`/expenses/${id}`),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpensePayload) =>
      apiClient<Expense>(`/expenses`, { method: "POST", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpensePayload }) =>
      apiClient<Expense>(`/expenses/${id}`, { method: "PUT", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(`/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

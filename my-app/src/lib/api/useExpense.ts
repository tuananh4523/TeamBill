import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "expenses";

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  status: "CHỜ" | "HOÀN TẤT";
  person: string;
  date: string;
}

export const useExpenses = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: async () => (await api.get("/expenses")).data as Expense[],
  });

export const useExpense = (id: string) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => (await api.get(`/expenses/${id}`)).data as Expense,
    enabled: !!id,
  });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Expense, "_id">) =>
      (await api.post("/expenses", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Expense) =>
      (await api.put(`/expenses/${data._id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.delete(`/expenses/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useExpensesSummary = () =>
  useQuery({
    queryKey: [KEY, "summary"],
    queryFn: async () => (await api.get("/expenses/summary")).data,
  });

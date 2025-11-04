import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "splits";

export interface SplitMember {
  memberId: string;
  name: string;
  paid: number;
  owed: number;
  balance?: number;
}

export interface Split {
  _id: string;
  expenseId: string;
  teamId: string;
  total: number;
  method: "EQUAL" | "PERCENTAGE" | "CUSTOM";
  currency: string;
  members: SplitMember[];
}

export const useSplits = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: async () => (await api.get("/splits")).data as Split[],
  });

export const useSplit = (id: string) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => (await api.get(`/splits/${id}`)).data as Split,
    enabled: !!id,
  });

export const useCreateSplit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Split, "_id">) =>
      (await api.post("/splits", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateSplit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Split) =>
      (await api.put(`/splits/${data._id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteSplit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.delete(`/splits/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useSplitsSummary = () =>
  useQuery({
    queryKey: [KEY, "summary"],
    queryFn: async () => (await api.get("/splits/summary")).data,
  });

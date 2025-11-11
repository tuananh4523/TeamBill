import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "members";

export interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  team?: string;
}

export const useMembers = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: async () => (await api.get("/members")).data as Member[],
  });

export const useMember = (id: string) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => (await api.get(`/members/${id}`)).data as Member,
    enabled: !!id,
  });

export const useCreateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Member, "_id">) =>
      (await api.post("/members", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Member) =>
      (await api.put(`/members/${data._id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.delete(`/members/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

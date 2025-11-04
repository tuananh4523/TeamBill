import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "teams";

export interface Team {
  _id: string;
  name: string;
  members: Member[];
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useTeams = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: async () => (await api.get("/teams")).data as Team[],
  });

export const useTeam = (id: string) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => (await api.get(`/teams/${id}`)).data as Team,
    enabled: !!id,
  });

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) =>
      (await api.post("/teams", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useAddMemberToTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      member,
    }: {
      teamId: string;
      member: Omit<Member, "_id">;
    }) =>
      (await api.post(`/teams/${teamId}/members`, member)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Team } from "@/types";

export function useGetTeamsQuery() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => apiClient<Team[]>("/teams"),
  });
}

export function useGetTeams() {
  return { getTeams: () => apiClient<Team[]>("/teams") };
}

export function useGetTeam() {
  return { getTeam: (id: string) => apiClient<Team>(`/teams/${id}`) };
}

export function useCreateTeam() {
  return {
    createTeam: (data: Partial<Team>) =>
      apiClient("/teams", { method: "POST", body: data }),
  };
}

export function useUpdateTeam() {
  return {
    updateTeam: (id: string, data: Partial<Team>) =>
      apiClient(`/teams/${id}`, { method: "PUT", body: data }),
  };
}

export function useDeleteTeam() {
  return {
    deleteTeam: (id: string) =>
      apiClient(`/teams/${id}`, { method: "DELETE" }),
  };
}

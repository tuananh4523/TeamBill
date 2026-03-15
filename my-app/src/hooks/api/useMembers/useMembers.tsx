import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Member, CreateMemberPayload, UpdateMemberPayload } from "@/types";

export function useGetMembersByTeam(teamId: string) {
  return useQuery<Member[]>({
    queryKey: ["members", teamId],
    queryFn: () => apiClient<Member[]>(`/members/team/${teamId}`),
    enabled: Boolean(teamId),
  });
}

export function useGetMember(id: string) {
  return useQuery<Member>({
    queryKey: ["member", id],
    queryFn: () => apiClient<Member>(`/members/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMemberPayload) =>
      apiClient<Member>(`/members`, { method: "POST", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberPayload }) =>
      apiClient<Member>(`/members/${id}`, { method: "PUT", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(`/members/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });
}

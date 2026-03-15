import { apiClient } from "@/lib/apiClient";
import { User } from "@/types";

export function useGetUsers() {
  return { getUsers: () => apiClient<User[]>("/users") };
}

export function useGetUser() {
  return { getUser: (id: string) => apiClient<User>(`/users/${id}`) };
}

export function useUpdateUser() {
  return {
    updateUser: (id: string, data: Partial<User>) =>
      apiClient(`/users/${id}`, { method: "PUT", body: data }),
  };
}

export function useDeleteUser() {
  return {
    deleteUser: (id: string) =>
      apiClient(`/users/${id}`, { method: "DELETE" }),
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "categories";

export interface Category {
  _id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Lấy danh sách
export const useCategories = () =>
  useQuery<Category[]>({
    queryKey: [KEY],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });

// Lấy 1 category
export const useCategory = (id: string) =>
  useQuery<Category>({
    queryKey: [KEY, id],
    queryFn: async () => (await api.get<Category>(`/categories/${id}`)).data,
    enabled: !!id,
  });

// Tạo mới
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation<Category, Error, Omit<Category, "_id" | "createdAt" | "updatedAt">>({
    mutationFn: async (data) =>
      (await api.post<Category>("/categories", data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// Cập nhật
export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation<Category, Error, Category>({
    mutationFn: async (data) =>
      (await api.put<Category>(`/categories/${data._id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

// Xóa
export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id) =>
      (await api.delete<{ message: string }>(`/categories/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

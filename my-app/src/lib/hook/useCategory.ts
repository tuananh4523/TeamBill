import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../apiClient";

const KEY = "categories";

export interface Category {
  _id: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/* ============================================================
   LẤY DANH MỤC THEO USER
   GET /categories?userId=xxx
============================================================ */
export const useCategories = (userId?: string) =>
  useQuery<Category[]>({
    queryKey: [KEY, userId],
    enabled: !!userId,
    queryFn: async () =>
      (await api.get<Category[]>(`/categories?userId=${userId}`)).data,
  });

/* ============================================================
   LẤY 1 CATEGORY (nếu bạn thêm API GET /categories/:id)
============================================================ */
export const useCategory = (id?: string) =>
  useQuery<Category>({
    queryKey: [KEY, id],
    enabled: !!id,
    queryFn: async () =>
      (await api.get<Category>(`/categories/${id}`)).data,
  });

/* ============================================================
   TẠO CATEGORY
   POST /categories
============================================================ */
export interface CategoryCreateDTO {
  userId: string;
  name: string;
  color: string;
  description?: string;
}

export const useCreateCategory = () => {
  const qc = useQueryClient();

  return useMutation<Category, Error, CategoryCreateDTO>({
    mutationFn: async (data) =>
      (await api.post<Category>("/categories", data)).data,

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [KEY, variables.userId] });
    },
  });
};

/* ============================================================
   CẬP NHẬT CATEGORY
   PUT /categories/:id
============================================================ */
export interface CategoryUpdateDTO {
  _id: string;
  userId: string;
  name?: string;
  color?: string;
  description?: string;
}

export const useUpdateCategory = () => {
  const qc = useQueryClient();

  return useMutation<Category, Error, CategoryUpdateDTO>({
    mutationFn: async (data) =>
      (
        await api.put<Category>(`/categories/${data._id}`, {
          name: data.name,
          color: data.color,
          description: data.description,
          userId: data.userId,
        })
      ).data,

    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [KEY, vars.userId] });
    },
  });
};

/* ============================================================
   XÓA CATEGORY
   DELETE /categories/:id
============================================================ */
export const useDeleteCategory = () => {
  const qc = useQueryClient();

  return useMutation<{ message: string }, Error, { id: string; userId: string }>(
    {
      mutationFn: async ({ id }) =>
        (await api.delete<{ message: string }>(`/categories/${id}`)).data,

      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: [KEY, vars.userId] });
      },
    }
  );
};

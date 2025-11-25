import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  ICategory,
} from "@/lib/api";

const KEY = "categories";

/* ============================================================
   1) GET CATEGORY LIST BY USER (array trực tiếp)
============================================================ */
export const useCategories = (userId?: string) =>
  useQuery<ICategory[]>({
    queryKey: [KEY, userId],
    enabled: !!userId,

    queryFn: async () => {
      const res = await getCategories(userId!);

      // backend trả về array trực tiếp
      return Array.isArray(res.data) ? res.data : [];
    },
  });

/* ============================================================
   2) GET CATEGORY BY ID (object trực tiếp)
============================================================ */
export const useCategory = (id?: string) =>
  useQuery<ICategory>({
    queryKey: [KEY, id],
    enabled: !!id,

    queryFn: async () => {
      const res = await getCategoryById(id!);
      return res.data;
    },
  });

/* ============================================================
   3) CREATE CATEGORY
============================================================ */
export interface CategoryCreateDTO {
  userId: string;
  name: string;
  color: string;
  description?: string;
}

export const useCreateCategory = () => {
  const qc = useQueryClient();

  return useMutation<ICategory, Error, CategoryCreateDTO>({
    mutationFn: async (dto) => {
      const res = await createCategory(dto);
      return res.data.category; // backend trả { category }
    },

    onSuccess: (_, dto) => {
      qc.invalidateQueries({ queryKey: [KEY, dto.userId] });
    },
  });
};

/* ============================================================
   4) UPDATE CATEGORY
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

  return useMutation<ICategory, Error, CategoryUpdateDTO>({
    mutationFn: async (dto) => {
      const res = await updateCategory(dto._id, {
        name: dto.name,
        color: dto.color,
        description: dto.description,
        userId: dto.userId,
      });

      return res.data.category;
    },

    onSuccess: (_, dto) => {
      qc.invalidateQueries({ queryKey: [KEY, dto.userId] });
      qc.invalidateQueries({ queryKey: [KEY, dto._id] });
    },
  });
};

/* ============================================================
   5) DELETE CATEGORY
============================================================ */
export interface CategoryDeleteVars {
  id: string;
  userId: string;
}

export const useDeleteCategory = () => {
  const qc = useQueryClient();

  return useMutation<{ message: string }, Error, CategoryDeleteVars>({
    mutationFn: async ({ id }) => {
      const res = await deleteCategory(id);
      return res.data; 
    },

    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [KEY, vars.userId] });
    },
  });
};

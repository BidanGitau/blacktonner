import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Category } from "~/types";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (page: number, limit: number, search?: string) =>
    [...categoryKeys.lists(), { page, limit, search }] as const,
};

export function useCategories(params?: { page?: number; limit?: number; search?: string }) {
  const { page = 1, limit = 20, search } = params || {};
  return useQuery({
    queryKey: categoryKeys.list(page, limit, search),
    queryFn: () =>
      api
        .get<Category[]>("/categories", { params: { page, limit, search } })
        .then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCategoriesCount(search?: string) {
  return useQuery({
    queryKey: [...categoryKeys.all, "count", search],
    queryFn: () =>
      api.get<number>("/categories/count", { params: { search } }).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string }) =>
      api.post<Category>("/categories", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    meta: { toast: { success: "Category created" } },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; slug?: string; description?: string }) =>
      api.patch<Category>(`/categories/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    meta: { toast: { success: "Category updated" } },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    meta: { toast: { success: "Category deleted" } },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Product } from "~/types";

export const productKeys = {
  all: ["products"] as const,
  list: (params: object) => [...productKeys.all, params] as const,
  detail: (slug: string) => [...productKeys.all, slug] as const,
};

interface ProductParams {
  category?: string;
  featured?: boolean;
  badge?: string;
  search?: string;
  limit?: number;
  page?: number;
  active?: boolean;
}

export function useProducts(params: ProductParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => api.get<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }>("/products", { params }).then((r) => r.data),
  });
}

export function useProduct(slugOrId: string) {
  return useQuery({
    queryKey: productKeys.detail(slugOrId),
    queryFn: () => api.get<Product>(`/products/${slugOrId}`).then((r) => r.data),
    enabled: !!slugOrId,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product> & { categoryId: string }) =>
      api.post<Product>("/products", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
    meta: { toast: { success: "Product created" } },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Product> & { id: string }) =>
      api.patch<Product>(`/products/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
    meta: { toast: { success: "Product updated" } },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
    meta: { toast: { success: "Product deleted" } },
  });
}

export interface ImportRow {
  name?: string; sku?: string; category?: string;
  brand?: string; slug?: string; description?: string;
  price?: string | number; originalPrice?: string | number;
  costPrice?: string | number; stock?: string | number;
  images?: string; featured?: string | boolean; active?: string | boolean;
}

export interface ImportResult {
  created: number;
  updated: number;
  failed: { row: number; sku?: string; error: string }[];
}

export function useImportProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: ImportRow[]) =>
      api.post<ImportResult>("/products/import", { rows }).then((r) => r.data),
    onSuccess: (result) =>
      qc.invalidateQueries({ queryKey: productKeys.all }).then(() => result),
    // Import has rich result data — let caller surface it instead of generic toast
    meta: { toast: { success: undefined } },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Product, Category, Order, AdminStats, PaginatedResponse } from "~/types";

export const productKeys = {
  all: ["products"] as const,
  list: (params: object) => [...productKeys.all, params] as const,
  detail: (slug: string) => [...productKeys.all, slug] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
};

export const orderKeys = {
  all: ["orders"] as const,
  list: (params: object) => [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, id] as const,
  stats: ["orders", "stats"] as const,
};

interface ProductParams {
  category?: string;
  featured?: boolean;
  badge?: string;
  search?: string;
  limit?: number;
  active?: boolean;
}

interface OrderParams {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useProducts(params: ProductParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => api.get<Product[]>("/products", { params }).then((r) => r.data),
  });
}

export function useProduct(slugOrId: string) {
  return useQuery({
    queryKey: productKeys.detail(slugOrId),
    queryFn: () => api.get<Product>(`/products/${slugOrId}`).then((r) => r.data),
    enabled: !!slugOrId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => api.get<Category[]>("/categories").then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product> & { categoryId: string }) =>
      api.post<Product>("/products", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Product> & { id: string }) =>
      api.patch<Product>(`/products/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useImportProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (csv: string) => api.post("/products/import", { csv }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useAdminOrders(params: OrderParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () =>
      api.get<PaginatedResponse<Order>>("/orders", { params }).then((r) => r.data),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: () => api.get<Order[]>("/orders").then((r) => r.data),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => api.get<Order>(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats,
    queryFn: () => api.get<AdminStats>("/orders/stats").then((r) => r.data),
    staleTime: 1000 * 60,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<Order>(`/orders/${id}/status`, { status }).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      qc.invalidateQueries({ queryKey: orderKeys.stats });
    },
  });
}

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Order>(`/orders/${id}/confirm`).then((r) => r.data),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      qc.invalidateQueries({ queryKey: orderKeys.stats });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string }) =>
      api.post<Category>("/categories", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; slug?: string; description?: string }) =>
      api.patch<Category>(`/categories/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<{ token: string; user: any }>("/auth/login", data).then((r) => r.data),
  });
}

export function useUpload() {
  return useMutation({
    mutationFn: (data: { filename: string; data: string }) =>
      api.post<{ url: string }>("/uploads", data).then((r) => r.data),
  });
}

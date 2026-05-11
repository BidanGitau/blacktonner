import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Order, AdminStats, PaginatedResponse } from "~/types";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params: object) => [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, id] as const,
  stats: ["orders", "stats"] as const,
};

interface OrderParams {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
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

interface CreateOrderPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  deliveryZone: string;
  deliveryFee: number;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      api.post<Order>("/orders", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      qc.invalidateQueries({ queryKey: orderKeys.stats });
    },
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
    meta: { toast: { success: "Order status updated" } },
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
    meta: { toast: { success: "Order confirmed" } },
  });
}

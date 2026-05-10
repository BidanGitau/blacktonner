import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Customer } from "~/types";

export const customerKeys = {
  all: ["customers"] as const,
  list: (q: string) => [...customerKeys.all, "list", q] as const,
  detail: (id: string) => [...customerKeys.all, id] as const,
};

export function useCustomers(q = "") {
  return useQuery({
    queryKey: customerKeys.list(q),
    queryFn: () => api.get<Customer[]>("/admin/customers", { params: { q } }).then((r) => r.data),
    staleTime: 1000 * 30,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => api.get<Customer>(`/admin/customers/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Customer> & { id: string }) =>
      api.patch<Customer>(`/admin/customers/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.detail(vars.id) });
    },
    meta: { toast: { success: "Customer updated" } },
  });
}

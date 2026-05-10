import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Invoice, InvoiceStats, InvoiceStatus } from "~/types";
import { customerKeys } from "./customers";

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (params: object) => [...invoiceKeys.all, "list", params] as const,
  detail: (id: string) => [...invoiceKeys.all, id] as const,
  stats: ["invoices", "stats"] as const,
};

interface InvoiceListParams {
  status?: InvoiceStatus | "all";
  customerId?: string;
  search?: string;
}

export function useInvoices(params: InvoiceListParams = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => api.get<Invoice[]>("/admin/invoices", { params }).then((r) => r.data),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => api.get<Invoice>(`/admin/invoices/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: invoiceKeys.stats,
    queryFn: () => api.get<InvoiceStats>("/admin/invoices/stats").then((r) => r.data),
    staleTime: 1000 * 60,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      api.post<Invoice>("/admin/invoices", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.all });
    },
    meta: { toast: { success: "Invoice created" } },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: any) =>
      api.patch<Invoice>(`/admin/invoices/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars: any) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      qc.invalidateQueries({ queryKey: invoiceKeys.detail(vars.id) });
    },
    meta: { toast: { success: "Invoice updated" } },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.all }),
    meta: { toast: { success: "Invoice deleted" } },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Ticket, TicketStats, TicketUpdate, TicketStatus, TicketPriority } from "~/types";

export const ticketKeys = {
  all: ["tickets"] as const,
  list: (params: object) => [...ticketKeys.all, "list", params] as const,
  detail: (id: string) => [...ticketKeys.all, id] as const,
  stats: ["tickets", "stats"] as const,
  techs: ["tickets", "technicians"] as const,
};

interface TicketListParams {
  status?: TicketStatus | "all";
  assignedToId?: string;
  customerId?: string;
  priority?: TicketPriority;
  search?: string;
}

export function useTickets(params: TicketListParams = {}) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => api.get<Ticket[]>("/admin/tickets", { params }).then((r) => r.data),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => api.get<Ticket>(`/admin/tickets/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ticketKeys.stats,
    queryFn: () => api.get<TicketStats>("/admin/tickets/stats").then((r) => r.data),
    staleTime: 1000 * 60,
  });
}

export function useTicketTechnicians() {
  return useQuery({
    queryKey: ticketKeys.techs,
    queryFn: () =>
      api.get<{ id: string; name: string; email: string; role: string }[]>("/admin/tickets/technicians")
        .then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) =>
      api.post<Ticket>("/admin/tickets", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
    meta: { toast: { success: "Ticket raised" } },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: any) =>
      api.patch<Ticket>(`/admin/tickets/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars: any) => {
      qc.invalidateQueries({ queryKey: ticketKeys.all });
      qc.invalidateQueries({ queryKey: ticketKeys.detail(vars.id) });
    },
    // Quiet on success — many UI controls write back here (assign, schedule,
    // priority). Errors still toast via the default fallback.
  });
}

export function useAddTicketUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, body, authorId }: { ticketId: string; body: string; authorId?: string }) =>
      api.post<TicketUpdate>(`/admin/tickets/${ticketId}/updates`, { body, authorId }).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(vars.ticketId) });
      qc.invalidateQueries({ queryKey: ticketKeys.all });
    },
    meta: { toast: { success: "Update posted" } },
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tickets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKeys.all }),
    meta: { toast: { success: "Ticket deleted" } },
  });
}

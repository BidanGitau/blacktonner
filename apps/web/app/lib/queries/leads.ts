import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Lead, LeadActivity, LeadAgent, LeadPipelineStat, LeadStatus } from "~/types";

export const leadKeys = {
  all: ["leads"] as const,
  list: (params: object) => [...leadKeys.all, "list", params] as const,
  detail: (id: string) => [...leadKeys.all, "detail", id] as const,
  pipeline: ["leads", "pipeline"] as const,
  agents: ["leads", "agents"] as const,
};

interface LeadListParams {
  status?: LeadStatus | "all";
  assignedToId?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => api.get<{ data: Lead[]; total: number; page: number; limit: number; totalPages: number }>("/admin/leads", { params }).then((r) => r.data),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => api.get<Lead>(`/admin/leads/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useLeadAgents() {
  return useQuery({
    queryKey: leadKeys.agents,
    queryFn: () => api.get<LeadAgent[]>("/admin/leads/agents").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLeadPipeline() {
  return useQuery({
    queryKey: leadKeys.pipeline,
    queryFn: () => api.get<LeadPipelineStat[]>("/admin/leads/pipeline").then((r) => r.data),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Lead>) =>
      api.post<Lead>("/admin/leads", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
    meta: { toast: { success: "Lead created" } },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Lead> & { id: string; closedReason?: string }) =>
      api.patch<Lead>(`/admin/leads/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.detail(vars.id) });
    },
    // Lead updates are noisy (status, assignment, follow-up) — stay quiet on success,
    // still toast errors via the default fallback.
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/leads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
    meta: { toast: { success: "Lead deleted" } },
  });
}

interface AddActivityPayload {
  leadId: string;
  type: LeadActivity["type"];
  outcome?: string;
  feedback?: string;
  durationSec?: number;
  recordingUrl?: string;
  agentId?: string;
}

export function useAddLeadActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, ...payload }: AddActivityPayload) =>
      api.post<LeadActivity>(`/admin/leads/${leadId}/activities`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: leadKeys.detail(vars.leadId) });
      qc.invalidateQueries({ queryKey: leadKeys.all });
    },
    meta: { toast: { success: "Activity logged" } },
  });
}

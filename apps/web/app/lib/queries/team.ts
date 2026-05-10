import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Role, User } from "~/types";

export interface TeamMember extends User {
  lastLogin: string | null;
  updatedAt: string;
}

export const teamKeys = {
  all: ["team"] as const,
  list: ["team", "list"] as const,
};

export function useTeam() {
  return useQuery({
    queryKey: teamKeys.list,
    queryFn: () => api.get<TeamMember[]>("/admin/team").then((r) => r.data),
  });
}

interface CreatePayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayload) =>
      api.post<TeamMember>("/admin/team", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
    meta: { toast: { success: "Team member added" } },
  });
}

interface UpdatePayload {
  id: string;
  name?: string;
  phone?: string;
  password?: string;
  role?: Role;
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdatePayload) =>
      api.patch<TeamMember>(`/admin/team/${id}`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
    meta: { toast: { success: "Team member updated" } },
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/team/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.all }),
    meta: { toast: { success: "Team member removed" } },
  });
}

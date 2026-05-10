import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Post } from "~/types";

export const postKeys = {
  all: ["posts"] as const,
  list: (params: object) => [...postKeys.all, "list", params] as const,
  detail: (slug: string) => [...postKeys.all, "detail", slug] as const,
  adminList: (params: object) => [...postKeys.all, "admin", "list", params] as const,
  adminDetail: (id: string) => [...postKeys.all, "admin", id] as const,
};

interface PostListParams {
  category?: string;
  search?: string;
  limit?: number;
}

export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => api.get<Post[]>("/posts", { params }).then((r) => r.data),
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => api.get<Post>(`/posts/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}

interface AdminPostParams {
  category?: string;
  search?: string;
  status?: "draft" | "published" | "all";
}

export function useAdminPosts(params: AdminPostParams = {}) {
  return useQuery({
    queryKey: postKeys.adminList(params),
    queryFn: () => api.get<Post[]>("/admin/posts", { params }).then((r) => r.data),
  });
}

export function useAdminPost(id: string) {
  return useQuery({
    queryKey: postKeys.adminDetail(id),
    queryFn: () => api.get<Post>(`/admin/posts/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Post>) =>
      api.post<Post>("/admin/posts", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
    meta: { toast: { success: "Post created" } },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Post> & { id: string }) =>
      api.patch<Post>(`/admin/posts/${id}`, payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: postKeys.all });
      qc.invalidateQueries({ queryKey: postKeys.adminDetail(vars.id) });
    },
    meta: { toast: { success: "Post saved" } },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
    meta: { toast: { success: "Post deleted" } },
  });
}

import { useMutation } from "@tanstack/react-query";
import { api } from "../api";

export function useUpload() {
  return useMutation({
    mutationFn: (data: { filename: string; data: string }) =>
      api.post<{ url: string }>("/uploads", data).then((r) => r.data),
  });
}

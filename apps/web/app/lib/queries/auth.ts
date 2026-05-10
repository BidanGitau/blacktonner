import { useMutation } from "@tanstack/react-query";
import { api } from "../api";

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<{ token: string; user: any }>("/auth/login", data).then((r) => r.data),
  });
}

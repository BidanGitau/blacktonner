import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Convention for surfacing toasts on queries/mutations:
 *
 *   useMutation({
 *     mutationFn: ...,
 *     meta: { toast: { success: "Saved", error: "Couldn't save" } }
 *   })
 *
 * - `success`  string  → toast on success (mutations only)
 * - `error`    string  → static error toast text
 * - `error`    false   → suppress error toast (caller handles UX)
 * - omit `meta` entirely → silent (no toast either way)
 *
 * On error, falls back to the normalized Error.message from the axios interceptor.
 */
type ToastMeta = {
  toast?: {
    success?: string;
    error?: string | false;
  };
};

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta:    ToastMeta;
    mutationMeta: ToastMeta;
  }
}

function errorMessage(err: unknown, fallback?: string) {
  if (err instanceof Error && err.message) return err.message;
  return fallback ?? "Something went wrong";
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        retry: 1,
      },
    },
    queryCache: new QueryCache({
      onError: (err, query) => {
        const t = query.meta?.toast;
        if (t?.error === false) return;
        if (typeof t?.error === "string") toast.error(t.error);
        // No default toast for query failures — most are silent / handled in-page
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        const msg = mutation.meta?.toast?.success;
        if (typeof msg === "string") toast.success(msg);
      },
      onError: (err, _vars, _ctx, mutation) => {
        const t = mutation.meta?.toast;
        if (t?.error === false) return;
        toast.error(typeof t?.error === "string" ? t.error : errorMessage(err));
      },
    }),
  });
}

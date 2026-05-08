import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "~/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setAuth: (user, token) => {
        localStorage.setItem("bt_token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("bt_token");
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === "admin",
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "bt-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

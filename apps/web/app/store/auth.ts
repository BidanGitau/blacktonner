import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "~/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("bt_token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("bt_token");
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === "admin",
    }),
    { name: "bt-auth" }
  )
);

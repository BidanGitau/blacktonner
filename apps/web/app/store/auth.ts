import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "~/types";

export type StaffRole = Extract<Role, "admin" | "sales" | "technician">;

interface AuthStore {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  hasRole: (...roles: StaffRole[]) => boolean;
  setHasHydrated: (v: boolean) => void;
}

const STAFF_ROLES: Role[] = ["admin", "sales", "technician"];

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
      isStaff: () => {
        const role = get().user?.role;
        return !!role && STAFF_ROLES.includes(role);
      },
      hasRole: (...roles) => {
        const role = get().user?.role;
        return !!role && (roles as string[]).includes(role);
      },
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

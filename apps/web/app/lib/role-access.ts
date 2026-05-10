// Role → allowed admin path prefixes. Single source of truth for sidebar
// filtering AND route gating. Each entry is a path prefix; if the URL the
// user is on starts with one of their allowed prefixes, they're in.
import type { StaffRole } from "~/store/auth";

export const ROLE_LANDING: Record<StaffRole, string> = {
  admin:      "/admin",
  sales:      "/admin/sales/leads",
  technician: "/admin/maintenance/tickets",
};

export const ROLE_ACCESS: Record<StaffRole, string[]> = {
  admin: ["/admin"],
  sales: [
    "/admin/sales",
    "/admin/maintenance/tickets",
    "/admin/sales/customers",
  ],
  technician: [
    "/admin/maintenance/tickets",
  ],
};

export function canAccessPath(role: StaffRole | undefined, pathname: string) {
  if (!role) return false;
  if (role === "admin") return pathname.startsWith("/admin");
  return ROLE_ACCESS[role].some((prefix) => pathname.startsWith(prefix));
}

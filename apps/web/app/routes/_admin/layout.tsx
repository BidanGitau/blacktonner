import { useEffect, useMemo, useState } from "react";
import { Outlet, Link, NavLink, useNavigate, Navigate, useLocation } from "react-router";
import {
  LayoutDashboard, ShoppingBag, Package, Tag, DollarSign, Bot, FileText,
  Users, ChevronDown, BarChart3, PhoneCall, Receipt, UserCircle2,
  Wrench, LogOut, ExternalLink, UsersRound, Menu, X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useAuthStore, type StaffRole } from "~/store/auth";
import { canAccessPath, ROLE_LANDING } from "~/lib/role-access";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  roles?: StaffRole[];   // omit ⇒ admin-only
}
interface NavGroup {
  label: string;
  icon: React.ElementType;
  match: string;          // pathname prefix that activates the group
  children: NavItem[];
  roles?: StaffRole[];
}
type NavEntry = NavItem | NavGroup;

const NAV: NavEntry[] = [
  { to: "/admin",            label: "Dashboard",        icon: LayoutDashboard, end: true },
  { to: "/admin/orders",     label: "Orders",           icon: ShoppingBag },
  { to: "/admin/products",   label: "Products",         icon: Package },
  { to: "/admin/categories", label: "Categories",       icon: Tag },
  {
    label: "Sales",
    icon: PhoneCall,
    match: "/admin/sales",
    roles: ["admin", "sales"],
    children: [
      { to: "/admin/sales/leads",     label: "Leads",     icon: Users,        roles: ["admin", "sales"] },
      { to: "/admin/sales/pipeline",  label: "Pipeline",  icon: BarChart3,    roles: ["admin", "sales"] },
      { to: "/admin/sales/customers", label: "Customers", icon: UserCircle2,  roles: ["admin", "sales"] },
      { to: "/admin/sales/invoices",  label: "Invoices",  icon: Receipt,      roles: ["admin", "sales"] },
    ],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    match: "/admin/maintenance",
    roles: ["admin", "sales", "technician"],
    children: [
      { to: "/admin/maintenance/tickets", label: "Tickets", icon: Wrench, roles: ["admin", "sales", "technician"] },
    ],
  },
  { to: "/admin/posts",      label: "Blog",             icon: FileText },
  { to: "/admin/prices",     label: "Competitor Prices", icon: DollarSign },
  { to: "/admin/scraper",    label: "Scraper",          icon: Bot },
  { to: "/admin/team",       label: "Team",             icon: UsersRound },
];

function entryAllowed(role: StaffRole, entry: { roles?: StaffRole[] }) {
  if (role === "admin") return true;
  return entry.roles?.includes(role) ?? false;
}

function isGroup(entry: NavEntry): entry is NavGroup {
  return (entry as NavGroup).children !== undefined;
}

function NavGroupItem({ group }: { group: NavGroup }) {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(group.match);
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const Icon = group.icon;
  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group relative flex w-full items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors",
          isActive ? "text-black" : "text-black/45 hover:text-black",
        )}
      >
        {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-black" />}
        <Icon className="h-4 w-4" strokeWidth={1.6} />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={1.8} />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-stone-200 pl-3">
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive: childActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors",
                  childActive ? "text-black" : "text-black/40 hover:text-black",
                )
              }
            >
              <child.icon className="h-3.5 w-3.5" strokeWidth={1.6} />
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isStaff, _hasHydrated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = (user?.role ?? "admin") as StaffRole;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Filter sidebar to entries this role can see.
  const visibleNav = useMemo(() => {
    return NAV.flatMap<NavEntry>((entry) => {
      if (!entryAllowed(role, entry)) return [];
      if (isGroup(entry)) {
        const children = entry.children.filter((c) => entryAllowed(role, c));
        return children.length ? [{ ...entry, children }] : [];
      }
      return [entry];
    });
  }, [role]);

  if (!_hasHydrated) return null;
  if (!user || !isStaff()) return <Navigate to="/login" replace />;

  // Block routes the role can't access — bounce to their landing page.
  if (!canAccessPath(role, location.pathname)) {
    return <Navigate to={ROLE_LANDING[role]} replace />;
  }

  // Flatten every visible leaf item for the mobile bottom nav.
  // It scrolls horizontally on small screens so role-specific menus stay reachable.
  const mobileItems: NavItem[] = [];
  for (const entry of visibleNav) {
    if (isGroup(entry)) {
      for (const child of entry.children) {
        mobileItems.push(child);
      }
    } else {
      mobileItems.push(entry);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-stone-200 px-6">
          <img src="/logo.png" alt="Blacktoner" className="h-8 w-8" />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
            Black<span className="text-black/40">toner</span>
          </span>
          <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.2em] text-black/35">
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {visibleNav.map((entry) => {
            if (isGroup(entry)) {
              return <NavGroupItem key={entry.label} group={entry} />;
            }
            const Icon = entry.icon;
            return (
              <NavLink
                key={entry.to}
                to={entry.to}
                end={entry.end}
                className={({ isActive }) =>
                  cn(
                    "group relative mb-0.5 flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors",
                    isActive ? "text-black" : "text-black/45 hover:text-black",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-black" />}
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                    <span>{entry.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div className="mb-3 px-1">
            <p className="truncate text-xs font-semibold text-black">{user.name}</p>
            <p className="truncate text-[10px] uppercase tracking-[0.18em] text-black/40">
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex flex-1 items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black"
            >
              <ExternalLink className="h-3 w-3" strokeWidth={1.8} /> Store
            </Link>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-red-500"
            >
              <LogOut className="h-3 w-3" strokeWidth={1.8} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="-ml-2 flex h-9 w-9 items-center justify-center text-black"
            aria-label={mobileMenuOpen ? "Close admin menu" : "Open admin menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.7} /> : <Menu className="h-5 w-5" strokeWidth={1.7} />}
          </button>
          <img src="/logo.png" alt="Blacktoner" className="h-7 w-7" />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">Admin</span>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black"
        >
          <LogOut className="h-3 w-3" strokeWidth={1.8} /> Logout
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 z-30 max-h-[calc(100dvh-7rem)] overflow-y-auto border-b border-stone-200 bg-white shadow-lg lg:hidden">
          <nav className="p-3">
            {visibleNav.map((entry) => {
              if (isGroup(entry)) {
                return <NavGroupItem key={entry.label} group={entry} />;
              }
              const Icon = entry.icon;
              return (
                <NavLink
                  key={entry.to}
                  to={entry.to}
                  end={entry.end}
                  className={({ isActive }) =>
                    cn(
                      "group relative mb-0.5 flex items-center gap-3 rounded-md px-3 py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
                      isActive ? "bg-stone-100 text-black" : "text-black/55 hover:bg-stone-50 hover:text-black",
                    )
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                  <span>{entry.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="grid grid-cols-2 border-t border-stone-200">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} /> Store
            </Link>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center justify-center gap-2 border-l border-stone-200 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-stone-200 bg-white lg:hidden">
        {mobileItems.map((entry) => (
          <NavLink
            key={entry.to}
            to={entry.to}
            end={entry.end}
            className={({ isActive }) =>
              cn(
                "flex min-w-[76px] flex-1 flex-col items-center gap-0.5 px-2 py-2 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors",
                isActive ? "text-black" : "text-black/40 hover:text-black",
              )
            }
          >
            <entry.icon className="h-4 w-4" strokeWidth={1.6} />
            <span className="truncate">{entry.label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>

      {/* Content */}
      <div className="pb-16 lg:pb-0 lg:pl-60">
        <main className="admin-shell min-h-screen pt-14 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

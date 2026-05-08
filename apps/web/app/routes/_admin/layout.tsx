import { Outlet, Link, NavLink, useNavigate, Navigate } from "react-router";
import { LayoutDashboard, ShoppingBag, Package, Tag, DollarSign, Bot, FileText, LogOut, ExternalLink } from "lucide-react";
import { cn } from "~/lib/utils";
import { useAuthStore } from "~/store/auth";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/posts", label: "Blog", icon: FileText },
  { to: "/admin/prices", label: "Competitor Prices", icon: DollarSign },
  { to: "/admin/scraper", label: "Scraper", icon: Bot },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout, isAdmin, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) return null;
  if (!user || !isAdmin()) return <Navigate to="/login" replace />;

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
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "group relative mb-0.5 flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors",
                  isActive
                    ? "text-black"
                    : "text-black/45 hover:text-black"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-black" />
                  )}
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
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
          <img src="/logo.png" alt="Blacktoner" className="h-7 w-7" />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
            Admin
          </span>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black"
        >
          <LogOut className="h-3 w-3" strokeWidth={1.8} /> Logout
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stone-200 bg-white lg:hidden">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-bold uppercase tracking-[0.15em] transition-colors",
                isActive ? "text-black" : "text-black/40 hover:text-black"
              )
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} />
            <span className="truncate">{label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>

      {/* Content */}
      <div className="pb-16 lg:pb-0 lg:pl-60">
        <main className="min-h-screen pt-14 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

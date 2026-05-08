import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router";
import { LayoutDashboard, ShoppingBag, Package, Tag, DollarSign, Bot, LogOut } from "lucide-react";
import { cn } from "~/lib/utils";
import { useAuthStore } from "~/store/auth";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/prices", label: "Competitor Prices", icon: DollarSign },
  { to: "/admin/scraper", label: "Scraper", icon: Bot },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();

  if (!user || !isAdmin()) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <span className="text-lg font-bold text-white">
            Black<span className="text-blue-400">toner</span>{" "}
            <span className="text-xs font-normal text-slate-400">Admin</span>
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === to
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="px-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex-1 text-xs text-slate-500 hover:text-white transition-colors">
              ← Store
            </Link>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">
            {NAV.find((n) => n.to === pathname)?.label ?? "Admin"}
          </h1>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { ShoppingBag, Clock, TrendingUp, Package } from "lucide-react";
import { useOrderStats } from "~/lib/queries";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useOrderStats();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Today's overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Orders Today"
          value={stats?.ordersToday ?? 0}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats?.pending ?? 0}
          sub="awaiting confirmation"
          color="bg-orange-50 text-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue"
          value={`KES ${(stats?.revenue ?? 0).toLocaleString()}`}
          sub="confirmed + delivered"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Package}
          label="Total Orders"
          value={stats?.total ?? 0}
          color="bg-slate-100 text-slate-600"
        />
      </div>
    </div>
  );
}

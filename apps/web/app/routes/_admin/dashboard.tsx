import { ShoppingBag, Clock, TrendingUp, Package } from "lucide-react";
import { useOrderStats } from "~/lib/queries";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="group relative overflow-hidden border border-stone-200 bg-white p-6 transition-colors hover:border-black/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            {label}
          </p>
          <p className="mt-2 font-black tracking-tight text-black tabular-nums" style={{ fontSize: "clamp(1.5rem, 2vw, 1.875rem)" }}>
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-black/40">
              {sub}
            </p>
          )}
        </div>
        <Icon className="h-5 w-5 text-black/30 transition-colors group-hover:text-black" strokeWidth={1.6} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useOrderStats();

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Overview
          </p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Dashboard
          </h1>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-white" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ShoppingBag}
            label="Orders Today"
            value={stats?.ordersToday ?? 0}
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats?.pending ?? 0}
            sub="Awaiting confirmation"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={`KES ${(stats?.revenue ?? 0).toLocaleString()}`}
            sub="Confirmed + delivered"
          />
          <StatCard
            icon={Package}
            label="Total Orders"
            value={stats?.total ?? 0}
          />
        </div>
      )}
    </div>
  );
}

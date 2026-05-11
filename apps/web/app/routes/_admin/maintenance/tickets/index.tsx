import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Wrench, ArrowRight, AlertTriangle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useTickets, useTicketStats, useTicketTechnicians } from "~/lib/queries";
import { formatDate } from "~/lib/admin-ui";
import {
  TICKET_PRIORITY_COLORS, TICKET_PRIORITY_LABELS,
  TICKET_STATUS_COLORS, TICKET_STATUS_LABELS,
  type TicketPriority, type TicketStatus,
} from "~/types";

const selectCls = "h-9 rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40";

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [assignedTo, setAssignedTo] = useState("");

  const { data: tickets = [], isLoading } = useTickets({
    search: search || undefined,
    status,
    priority: priority || undefined,
    assignedToId: assignedTo || undefined,
  });
  const { data: techs = [] } = useTicketTechnicians();
  const { data: stats } = useTicketStats();

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Maintenance</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Tickets
          </h1>
        </div>
        <Button asChild>
          <Link to="/admin/maintenance/tickets/new"><Plus className="h-4 w-4" /> Raise Ticket</Link>
        </Button>
      </header>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-3">
          <Stat label="Open" value={String(stats.open)} sub="not yet resolved" />
          <Stat label="Urgent" value={String(stats.urgent)} sub="need immediate attention" accent={stats.urgent > 0 ? "text-red-600" : ""} icon={stats.urgent > 0 ? AlertTriangle : undefined} />
          <Stat label="Resolved" value={String(stats.byStatus.find((s) => s.status === "resolved")?.count ?? 0)} sub="awaiting close-out" />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticket #, customer, title…" className="pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectCls}>
          <option value="all">All statuses</option>
          {(Object.entries(TICKET_STATUS_LABELS) as [TicketStatus, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={selectCls}>
          <option value="">Any priority</option>
          {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={selectCls}>
          <option value="">Any technician</option>
          {techs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-md bg-stone-100" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 border border-stone-200 bg-stone-50 py-16 text-center">
          <Wrench className="h-7 w-7 text-black/35" strokeWidth={1.5} />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">No tickets match</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-md border border-stone-200 bg-white">
          {tickets.map((t) => (
            <li key={t.id} className="border-b border-stone-100 last:border-0">
              <Link to={`/admin/maintenance/tickets/${t.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50">
                <div className="w-32">
                  <p className="font-mono text-xs font-bold text-black">{t.number}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                    {formatDate(t.createdAt)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-black">{t.title}</p>
                  <p className="truncate text-xs text-black/55">
                    {t.customer?.name} · {t.customer?.phone}
                  </p>
                </div>
                <Badge variant="outline" className={TICKET_PRIORITY_COLORS[t.priority]}>{TICKET_PRIORITY_LABELS[t.priority]}</Badge>
                <Badge variant="outline" className={TICKET_STATUS_COLORS[t.status]}>{TICKET_STATUS_LABELS[t.status]}</Badge>
                <span className="hidden text-xs text-black/55 sm:inline">{t.assignedTo?.name ?? <span className="text-black/30">unassigned</span>}</span>
                <ArrowRight className="h-3.5 w-3.5 text-black/35" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent = "", icon: Icon }: { label: string; value: string; sub?: string; accent?: string; icon?: React.ElementType }) {
  return (
    <div className="bg-white p-5">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </p>
      <p className={`mt-2 text-2xl font-black tabular-nums ${accent || "text-black"}`} style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/40">{sub}</p>}
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Receipt, ArrowRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useInvoices, useInvoiceStats } from "~/lib/queries";
import { formatDate, formatKES } from "~/lib/admin-ui";
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, type InvoiceStatus } from "~/types";

const selectCls =
  "h-9 rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40";

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const { data: invoices = [], isLoading } = useInvoices({ search: search || undefined, status });
  const { data: stats } = useInvoiceStats();

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Invoices
          </h1>
        </div>
        <Button asChild>
          <Link to="/admin/sales/invoices/new"><Plus className="h-4 w-4" /> New Invoice</Link>
        </Button>
      </header>

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-3">
          <Stat label="Outstanding" value={formatKES(stats.outstanding)} sub={`${stats.outstandingCount} invoice${stats.outstandingCount !== 1 ? "s" : ""}`} accent="text-orange-600" />
          <Stat label="Paid Today"   value={formatKES(stats.paidToday)}   sub={`${stats.paidTodayCount} closed`} accent="text-emerald-700" />
          <Stat label="Drafts"       value={String(stats.drafts)}                         sub="awaiting issue" />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search number, customer, phone…" className="pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectCls}>
          <option value="all">All statuses</option>
          {(Object.entries(INVOICE_STATUS_LABELS) as [InvoiceStatus, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-md bg-stone-100" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 border border-stone-200 bg-stone-50 py-16 text-center">
          <Receipt className="h-7 w-7 text-black/35" strokeWidth={1.5} />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">No invoices</p>
          <p className="max-w-xs text-xs text-black/55">Create the first invoice to start tracking sales.</p>
          <Button asChild><Link to="/admin/sales/invoices/new"><Plus className="h-4 w-4" /> New Invoice</Link></Button>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-md border border-stone-200 bg-white">
          {invoices.map((inv) => {
            const due = inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== "paid" && inv.status !== "cancelled";
            return (
              <li key={inv.id} className="border-b border-stone-100 last:border-0">
                <Link to={`/admin/sales/invoices/${inv.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-stone-50">
                  <div className="w-32">
                    <p className="font-mono text-xs font-bold text-black">{inv.number}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                      {formatDate(inv.createdAt)}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-black">{inv.customer?.name ?? "—"}</p>
                    <p className="truncate font-mono text-[10px] text-black/55">{inv.customer?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-black">{formatKES(inv.total)}</p>
                    {Number(inv.paidAmount) > 0 && (
                      <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                        Paid · {formatKES(inv.paidAmount)}
                      </p>
                    )}
                    {due && <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">overdue</p>}
                  </div>
                  <Badge variant="outline" className={INVOICE_STATUS_COLORS[inv.status]}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-black/35" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent = "" }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">{label}</p>
      <p className={`mt-2 text-2xl font-black tabular-nums ${accent || "text-black"}`} style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/40">{sub}</p>}
    </div>
  );
}

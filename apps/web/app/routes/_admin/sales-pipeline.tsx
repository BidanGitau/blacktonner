import { Link } from "react-router";
import { ArrowRight, TrendingUp } from "lucide-react";

import { useLeadPipeline, useLeads } from "~/lib/queries";
import { formatKES } from "~/lib/admin-ui";
import { LEAD_STATUS_LABELS, type LeadStatus } from "~/types";

const PIPELINE_ORDER: LeadStatus[] = [
  "new_lead", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "on_hold",
];

const STATUS_TINT: Record<LeadStatus, string> = {
  new_lead:      "border-blue-200",
  contacted:     "border-indigo-200",
  qualified:     "border-violet-200",
  proposal_sent: "border-amber-200",
  negotiating:   "border-orange-200",
  won:           "border-emerald-300",
  lost:          "border-red-200",
  on_hold:       "border-stone-300",
};

export default function SalesPipelinePage() {
  const { data: stats = [], isLoading: statsLoading } = useLeadPipeline();
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ limit: 1000 });
  const leads = leadsData?.data ?? [];

  const byStatus: Record<LeadStatus, typeof leads> = PIPELINE_ORDER.reduce(
    (acc, status) => ({ ...acc, [status]: leads.filter((l) => l.status === status) }),
    {} as Record<LeadStatus, typeof leads>,
  );

  const totalValue = stats.reduce((sum, s) => sum + s.estimatedValue, 0);
  const openValue = stats.filter((s) => s.status !== "won" && s.status !== "lost").reduce((sum, s) => sum + s.estimatedValue, 0);
  const wonValue = stats.find((s) => s.status === "won")?.estimatedValue ?? 0;
  const wonCount = stats.find((s) => s.status === "won")?.count ?? 0;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Pipeline
          </h1>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
          <TrendingUp className="h-3.5 w-3.5" />
          {leads.length} active leads
        </div>
      </header>

      {/* Top stats */}
      {!statsLoading && (
        <div className="mb-8 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-3">
          <div className="bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Open Pipeline</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-black" style={{ fontFamily: "var(--font-display)" }}>
              {formatKES(openValue)}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/40">in negotiation or earlier</p>
          </div>
          <div className="bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">Won</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-emerald-700" style={{ fontFamily: "var(--font-display)" }}>
              {formatKES(wonValue)}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/40">{wonCount} closed deal{wonCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Total Tracked</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-black" style={{ fontFamily: "var(--font-display)" }}>
              {formatKES(totalValue)}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/40">all statuses combined</p>
          </div>
        </div>
      )}

      {/* Kanban-ish */}
      {leadsLoading ? (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 w-72 shrink-0 animate-pulse rounded-md bg-stone-100" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_ORDER.map((status) => {
            const items = byStatus[status];
            const stat = stats.find((s) => s.status === status);
            return (
              <div key={status} className="w-72 shrink-0">
                <div className={`mb-3 flex items-center justify-between border-t-2 ${STATUS_TINT[status]} bg-white px-3 pt-3`}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                    {LEAD_STATUS_LABELS[status]}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                    {items.length}
                  </span>
                </div>
                {stat?.estimatedValue ? (
                  <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-black/45">
                    {formatKES(stat.estimatedValue)}
                  </p>
                ) : null}
                <ul className="space-y-2 px-1 pb-1">
                  {items.length === 0 && (
                    <li className="px-2 text-[10px] uppercase tracking-[0.18em] text-black/30">empty</li>
                  )}
                  {items.map((lead) => (
                    <li key={lead.id}>
                      <Link
                        to={`/admin/sales/leads/${lead.id}`}
                        className="block border border-stone-200 bg-white p-3 transition-colors hover:border-black"
                      >
                        <p className="font-medium text-black">{lead.name}</p>
                        {lead.company && <p className="text-xs text-black/45">{lead.company}</p>}
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-black/55">
                          {lead.phone}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em]">
                          <span className="text-black/40">{lead.assignedTo?.name ?? "Unassigned"}</span>
                          {lead.estimatedValue && (
                            <span className="text-black">
                              {Number(lead.estimatedValue).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
          Click a lead to record activity, change status, or close the deal
        </p>
        <Link
          to="/admin/sales/leads"
          className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:underline"
        >
          List view <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

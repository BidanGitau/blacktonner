import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useCreateLead, useLeadAgents } from "~/lib/queries";
import { inputCls, labelCls, textareaCls } from "~/lib/admin-ui";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  type LeadSource,
  type LeadStatus,
} from "~/types";

export default function LeadNewPage() {
  const navigate = useNavigate();
  const create = useCreateLead();
  const { data: agents = [] } = useLeadAgents();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "other" as LeadSource,
    status: "new_lead" as LeadStatus,
    estimatedValue: "",
    nextFollowUp: "",
    notes: "",
    assignedToId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.phone.trim()) next.phone = "Required";
    setErrors(next);
    if (Object.keys(next).length) return;

    create.mutate(
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        company: form.company.trim() || null,
        source: form.source,
        status: form.status,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
        nextFollowUp: form.nextFollowUp || null,
        notes: form.notes.trim() || null,
        assignedToId: form.assignedToId || null,
      } as any,
      { onSuccess: (lead) => navigate(`/admin/sales/leads/${lead.id}`) },
    );
  }

  return (
    <div className="w-full px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/sales/leads" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 hover:border-black hover:text-black">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales</p>
          <h1 className="font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>New Lead</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Customer</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Name *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(!!errors.name)} placeholder="Jane Wanjiku" />
              {errors.name && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls(!!errors.phone)} placeholder="07xx xxx xxx" />
              {errors.phone && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls()} placeholder="jane@company.co.ke" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Company</label>
              <input value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls()} placeholder="Optional" />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Pipeline</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Source</label>
              <select value={form.source} onChange={(e) => set("source", e.target.value as LeadSource)} className={inputCls()}>
                {(Object.entries(LEAD_SOURCE_LABELS) as [LeadSource, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as LeadStatus)} className={inputCls()}>
                {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Assigned to</label>
              <select value={form.assignedToId} onChange={(e) => set("assignedToId", e.target.value)} className={inputCls()}>
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Estimated value (KES)</label>
              <input type="number" min={0} value={form.estimatedValue} onChange={(e) => set("estimatedValue", e.target.value)} className={inputCls()} placeholder="0" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Next follow-up</label>
              <input type="datetime-local" value={form.nextFollowUp} onChange={(e) => set("nextFollowUp", e.target.value)} className={inputCls()} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3}
                className={textareaCls}
                placeholder="What's the deal? Pain points, budget, decision maker…"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 border-t border-stone-200 pt-6">
          <button type="submit" disabled={create.isPending}
            className="inline-flex h-10 items-center gap-2 bg-black px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white hover:bg-black/85 disabled:bg-stone-300">
            {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {create.isPending ? "Saving…" : "Create Lead"}
          </button>
          <Link to="/admin/sales/leads" className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 hover:text-black">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

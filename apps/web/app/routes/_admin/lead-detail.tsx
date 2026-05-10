import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { LeadActivityForm } from "~/components/admin/lead/LeadActivityForm";
import { LeadPipelineStrip } from "~/components/admin/lead/LeadPipelineStrip";
import { LeadSidebar } from "~/components/admin/lead/LeadSidebar";
import { LeadTimeline } from "~/components/admin/lead/LeadTimeline";
import {
  useAddLeadActivity, useDeleteLead, useLead, useLeadAgents, useUpdateLead,
} from "~/lib/queries";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, type LeadStatus } from "~/types";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id ?? "");
  const { data: agents = [] } = useLeadAgents();
  const update = useUpdateLead();
  const addActivity = useAddLeadActivity();
  const remove = useDeleteLead();

  const [closing, setClosing] = useState<{ status: LeadStatus | null; reason: string }>({
    status: null,
    reason: "",
  });

  if (isLoading || !lead) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse bg-stone-100" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-96 animate-pulse rounded-md bg-stone-100" />
            <div className="h-72 animate-pulse rounded-md bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  function handleStatusChange(next: LeadStatus) {
    if (!lead) return;
    if (next === lead.status) return;
    if (next === "lost") {
      setClosing({ status: "lost", reason: "" });
      return;
    }
    update.mutate({ id: lead.id, status: next });
  }

  function confirmClose() {
    if (!lead || !closing.status) return;
    update.mutate(
      { id: lead.id, status: closing.status, closedReason: closing.reason || undefined } as any,
      { onSuccess: () => setClosing({ status: null, reason: "" }) },
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/sales/leads"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 hover:border-black hover:text-black">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Lead · {LEAD_SOURCE_LABELS[lead.source]}
          </p>
          <h1 className="font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            {lead.name}
          </h1>
          {lead.company && <p className="mt-1 text-sm text-black/55">{lead.company}</p>}
        </div>
        <Badge variant="outline" className={LEAD_STATUS_COLORS[lead.status]}>
          {LEAD_STATUS_LABELS[lead.status]}
        </Badge>
      </header>

      <LeadPipelineStrip
        current={lead.status}
        onChange={handleStatusChange}
        disabled={update.isPending}
      />

      {closing.status === "lost" && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-700">Why is this lead lost?</p>
          <textarea
            value={closing.reason}
            onChange={(e) => setClosing((c) => ({ ...c, reason: e.target.value }))}
            rows={2}
            placeholder="Pricing too high, went with competitor, project cancelled…"
            className="mt-2 w-full resize-none border border-red-200 bg-white p-3 text-sm text-black"
          />
          <div className="mt-2 flex gap-2">
            <Button onClick={confirmClose} disabled={update.isPending} className="bg-red-600 hover:bg-red-700">
              {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Mark as Lost
            </Button>
            <Button variant="outline" onClick={() => setClosing({ status: null, reason: "" })}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <LeadActivityForm
            pending={addActivity.isPending}
            onSubmit={(payload) => addActivity.mutate({ leadId: lead.id, ...payload })}
          />
          <LeadTimeline activities={lead.activities} />
        </div>

        <LeadSidebar
          lead={lead}
          agents={agents}
          pending={update.isPending}
          onAssign={(agentId) => update.mutate({ id: lead.id, assignedToId: agentId || null } as any)}
          onValueChange={(value) => update.mutate({ id: lead.id, estimatedValue: value ? Number(value) : null } as any)}
          onFollowUpChange={(value) => update.mutate({ id: lead.id, nextFollowUp: value || null } as any)}
          onDelete={() => {
            if (!confirm(`Delete lead "${lead.name}"? Activities will be lost.`)) return;
            remove.mutate(lead.id, { onSuccess: () => navigate("/admin/sales/leads") });
          }}
          deletePending={remove.isPending}
        />
      </div>
    </div>
  );
}

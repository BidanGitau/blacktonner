import { Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { inputBase, labelCls } from "~/lib/admin-ui";
import type { Lead, LeadAgent } from "~/types";

interface Props {
  lead: Lead;
  agents: LeadAgent[];
  pending: boolean;
  onAssign: (agentId: string) => void;
  onValueChange: (value: string) => void;
  onFollowUpChange: (value: string) => void;
  onDelete: () => void;
  deletePending: boolean;
}

export function LeadSidebar({
  lead, agents, pending, onAssign, onValueChange, onFollowUpChange, onDelete, deletePending,
}: Props) {
  const overdue = lead.nextFollowUp
    && new Date(lead.nextFollowUp) < new Date()
    && lead.status !== "won" && lead.status !== "lost";

  const fieldCls = `mt-1.5 ${inputBase} border-stone-200`;

  return (
    <aside className="space-y-6">
      <section className="rounded-md border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Contact</h2>
        <div className="space-y-3">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-black hover:underline">
            <Phone className="h-3.5 w-3.5 text-black/45" /> {lead.phone}
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 break-all text-sm text-black hover:underline">
              <Mail className="h-3.5 w-3.5 text-black/45" /> {lead.email}
            </a>
          )}
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
            target="_blank" rel="noopener"
            className="flex items-center gap-2 text-sm text-black hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5 text-black/45" /> WhatsApp
          </a>
        </div>
      </section>

      <section className="rounded-md border border-stone-200 bg-white p-6">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Pipeline</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Assigned to</label>
            <select
              value={lead.assignedTo?.id ?? ""}
              onChange={(e) => onAssign(e.target.value)}
              disabled={pending}
              className={fieldCls}
            >
              <option value="">Unassigned</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Estimated value (KES)</label>
            <input
              type="number" min={0}
              defaultValue={lead.estimatedValue ?? ""}
              onBlur={(e) => onValueChange(e.target.value)}
              disabled={pending}
              placeholder="0"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>Next follow-up</label>
            <input
              type="datetime-local"
              defaultValue={lead.nextFollowUp ? lead.nextFollowUp.slice(0, 16) : ""}
              onBlur={(e) => onFollowUpChange(e.target.value)}
              disabled={pending}
              className={fieldCls}
            />
            {overdue && (
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
                Overdue
              </p>
            )}
          </div>
          {lead.notes && (
            <div>
              <p className={labelCls}>Notes</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-black/65">{lead.notes}</p>
            </div>
          )}
          {lead.closedAt && (
            <div className="border-t border-stone-200 pt-3">
              <p className={labelCls}>Closed</p>
              <p className="mt-1.5 text-sm text-black/65">
                {new Date(lead.closedAt).toLocaleString("en-KE")}
              </p>
              {lead.closedReason && (
                <p className="mt-1 text-xs text-black/55">{lead.closedReason}</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-md border border-red-200 bg-red-50 p-6">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-red-700">Danger Zone</h2>
        <button
          onClick={onDelete}
          disabled={deletePending}
          className="inline-flex h-9 w-full items-center justify-center gap-2 border border-red-300 bg-white text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete Lead
        </button>
      </section>
    </aside>
  );
}

import { Link } from "react-router";
import {
  Building2, Calendar, CheckCircle2, Mail, MessageCircle, Phone, Trash2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { inputBase, labelCls } from "~/lib/admin-ui";
import { TICKET_PRIORITY_LABELS, type Ticket, type TicketPriority } from "~/types";

interface Tech { id: string; name: string; email: string; role: string }

interface Props {
  ticket: Ticket;
  techs: Tech[];
  pending: boolean;
  onPriorityChange: (priority: TicketPriority) => void;
  onAssign: (agentId: string) => void;
  onSchedule: (value: string) => void;
  onClose: () => void;
  onDelete: () => void;
  deletePending: boolean;
}

export function TicketSidebar({
  ticket, techs, pending, onPriorityChange, onAssign, onSchedule, onClose, onDelete, deletePending,
}: Props) {
  const overdue = ticket.scheduledFor
    && new Date(ticket.scheduledFor) < new Date()
    && !["resolved", "closed", "cancelled"].includes(ticket.status);

  const fieldCls = `mt-1.5 ${inputBase} border-stone-200`;

  return (
    <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-md border border-stone-200 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Customer</p>
        <Link
          to={`/admin/sales/customers/${ticket.customerId}`}
          className="mt-2 block font-medium text-black hover:underline"
        >
          {ticket.customer?.name}
        </Link>
        {ticket.customer?.company && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-black/55">
            <Building2 className="h-3 w-3" /> {ticket.customer.company}
          </p>
        )}
        <a href={`tel:${ticket.customer?.phone}`} className="mt-2 flex items-center gap-2 text-sm text-black hover:underline">
          <Phone className="h-3.5 w-3.5 text-black/45" /> {ticket.customer?.phone}
        </a>
        {ticket.customer?.email && (
          <a href={`mailto:${ticket.customer.email}`} className="mt-1 flex items-center gap-2 break-all text-sm text-black hover:underline">
            <Mail className="h-3.5 w-3.5 text-black/45" /> {ticket.customer.email}
          </a>
        )}
        {ticket.customer?.phone && (
          <a
            href={`https://wa.me/${ticket.customer.phone.replace(/\D/g, "")}`}
            target="_blank" rel="noopener"
            className="mt-1 flex items-center gap-2 text-sm text-black hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5 text-black/45" /> WhatsApp
          </a>
        )}
      </div>

      <div className="space-y-4 rounded-md border border-stone-200 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Routing</p>

        <div>
          <label className={labelCls}>Priority</label>
          <select
            value={ticket.priority}
            onChange={(e) => onPriorityChange(e.target.value as TicketPriority)}
            disabled={pending}
            className={fieldCls}
          >
            {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Assigned technician</label>
          <select
            value={ticket.assignedTo?.id ?? ""}
            onChange={(e) => onAssign(e.target.value)}
            disabled={pending}
            className={fieldCls}
          >
            <option value="">Unassigned</option>
            {techs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Scheduled visit</label>
          <input
            type="datetime-local"
            defaultValue={ticket.scheduledFor ? ticket.scheduledFor.slice(0, 16) : ""}
            onBlur={(e) => onSchedule(e.target.value)}
            disabled={pending}
            className={fieldCls}
          />
          {overdue && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
              <Calendar className="h-3 w-3" /> Overdue
            </p>
          )}
        </div>

        {ticket.raisedBy && (
          <div className="border-t border-stone-100 pt-3">
            <p className={labelCls}>Raised by</p>
            <p className="mt-1 text-sm text-black/65">{ticket.raisedBy.name}</p>
          </div>
        )}

        {ticket.resolvedAt && (
          <div className="border-t border-stone-100 pt-3">
            <p className={labelCls}>Resolved</p>
            <p className="mt-1 text-sm text-black/65">
              {new Date(ticket.resolvedAt).toLocaleString("en-KE")}
            </p>
          </div>
        )}
      </div>

      {ticket.status === "resolved" && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Close Out</p>
          <p className="mt-2 text-xs text-emerald-900/75">
            Resolution submitted. Mark closed once the customer has signed off.
          </p>
          <Button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="mt-3 h-9 w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Close Ticket
          </Button>
        </div>
      )}

      <div className="rounded-md border border-red-200 bg-red-50 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-700">Danger Zone</p>
        <button
          type="button"
          onClick={onDelete}
          disabled={deletePending}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 border border-red-300 bg-white text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete Ticket
        </button>
      </div>
    </aside>
  );
}

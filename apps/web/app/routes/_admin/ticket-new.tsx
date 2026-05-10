import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { CustomerPicker } from "~/components/admin/CustomerPicker";
import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/store/auth";
import { useCreateTicket, useCustomer, useTicketTechnicians } from "~/lib/queries";
import { inputBase, labelCls } from "~/lib/admin-ui";
import {
  TICKET_PRIORITY_LABELS,
  type TicketPriority,
} from "~/types";

const inputCls = `${inputBase} border-stone-200`;
const textareaCls =
  "w-full resize-none border border-stone-200 bg-white p-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-1 focus:ring-black/40";

export default function TicketNewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetCustomerId = params.get("customerId");
  const { data: presetCustomer } = useCustomer(presetCustomerId ?? "");
  const { user } = useAuthStore();
  const { data: techs = [] } = useTicketTechnicians();
  const create = useCreateTicket();

  const [customer, setCustomer] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [assignedToId, setAssignedToId] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (presetCustomer && !customer) setCustomer(presetCustomer);
  }, [presetCustomer, customer]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!customer || !customer.name?.trim() || !customer.phone?.trim()) next.customer = "Pick or create a customer";
    if (!title.trim()) next.title = "Required";
    if (!description.trim()) next.description = "Required";
    setErrors(next);
    if (Object.keys(next).length) return;

    create.mutate(
      {
        customer: {
          id: customer.id ?? null,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          company: customer.company || null,
        },
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedToId: assignedToId || null,
        scheduledFor: scheduledFor || null,
        raisedById: user?.id ?? null,
      } as any,
      { onSuccess: (t: any) => navigate(`/admin/maintenance/tickets/${t.id}`) },
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link
          to="/admin/maintenance/tickets"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 hover:border-black hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Maintenance</p>
          <h1 className="font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Raise Ticket
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Customer */}
          <div>
            <CustomerPicker value={customer} onChange={setCustomer} />
            {errors.customer && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.customer}</p>
            )}
          </div>

          {/* Issue */}
          <section className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Issue</h2>

            <div>
              <label className={labelCls}>Title *</label>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((er) => ({ ...er, title: "" })); }}
                placeholder="Printer not feeding paper"
                className={`${inputCls} mt-1.5 ${errors.title ? "border-red-400" : ""}`}
              />
              {errors.title && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((er) => ({ ...er, description: "" })); }}
                rows={5}
                placeholder="What's failing? When did it start? Any error codes? What has the customer already tried?"
                className={`${textareaCls} mt-1.5 ${errors.description ? "border-red-400" : ""}`}
              />
              {errors.description && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.description}</p>}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-4 rounded-md border border-stone-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Routing</p>

            <div>
              <label className={labelCls}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className={`${inputCls} mt-1.5`}
              >
                {(Object.entries(TICKET_PRIORITY_LABELS) as [TicketPriority, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Assign technician</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className={`${inputCls} mt-1.5`}
              >
                <option value="">Leave unassigned</option>
                {techs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/40">
                Auto-sets status to "Assigned" when picked
              </p>
            </div>

            <div>
              <label className={labelCls}>Scheduled visit</label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className={`${inputCls} mt-1.5`}
              />
            </div>

            <Button type="submit" disabled={create.isPending} className="h-10 w-full">
              {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {create.isPending ? "Raising…" : "Raise Ticket"}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}

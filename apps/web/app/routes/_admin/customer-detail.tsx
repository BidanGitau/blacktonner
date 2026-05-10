import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Building2, Mail, MessageCircle, Phone, Plus, Receipt, Wrench } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { useCustomer } from "~/lib/queries";
import { formatDate, formatKES } from "~/lib/admin-ui";
import {
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS,
  LEAD_STATUS_COLORS, LEAD_STATUS_LABELS,
  TICKET_STATUS_COLORS, TICKET_STATUS_LABELS,
  type LeadStatus, type TicketStatus,
} from "~/types";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useCustomer(id ?? "");

  if (isLoading || !customer) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse bg-stone-100" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="h-64 animate-pulse rounded-md bg-stone-100" />
            <div className="h-64 animate-pulse rounded-md bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = (customer.invoices ?? [])
    .filter((i) => i.status === "paid" || i.status === "partial")
    .reduce((s, i) => s + Number(i.paidAmount), 0);

  const outstanding = (customer.invoices ?? [])
    .filter((i) => i.status === "issued" || i.status === "partial")
    .reduce((s, i) => s + (Number(i.total) - Number(i.paidAmount)), 0);

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/sales/customers" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 hover:border-black hover:text-black">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Customer</p>
          <h1 className="font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            {customer.name}
          </h1>
          {customer.company && <p className="mt-1 flex items-center gap-1 text-sm text-black/55"><Building2 className="h-3.5 w-3.5" /> {customer.company}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/admin/sales/invoices/new?customerId=${customer.id}`}
            className="inline-flex items-center gap-2 bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-black/85"
          >
            <Plus className="h-3 w-3" /> Invoice
          </Link>
          <Link
            to={`/admin/maintenance/tickets/new?customerId=${customer.id}`}
            className="inline-flex items-center gap-2 border border-stone-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:border-black"
          >
            <Wrench className="h-3 w-3" /> Ticket
          </Link>
        </div>
      </header>

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-4">
        <Stat label="Lifetime Spend" value={formatKES(totalSpent)} />
        <Stat label="Outstanding" value={formatKES(outstanding)} accent={outstanding > 0 ? "text-orange-600" : ""} />
        <Stat label="Invoices" value={String((customer.invoices ?? []).length)} />
        <Stat label="Tickets" value={String((customer.tickets ?? []).length)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Invoices */}
          <section className="rounded-md border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Invoices</p>
              <Link to={`/admin/sales/invoices/new?customerId=${customer.id}`}
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-black hover:underline">
                + New
              </Link>
            </div>
            {(customer.invoices ?? []).length === 0 ? (
              <Empty icon={Receipt} title="No invoices yet" />
            ) : (
              <ul className="divide-y divide-stone-100">
                {customer.invoices!.map((inv) => (
                  <li key={inv.id}>
                    <Link to={`/admin/sales/invoices/${inv.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-stone-50">
                      <div>
                        <p className="font-mono text-xs font-bold text-black">{inv.number}</p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                          {formatDate(inv.createdAt, "long")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums text-black">{formatKES(inv.total)}</p>
                        {Number(inv.paidAmount) > 0 && Number(inv.paidAmount) < Number(inv.total) && (
                          <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                            Paid · {formatKES(inv.paidAmount)}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={INVOICE_STATUS_COLORS[inv.status]}>
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-black/35" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Tickets */}
          <section className="rounded-md border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Maintenance Tickets</p>
              <Link to={`/admin/maintenance/tickets/new?customerId=${customer.id}`}
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-black hover:underline">
                + Raise Ticket
              </Link>
            </div>
            {(customer.tickets ?? []).length === 0 ? (
              <Empty icon={Wrench} title="No tickets" />
            ) : (
              <ul className="divide-y divide-stone-100">
                {customer.tickets!.map((t: any) => (
                  <li key={t.id}>
                    <Link to={`/admin/maintenance/tickets/${t.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-stone-50">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-bold text-black">{t.number}</p>
                        <p className="truncate text-sm text-black">{t.title}</p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                          {t.assignedTo?.name ? `Tech · ${t.assignedTo.name}` : "Unassigned"}
                        </p>
                      </div>
                      <Badge variant="outline" className={TICKET_STATUS_COLORS[t.status as TicketStatus]}>
                        {TICKET_STATUS_LABELS[t.status as TicketStatus]}
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-black/35" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Leads (if any) */}
          {(customer.leads ?? []).length > 0 && (
            <section className="rounded-md border border-stone-200 bg-white">
              <div className="border-b border-stone-200 px-5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Linked Leads</p>
              </div>
              <ul className="divide-y divide-stone-100">
                {customer.leads!.map((l: any) => (
                  <li key={l.id}>
                    <Link to={`/admin/sales/leads/${l.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-stone-50">
                      <span className="text-sm text-black/70">{formatDate(l.updatedAt, "long")}</span>
                      <Badge variant="outline" className={LEAD_STATUS_COLORS[l.status as LeadStatus]}>
                        {LEAD_STATUS_LABELS[l.status as LeadStatus]}
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-black/35" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-md border border-stone-200 bg-white p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Contact</p>
            <a href={`tel:${customer.phone}`} className="mt-2 flex items-center gap-2 text-sm text-black hover:underline">
              <Phone className="h-3.5 w-3.5 text-black/45" /> {customer.phone}
            </a>
            {customer.email && (
              <a href={`mailto:${customer.email}`} className="mt-2 flex items-center gap-2 break-all text-sm text-black hover:underline">
                <Mail className="h-3.5 w-3.5 text-black/45" /> {customer.email}
              </a>
            )}
            <a
              href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
              target="_blank" rel="noopener"
              className="mt-2 flex items-center gap-2 text-sm text-black hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5 text-black/45" /> WhatsApp
            </a>
            {customer.address && (
              <div className="mt-3 border-t border-stone-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Address</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-black/65">{customer.address}</p>
              </div>
            )}
            {customer.notes && (
              <div className="mt-3 border-t border-stone-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-black/65">{customer.notes}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">{label}</p>
      <p className={`mt-2 text-xl font-black tabular-nums ${accent || "text-black"}`} style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
    </div>
  );
}

function Empty({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-black/35">
      <Icon className="h-6 w-6" strokeWidth={1.5} />
      <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{title}</p>
    </div>
  );
}

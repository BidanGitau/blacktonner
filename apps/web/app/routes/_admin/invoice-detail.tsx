import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Building2, Check, Download, Loader2, Mail, Phone, Trash2, X,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { exportInvoicePdf } from "~/lib/invoice-pdf";
import { useDeleteInvoice, useInvoice, useUpdateInvoice } from "~/lib/queries";
import { formatDate, formatKES } from "~/lib/admin-ui";
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, type InvoiceStatus } from "~/types";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id ?? "");
  const update = useUpdateInvoice();
  const remove = useDeleteInvoice();
  const [downloading, setDownloading] = useState(false);
  const [paymentInput, setPaymentInput] = useState("");

  if (isLoading || !invoice) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10 space-y-4">
        <div className="h-8 w-64 animate-pulse bg-stone-100" />
        <div className="h-96 animate-pulse rounded-md bg-stone-100" />
      </div>
    );
  }

  const total = Number(invoice.total);
  const paid = Number(invoice.paidAmount);
  const balance = total - paid;

  async function downloadPdf() {
    setDownloading(true);
    try { await exportInvoicePdf(invoice!); }
    finally { setDownloading(false); }
  }

  function recordPayment() {
    if (!invoice) return;
    const amount = Number(paymentInput || 0);
    if (amount <= 0) return;
    const next = paid + amount;
    update.mutate({ id: invoice.id, paidAmount: Math.min(next, total) }, { onSuccess: () => setPaymentInput("") });
  }

  function transition(status: InvoiceStatus) {
    if (!invoice) return;
    update.mutate({ id: invoice.id, status });
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex flex-wrap items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/sales/invoices" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 hover:border-black hover:text-black">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Invoice</p>
          <h1 className="font-mono font-black tracking-tight text-black" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}>
            {invoice.number}
          </h1>
        </div>
        <Badge variant="outline" className={INVOICE_STATUS_COLORS[invoice.status]}>
          {INVOICE_STATUS_LABELS[invoice.status]}
        </Badge>
        <Button variant="outline" onClick={downloadPdf} disabled={downloading}>
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          PDF
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Customer & meta */}
          <section className="rounded-md border border-stone-200 bg-white p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Bill To</p>
                <Link to={`/admin/sales/customers/${invoice.customerId}`} className="mt-2 block">
                  <p className="text-base font-bold text-black hover:underline">{invoice.customer?.name}</p>
                </Link>
                {invoice.customer?.company && <p className="mt-0.5 flex items-center gap-1 text-sm text-black/55"><Building2 className="h-3 w-3" /> {invoice.customer.company}</p>}
                <p className="mt-0.5 flex items-center gap-1 text-xs text-black/65"><Phone className="h-3 w-3" /> {invoice.customer?.phone}</p>
                {invoice.customer?.email && <p className="mt-0.5 flex items-center gap-1 text-xs text-black/65"><Mail className="h-3 w-3" /> {invoice.customer.email}</p>}
                {invoice.customer?.address && <p className="mt-1 whitespace-pre-wrap text-xs text-black/55">{invoice.customer.address}</p>}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Issued</p>
                <p className="mt-2 text-sm text-black">{formatDate(invoice.createdAt, "long")}</p>
                {invoice.dueDate && (
                  <>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Due</p>
                    <p className="mt-2 text-sm text-black">{formatDate(invoice.dueDate, "long")}</p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="overflow-hidden rounded-md border border-stone-200 bg-white">
            <div className="border-b border-stone-200 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Items</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-stone-50">
                <tr className="border-b border-stone-200">
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Item</th>
                  <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Qty</th>
                  <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Unit</th>
                  <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoice.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-black">{it.description}</p>
                      {it.sku && <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{it.sku}</p>}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-black/70">{Number(it.quantity)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-black/70">{formatKES(it.unitPrice)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-black">{formatKES(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-stone-200 bg-stone-50/40 px-5 py-4 space-y-1.5">
              <Row label="Subtotal" value={formatKES(invoice.subtotal)} />
              {Number(invoice.taxAmount) > 0 && <Row label={`Tax (${Number(invoice.taxRate)}%)`} value={formatKES(invoice.taxAmount)} muted />}
              <div className="flex justify-between border-t-2 border-black pt-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Total</span>
                <span className="font-black tabular-nums text-black" style={{ fontFamily: "var(--font-display)" }}>{formatKES(total)}</span>
              </div>
              {paid > 0 && (
                <>
                  <Row label="Paid" value={`- ${formatKES(paid)}`} muted />
                  <Row label="Balance" value={formatKES(balance)} bold />
                </>
              )}
            </div>
          </section>

          {invoice.notes && (
            <section className="rounded-md border border-stone-200 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-black/75">{invoice.notes}</p>
            </section>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          {/* Status actions */}
          <div className="rounded-md border border-stone-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {invoice.status === "draft" && (
                <Button onClick={() => transition("issued")} size="sm">
                  <Check className="h-3.5 w-3.5" /> Issue
                </Button>
              )}
              {(invoice.status === "issued" || invoice.status === "partial") && balance <= 0 && (
                <Button onClick={() => transition("paid")} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-3.5 w-3.5" /> Mark Paid
                </Button>
              )}
              {invoice.status !== "cancelled" && invoice.status !== "paid" && (
                <Button onClick={() => transition("cancelled")} variant="outline" size="sm">
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Record payment */}
          {(invoice.status === "issued" || invoice.status === "partial") && balance > 0 && (
            <div className="rounded-md border border-stone-200 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Record Payment</p>
              <p className="mt-1 text-xs text-black/55">Outstanding · {formatKES(balance)}</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="number" min={0} step="0.01"
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(e.target.value)}
                  placeholder="Amount"
                  className="h-9 flex-1 border border-stone-200 bg-white px-3 text-sm focus:border-black focus:outline-none"
                />
                <Button onClick={recordPayment} disabled={update.isPending || !paymentInput}>
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-md border border-red-200 bg-red-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-700">Danger Zone</p>
            <button
              onClick={() => {
                if (!confirm(`Delete invoice ${invoice.number}? This can't be undone.`)) return;
                remove.mutate(invoice.id, { onSuccess: () => navigate("/admin/sales/invoices") });
              }}
              disabled={remove.isPending}
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 border border-red-300 bg-white text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Invoice
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between ${bold ? "text-base font-bold text-black" : "text-sm"} ${muted ? "text-black/55" : "text-black"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

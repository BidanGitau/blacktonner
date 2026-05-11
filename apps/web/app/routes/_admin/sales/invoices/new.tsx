import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Loader2, Plus, Save, Search, Trash2 } from "lucide-react";

import { CustomerPicker } from "~/components/admin/CustomerPicker";
import { Button } from "~/components/ui/button";
import { useCreateInvoice, useCustomer, useProducts } from "~/lib/queries";
import { formatKES, inputBase, labelCls } from "~/lib/admin-ui";
import type { Product } from "~/types";

interface LineItem {
  id: string;            // local id for keys
  productId?: string | null;
  sku?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

const inputCls = `${inputBase} border-stone-200`;

function uuid() {
  return Math.random().toString(36).slice(2);
}

export default function InvoiceNewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetCustomerId = params.get("customerId");
  const { data: presetCustomer } = useCustomer(presetCustomerId ?? "");

  const [customer, setCustomer] = useState<any>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [issueNow, setIssueNow] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const create = useCreateInvoice();

  // If we arrived with ?customerId=…, pre-fill the customer panel
  useEffect(() => {
    if (presetCustomer && !customer) setCustomer(presetCustomer);
  }, [presetCustomer, customer]);

  function addBlankLine() {
    setItems((it) => [...it, { id: uuid(), description: "", quantity: 1, unitPrice: 0 }]);
  }

  function addProductLine(p: Product) {
    setItems((it) => {
      const existing = it.find((line) => line.productId === p.id);
      if (existing) {
        return it.map((line) => line.productId === p.id
          ? { ...line, quantity: Number(line.quantity) + 1 }
          : line);
      }
      return [...it, {
        id: uuid(),
        productId: p.id,
        sku: p.sku,
        description: `${p.name} (${p.brand})`,
        quantity: 1,
        unitPrice: Number(p.price),
      }];
    });
    setPickerOpen(false);
  }

  function removeLine(id: string) {
    setItems((it) => it.filter((line) => line.id !== id));
  }

  function updateLine(id: string, patch: Partial<LineItem>) {
    setItems((it) => it.map((line) => line.id === id ? { ...line, ...patch } : line));
  }

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0),
    [items],
  );
  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const total = subtotal + taxAmount;

  const canSubmit = !!customer && customer.name && customer.phone && items.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const paidNum = Number(paidAmount || 0);
    let status: "draft" | "issued" | "partial" | "paid" = "draft";
    if (issueNow) {
      if (paidNum >= total) status = "paid";
      else if (paidNum > 0) status = "partial";
      else status = "issued";
    }
    create.mutate(
      {
        customer: {
          id: customer.id ?? null,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          company: customer.company || null,
          address: customer.address || null,
        },
        items: items.map((i) => ({
          productId: i.productId ?? null,
          sku: i.sku ?? null,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        status,
        taxRate: Number(taxRate || 0),
        paidAmount: paidNum,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
      },
      { onSuccess: (inv: any) => navigate(`/admin/sales/invoices/${inv.id}`) },
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/sales/invoices" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 hover:border-black hover:text-black">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales · Invoice</p>
          <h1 className="font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>New Invoice</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Customer */}
          <CustomerPicker value={customer} onChange={setCustomer} />

          {/* Items */}
          <section className="rounded-md border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Items</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                  <Search className="h-3.5 w-3.5" /> Pick Product
                </Button>
                <Button type="button" size="sm" onClick={addBlankLine}>
                  <Plus className="h-3.5 w-3.5" /> Add Line
                </Button>
              </div>
            </div>
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center text-black/45">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em]">No items yet</p>
                <p className="mt-1 text-xs">Pick from the catalogue or add a custom line above.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {items.map((it, idx) => (
                  <div key={it.id} className="grid grid-cols-12 items-start gap-2 px-5 py-3">
                    <span className="col-span-1 pt-2 font-mono text-xs text-black/40">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="col-span-12 sm:col-span-5">
                      <input
                        value={it.description}
                        onChange={(e) => updateLine(it.id, { description: e.target.value })}
                        placeholder="Item description"
                        className={inputCls}
                      />
                      {it.sku && <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">SKU · {it.sku}</p>}
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number" min={0} step="0.01"
                        value={it.quantity}
                        onChange={(e) => updateLine(it.id, { quantity: Number(e.target.value) })}
                        placeholder="Qty"
                        className={inputCls}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input
                        type="number" min={0} step="0.01"
                        value={it.unitPrice}
                        onChange={(e) => updateLine(it.id, { unitPrice: Number(e.target.value) })}
                        placeholder="Unit"
                        className={inputCls}
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-1 pt-2 text-right text-sm font-semibold tabular-nums text-black">
                      {(Number(it.quantity || 0) * Number(it.unitPrice || 0)).toLocaleString()}
                    </div>
                    <div className="col-span-1 flex justify-end pt-1">
                      <button type="button" onClick={() => removeLine(it.id)}
                        className="flex h-9 w-9 items-center justify-center text-black/35 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="rounded-md border border-stone-200 bg-white p-5">
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Payment terms, delivery instructions, internal note…"
              className="mt-1.5 w-full resize-none border border-stone-200 bg-white p-3 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-md border border-stone-200 bg-white p-5 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Summary</p>
            <Row label="Subtotal" value={formatKES(subtotal)} />
            <div>
              <label className={labelCls}>Tax %</label>
              <input type="number" min={0} step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputCls + " mt-1.5"} />
            </div>
            <Row label="Tax" value={formatKES(taxAmount)} muted />
            <div className="border-t-2 border-black pt-3">
              <Row label="Total" value={formatKES(total)} bold />
            </div>
            <div>
              <label className={labelCls}>Paid now (KES)</label>
              <input type="number" min={0} step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className={inputCls + " mt-1.5"} />
            </div>
            <div>
              <label className={labelCls}>Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls + " mt-1.5"} />
            </div>
            <label className="flex items-center gap-2 text-xs text-black/65">
              <input type="checkbox" checked={issueNow} onChange={(e) => setIssueNow(e.target.checked)} className="border-stone-300 text-black focus:ring-black/40" />
              Issue immediately (vs. save as draft)
            </label>
            <Button type="submit" disabled={!canSubmit || create.isPending} className="h-10 w-full">
              {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {create.isPending ? "Saving…" : issueNow ? "Issue Invoice" : "Save Draft"}
            </Button>
          </div>
        </aside>
      </form>

      {pickerOpen && <ProductPickerSlider onPick={addProductLine} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between ${bold ? "text-base font-bold text-black" : "text-sm"} ${muted ? "text-black/55" : "text-black"}`}>
      <span className={bold ? "uppercase tracking-[0.2em] text-[10px] text-black/45" : ""}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function ProductPickerSlider({ onPick, onClose }: { onPick: (p: Product) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const { data } = useProducts({ search: search || undefined });
  const products = data?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="flex w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">Pick Products</p>
          <button onClick={onClose} className="text-black/55 hover:text-black">✕</button>
        </header>
        <div className="border-b border-stone-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, brand…"
              className="h-10 w-full border border-stone-200 bg-white pl-9 pr-3 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </div>
        <ul className="flex-1 divide-y divide-stone-100 overflow-y-auto">
          {products.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onPick(p)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50"
              >
                <img src={p.images[0]} alt="" className="h-10 w-10 shrink-0 border border-stone-200 bg-stone-50 object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">{p.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{p.sku} · {p.brand}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-black">{formatKES(p.price)}</p>
              </button>
            </li>
          ))}
          {products.length === 0 && (
            <li className="p-6 text-center text-xs text-black/45">No products match.</li>
          )}
        </ul>
      </aside>
    </div>
  );
}

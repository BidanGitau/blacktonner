import { useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { Check, Download, FileText, Loader2, Minus, Plus, Search, X } from "lucide-react";

import { useCategories, useProducts } from "~/lib/queries";
import { exportCataloguePdf } from "~/lib/catalogue-pdf";
import { useCatalogueStore } from "~/store/catalogue";
import type { Product } from "~/types";

export const meta: MetaFunction = () => [
  { title: "Build Your Catalogue — Blacktoner" },
  { name: "description", content: "Pick products, set quantities, and download a clean PDF catalogue to plan your budget." },
];

export default function CataloguePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [preparedFor, setPreparedFor] = useState("");
  const [notes, setNotes] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data: products = [], isLoading } = useProducts({
    search: search || undefined,
    category: category || undefined,
  });
  const { data: categories = [] } = useCategories();

  const items = useCatalogueStore((s) => s.items);
  const add = useCatalogueStore((s) => s.add);
  const remove = useCatalogueStore((s) => s.remove);
  const setQty = useCatalogueStore((s) => s.setQty);
  const clear = useCatalogueStore((s) => s.clear);

  const selectedIds = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  );

  function handleToggle(product: Product) {
    if (selectedIds.has(product.id)) remove(product.id);
    else add(product, 1);
  }

  async function handleExport() {
    if (!items.length) return;
    setExporting(true);
    try {
      await exportCataloguePdf({
        items,
        preparedFor: preparedFor.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-8 lg:px-6 lg:py-12">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            — Build Your Catalogue —
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <h1
              className="text-3xl font-black uppercase leading-[1.05] tracking-tight text-black md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Plan Your Tech.
              <br />
              <span className="text-black/30">Stay On Budget.</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-black/55">
              Pick the items you're considering, set quantities, and download a clean PDF catalogue with the Blacktoner letterhead — share with your finance team or use it to plan your spend.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          {/* Picker */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 pb-5">
              <div className="relative max-w-sm flex-1 min-w-48">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="h-10 w-full border border-black/15 bg-white pl-9 pr-3 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 border border-black/15 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black focus:border-black focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {(search || category) && (
                <button
                  onClick={() => { setSearch(""); setCategory(""); }}
                  className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black"
                >
                  Clear
                </button>
              )}
              <p className="ml-auto text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                {isLoading ? "Loading…" : `${products.length} products`}
              </p>
            </div>

            {/* Grid */}
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse bg-stone-100" />
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
                  <Search className="h-6 w-6 text-black/25" strokeWidth={1.5} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">No products found</p>
                </div>
              ) : (
                products.map((product) => {
                  const selected = selectedIds.has(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleToggle(product)}
                      className={`group relative flex flex-col border text-left transition-colors ${
                        selected ? "border-black bg-stone-50" : "border-stone-200 bg-white hover:border-black/40"
                      }`}
                    >
                      {selected && (
                        <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center bg-black text-white">
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                        </span>
                      )}
                      <div className="flex aspect-square items-center justify-center bg-stone-50 p-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="border-t border-stone-200 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                          {product.brand}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs font-medium text-black">
                          {product.name}
                        </p>
                        <p
                          className="mt-2 text-sm font-black tabular-nums text-black"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          KES {product.price.toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`flex h-9 items-center justify-center gap-1.5 border-t text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                          selected
                            ? "border-black bg-black text-white"
                            : "border-stone-200 bg-white text-black/55 group-hover:bg-black group-hover:text-white"
                        }`}
                      >
                        {selected ? (
                          <>
                            <Check className="h-3 w-3" /> In Catalogue
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" /> Add
                          </>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Catalogue panel */}
          <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
            <div className="flex h-full flex-col border border-black/10 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-black" strokeWidth={1.6} />
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                    Your Catalogue
                  </p>
                </div>
                {items.length > 0 && (
                  <button
                    onClick={clear}
                    className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40 transition-colors hover:text-red-500"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <FileText className="h-8 w-8 text-black/20" strokeWidth={1.4} />
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/45">
                      Empty catalogue
                    </p>
                    <p className="max-w-55 text-xs text-black/45">
                      Pick items from the left to start building your catalogue.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-stone-100">
                    {items.map((item) => (
                      <li key={item.product.id} className="flex gap-3 p-4">
                        <img
                          src={item.product.images[0]}
                          alt=""
                          className="h-12 w-12 shrink-0 border border-stone-200 bg-stone-50 object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-xs font-medium text-black">
                              {item.product.name}
                            </p>
                            <button
                              onClick={() => remove(item.product.id)}
                              aria-label="Remove"
                              className="shrink-0 text-black/35 transition-colors hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">
                            {item.product.sku}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center border border-black/15">
                              <button
                                onClick={() => setQty(item.product.id, item.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center text-black/70 transition-colors hover:bg-black hover:text-white"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold tabular-nums text-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => setQty(item.product.id, item.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center text-black/70 transition-colors hover:bg-black hover:text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p
                              className="text-xs font-black tabular-nums text-black"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              KES {(item.product.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Meta + total */}
              <div className="border-t border-stone-200 p-5">
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">
                  Prepared For
                </label>
                <input
                  value={preparedFor}
                  onChange={(e) => setPreparedFor(e.target.value)}
                  placeholder="Company or contact name"
                  className="mt-1.5 h-9 w-full border border-black/15 bg-white px-3 text-xs text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                />

                <label className="mt-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">
                  Notes <span className="text-black/30">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Quote scope, delivery window, etc."
                  className="mt-1.5 w-full resize-none border border-black/15 bg-white p-2 text-xs text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                />

                <div className="mt-5 flex items-baseline justify-between border-t-2 border-black pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                    Estimated Total
                  </p>
                  <p
                    className="text-lg font-black tabular-nums text-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    KES {subtotal.toLocaleString()}
                  </p>
                </div>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-black/35">
                  {items.length} item{items.length !== 1 ? "s" : ""} · Excl. delivery
                </p>

                <button
                  onClick={handleExport}
                  disabled={items.length === 0 || exporting}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-black px-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-black/40"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating PDF…
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

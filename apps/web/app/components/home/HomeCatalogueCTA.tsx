import { Link } from "react-router";
import { ArrowRight, FileText } from "lucide-react";

const SAMPLE = [
  { name: "HP LaserJet M404n",   sku: "HP-M404N",     qty: 2, price: "65,000" },
  { name: "Dell Latitude 5550",  sku: "DELL-LAT5550", qty: 1, price: "85,000" },
  { name: "Epson T664 Ink Set",  sku: "EPSON-T664",   qty: 4, price: "14,400" },
  { name: "Logitech MK270 Combo", sku: "LOGI-MK270",  qty: 3, price: "8,550" },
];

export function HomeCatalogueCTA() {
  return (
    <section className="bg-white px-4 py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto lg:px-2">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
          {/* Copy */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
              — Build Your Catalogue —
            </p>
            <h2
              className="text-2xl font-black uppercase leading-[1.05] tracking-tight text-black sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Plan Your Tech.
              <br />
              <span className="text-black/30">Stay On Budget.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-black/55">
              Pick the items you're considering and download a clean PDF catalogue.
              Compare prices, share with your finance team, and decide what fits — before you commit.
            </p>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-stone-200 pt-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Step 01</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">Pick Items</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Step 02</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">Export PDF</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Step 03</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">Share &amp; Decide</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link
                to="/catalogue"
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/85 sm:px-6 sm:text-[11px] sm:tracking-[0.2em]"
              >
                Build A Catalogue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/products"
                className="self-center border-b border-black/20 pb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black/55 transition-colors hover:border-black hover:text-black sm:self-auto sm:text-[11px] sm:tracking-[0.2em]"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* PDF mock */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Stack-of-pages effect */}
            <div className="absolute right-4 top-3 hidden h-full w-[88%] -rotate-2 border border-stone-200 bg-stone-50 lg:block" aria-hidden />
            <div className="absolute right-2 top-1.5 hidden h-full w-[92%] rotate-1 border border-stone-200 bg-white lg:block" aria-hidden />

            <article className="relative aspect-[1/1.3] w-full max-w-sm border border-black/10 bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.18)]">
              {/* Document header */}
              <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-7">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Blacktoner" className="h-9 w-9" />
                  <div>
                    <p
                      className="text-sm font-black uppercase leading-none tracking-tight text-black"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Black<span className="text-black/40">toner</span>
                    </p>
                    <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-black/40">
                      Tech Catalogue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">No.</p>
                  <p className="font-mono text-[10px] font-bold text-black">2026-0042</p>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 border-b border-stone-200 px-4 py-3 sm:px-7 sm:py-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-black/40">Prepared For</p>
                  <p className="mt-0.5 text-[11px] font-bold text-black">Your Company</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-black/40">Date</p>
                  <p className="mt-0.5 text-[11px] font-bold text-black">
                    {new Date().toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Line items */}
              <div className="px-4 py-3 sm:px-7 sm:py-4">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-stone-200 pb-2">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">Item</p>
                  <p className="text-right text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">Qty</p>
                  <p className="text-right text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">Subtotal</p>
                </div>
                <ul className="divide-y divide-stone-100">
                  {SAMPLE.map((row) => (
                    <li key={row.sku} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-black">{row.name}</p>
                        <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-black/40">{row.sku}</p>
                      </div>
                      <p className="text-right font-mono text-[10px] tabular-nums text-black/60">×{row.qty}</p>
                      <p
                        className="text-right text-[11px] font-black tabular-nums text-black"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {row.price}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total */}
              <div className="absolute inset-x-4 bottom-5 sm:inset-x-7 sm:bottom-7">
                <div className="flex items-baseline justify-between border-t-2 border-black pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                    Estimated Total
                  </span>
                  <span
                    className="text-base font-black tabular-nums text-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    KES 172,950
                  </span>
                </div>
                <p className="mt-2 text-[8px] uppercase tracking-[0.22em] text-black/35">
                  Prices valid for 7 days · Excl. delivery
                </p>
              </div>
            </article>

            {/* PDF chip */}
            <span className="pointer-events-none absolute -left-3 top-6 hidden items-center gap-1.5 bg-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white lg:inline-flex">
              <FileText className="h-3 w-3" strokeWidth={1.8} /> .PDF
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Bot } from "lucide-react";

export default function ScraperPage() {
  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Automation
          </p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Scraper
          </h1>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center rounded-md border border-stone-200 bg-white px-6 py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-black/30">
          <Bot className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">Coming soon</p>
        <p className="mt-1.5 max-w-sm text-xs text-black/45">
          Automated catalogue scraping ships in the next build tier.
        </p>
      </div>
    </div>
  );
}

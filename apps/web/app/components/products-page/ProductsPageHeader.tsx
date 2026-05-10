import { Link, useSearchParams } from "react-router";
import { ArrowRight, FileText, X } from "lucide-react";

export function ProductsPageHeader({
  title,
  countLabel,
}: {
  title: string;
  countLabel: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  function clearSearch() {
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    setSearchParams(next);
  }

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-6">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            — Shop —
          </p>
          <h1
            className="text-2xl font-black uppercase leading-none tracking-tight text-black md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
              {countLabel}
            </p>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-black/60">
                "{searchQuery}"
                <button onClick={clearSearch} className="hover:text-black">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>

        <Link
          to="/catalogue"
          className="group inline-flex items-center gap-3 self-start lg:self-end"
        >
          <FileText className="h-4 w-4 text-black" strokeWidth={1.6} />
          <div className="border-b border-black/20 pb-0.5 transition-colors group-hover:border-black">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
              Build A Catalogue
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
              Pick items · Export PDF · Plan budget
            </p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-black/40 transition-all group-hover:translate-x-0.5 group-hover:text-black" strokeWidth={1.8} />
        </Link>
      </div>
    </div>
  );
}

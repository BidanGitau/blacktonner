import { Link } from "react-router";
import { ArrowRight, FileText } from "lucide-react";

export function ProductsPageHeader({
  title,
  countLabel,
}: {
  title: string;
  countLabel: string;
}) {
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
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
            {countLabel}
          </p>
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

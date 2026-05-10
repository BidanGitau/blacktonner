import { XCircle } from "lucide-react";
import { LEAD_STATUS_LABELS, type LeadStatus } from "~/types";

const PIPELINE_ORDER: LeadStatus[] = [
  "new_lead", "contacted", "qualified", "proposal_sent", "negotiating", "won",
];

interface Props {
  current: LeadStatus;
  onChange: (next: LeadStatus) => void;
  disabled?: boolean;
}

export function LeadPipelineStrip({ current, onChange, disabled }: Props) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2">
      {PIPELINE_ORDER.map((s) => {
        const isCurrent = s === current;
        const isPast = PIPELINE_ORDER.indexOf(s) < PIPELINE_ORDER.indexOf(current);
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            disabled={disabled}
            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
              isCurrent
                ? "bg-black text-white"
                : isPast
                ? "bg-stone-100 text-black/55 hover:bg-stone-200"
                : "border border-stone-200 bg-white text-black/55 hover:border-black hover:text-black"
            }`}
          >
            {LEAD_STATUS_LABELS[s]}
          </button>
        );
      })}
      <span className="mx-1 h-4 w-px bg-stone-200" />
      <button
        onClick={() => onChange("on_hold")}
        disabled={disabled}
        className={`px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
          current === "on_hold"
            ? "bg-stone-700 text-white"
            : "border border-stone-200 bg-white text-black/55 hover:border-stone-700 hover:text-stone-700"
        }`}
      >
        On Hold
      </button>
      <button
        onClick={() => onChange("lost")}
        disabled={disabled}
        className={`inline-flex items-center gap-1 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
          current === "lost"
            ? "bg-red-600 text-white"
            : "border border-stone-200 bg-white text-black/55 hover:border-red-600 hover:text-red-600"
        }`}
      >
        <XCircle className="h-3 w-3" /> Lost
      </button>
    </nav>
  );
}

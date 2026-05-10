import { X } from "lucide-react";
import { TICKET_STATUS_LABELS, type TicketStatus } from "~/types";

const PIPELINE_ORDER: TicketStatus[] = [
  "new_ticket", "assigned", "in_progress", "awaiting_parts", "resolved", "closed",
];

interface Props {
  current: TicketStatus;
  hasReport: boolean;
  hasPendingReport: boolean;
  onAdvance: (next: TicketStatus) => void;
  disabled?: boolean;
}

export function TicketStatusStrip({ current, hasReport, hasPendingReport, onAdvance, disabled }: Props) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2">
      {PIPELINE_ORDER.map((s) => {
        const isCurrent = s === current;
        const isPast = PIPELINE_ORDER.indexOf(s) < PIPELINE_ORDER.indexOf(current);
        const isResolveLocked = s === "resolved" && !hasReport && !hasPendingReport;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onAdvance(s)}
            disabled={disabled}
            title={isResolveLocked ? "Attach a resolution report first" : undefined}
            className={`px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
              isCurrent
                ? "bg-black text-white"
                : isPast
                ? "bg-stone-100 text-black/55 hover:bg-stone-200"
                : isResolveLocked
                ? "border border-stone-200 bg-white text-black/30"
                : "border border-stone-200 bg-white text-black/55 hover:border-black hover:text-black"
            }`}
          >
            {TICKET_STATUS_LABELS[s]}
          </button>
        );
      })}
      <span className="mx-1 h-4 w-px bg-stone-200" />
      <button
        type="button"
        onClick={() => onAdvance("cancelled")}
        disabled={disabled || current === "cancelled"}
        className={`inline-flex items-center gap-1 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
          current === "cancelled"
            ? "bg-red-600 text-white"
            : "border border-stone-200 bg-white text-black/55 hover:border-red-600 hover:text-red-600"
        }`}
      >
        <X className="h-3 w-3" /> Cancel
      </button>
    </nav>
  );
}

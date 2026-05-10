import {
  ArrowRight, ArrowUpRight, FileText, Mail, MessageCircle,
  PhoneCall, PhoneIncoming, StickyNote, Users,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/lib/admin-ui";
import {
  LEAD_ACTIVITY_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS,
  type LeadActivity, type LeadActivityType,
} from "~/types";

const ACTIVITY_ICON: Record<LeadActivityType, React.ElementType> = {
  call_outbound: PhoneCall,
  call_inbound:  PhoneIncoming,
  whatsapp:      MessageCircle,
  email:         Mail,
  meeting:       Users,
  note:          StickyNote,
  status_change: ArrowUpRight,
};

interface Props {
  activities: LeadActivity[] | undefined;
}

export function LeadTimeline({ activities }: Props) {
  return (
    <section className="rounded-md border border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Activity Timeline</h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
          {activities?.length ?? 0} entries
        </span>
      </div>
      {!activities?.length ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-black/35">
          <FileText className="h-7 w-7" strokeWidth={1.5} />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]">No activity yet</p>
          <p className="max-w-xs text-xs">Log your first call or note above to start the trail.</p>
        </div>
      ) : (
        <ol className="divide-y divide-stone-100">
          {activities.map((a) => {
            const Icon = ACTIVITY_ICON[a.type];
            return (
              <li key={a.id} className="flex gap-4 p-6">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  a.type === "status_change"
                    ? "border-stone-300 bg-stone-100 text-black/65"
                    : "border-stone-200 bg-white text-black"
                }`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                      {LEAD_ACTIVITY_LABELS[a.type]}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                      {formatDate(a.createdAt, "time")}
                    </p>
                  </div>
                  {a.type === "status_change" && a.fromStatus && a.toStatus && (
                    <p className="mt-1 flex items-center gap-2 text-xs text-black/65">
                      <Badge variant="outline" className={LEAD_STATUS_COLORS[a.fromStatus]}>
                        {LEAD_STATUS_LABELS[a.fromStatus]}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-black/35" />
                      <Badge variant="outline" className={LEAD_STATUS_COLORS[a.toStatus]}>
                        {LEAD_STATUS_LABELS[a.toStatus]}
                      </Badge>
                    </p>
                  )}
                  {a.outcome && (
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                      {a.outcome}
                    </p>
                  )}
                  {a.feedback && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-black/75">
                      {a.feedback}
                    </p>
                  )}
                  {a.durationSec ? (
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-black/40">
                      Duration · {Math.floor(a.durationSec / 60)}m {a.durationSec % 60}s
                    </p>
                  ) : null}
                  {a.agent && (
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-black/45">
                      By {a.agent.name}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

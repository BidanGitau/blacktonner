import { ArrowRight, FileText, MessageCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/lib/admin-ui";
import {
  TICKET_STATUS_COLORS, TICKET_STATUS_LABELS, type TicketUpdate,
} from "~/types";

interface Props {
  updates: TicketUpdate[] | undefined;
}

export function TicketTimeline({ updates }: Props) {
  return (
    <section className="rounded-md border border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Timeline</p>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
          {updates?.length ?? 0} entries
        </span>
      </div>
      {!updates?.length ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-black/35">
          <FileText className="h-7 w-7" strokeWidth={1.5} />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em]">No updates yet</p>
        </div>
      ) : (
        <ol className="divide-y divide-stone-100">
          {updates.map((u) => {
            const isStatus = !!(u.fromStatus && u.toStatus);
            return (
              <li key={u.id} className="flex gap-4 p-6">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  isStatus
                    ? "border-stone-300 bg-stone-100 text-black/65"
                    : "border-stone-200 bg-white text-black"
                }`}>
                  {isStatus
                    ? <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                    : <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.8} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                      {isStatus ? "Status" : "Update"}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                      {formatDate(u.createdAt, "time")}
                    </p>
                  </div>
                  {isStatus && (
                    <p className="mt-1 flex items-center gap-2 text-xs text-black/65">
                      <Badge variant="outline" className={TICKET_STATUS_COLORS[u.fromStatus!]}>
                        {TICKET_STATUS_LABELS[u.fromStatus!]}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-black/35" />
                      <Badge variant="outline" className={TICKET_STATUS_COLORS[u.toStatus!]}>
                        {TICKET_STATUS_LABELS[u.toStatus!]}
                      </Badge>
                    </p>
                  )}
                  {u.body && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-black/75">
                      {u.body}
                    </p>
                  )}
                  {u.author && (
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-black/45">
                      By {u.author.name}
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

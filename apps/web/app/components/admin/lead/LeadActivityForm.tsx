import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { inputBase, labelCls, textareaCls } from "~/lib/admin-ui";
import { LEAD_ACTIVITY_LABELS, type LeadActivityType } from "~/types";

interface Props {
  onSubmit: (payload: {
    type: LeadActivityType;
    outcome?: string;
    feedback?: string;
    durationSec?: number;
  }) => void;
  pending: boolean;
}

export function LeadActivityForm({ onSubmit, pending }: Props) {
  const [activity, setActivity] = useState({
    type: "call_outbound" as LeadActivityType,
    outcome: "",
    feedback: "",
    durationSec: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activity.feedback.trim() && !activity.outcome.trim()) return;
    onSubmit({
      type: activity.type,
      outcome: activity.outcome.trim() || undefined,
      feedback: activity.feedback.trim() || undefined,
      durationSec: activity.durationSec ? Number(activity.durationSec) : undefined,
    });
    setActivity({ type: activity.type, outcome: "", feedback: "", durationSec: "" });
  }

  const fieldCls = `mt-1.5 ${inputBase} border-stone-200`;

  return (
    <section className="rounded-md border border-stone-200 bg-white p-6">
      <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
        Log Activity
      </h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Type</label>
            <select
              value={activity.type}
              onChange={(e) => setActivity((a) => ({ ...a, type: e.target.value as LeadActivityType }))}
              className={fieldCls}
            >
              {(Object.entries(LEAD_ACTIVITY_LABELS) as [LeadActivityType, string][])
                .filter(([v]) => v !== "status_change")
                .map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Outcome</label>
            <input
              value={activity.outcome}
              onChange={(e) => setActivity((a) => ({ ...a, outcome: e.target.value }))}
              placeholder="e.g. interested, voicemail, callback"
              className={fieldCls}
            />
          </div>
          <div>
            <label className={labelCls}>Duration (sec)</label>
            <input
              type="number"
              min={0}
              value={activity.durationSec}
              onChange={(e) => setActivity((a) => ({ ...a, durationSec: e.target.value }))}
              placeholder="optional"
              className={fieldCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Feedback / Notes</label>
          <textarea
            value={activity.feedback}
            onChange={(e) => setActivity((a) => ({ ...a, feedback: e.target.value }))}
            rows={3}
            placeholder="What did they say? Next steps, objections, follow-up needed…"
            className={textareaCls}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Log Activity
        </Button>
      </form>
    </section>
  );
}

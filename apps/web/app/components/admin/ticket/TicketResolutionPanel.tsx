import { CheckCircle2, ExternalLink, Loader2, Paperclip, UploadCloud } from "lucide-react";
import { Button } from "~/components/ui/button";
import { labelCls } from "~/lib/admin-ui";
import type { Ticket } from "~/types";

interface Props {
  ticket: Ticket;
  reportFile: File | null;
  reportNotes: string;
  onFileChange: (file: File | null) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  onResolve: () => void;
  pending: boolean;
}

export function TicketResolutionPanel({
  ticket, reportFile, reportNotes, onFileChange, onNotesChange, onSave, onResolve, pending,
}: Props) {
  const editable = ticket.status !== "resolved" && ticket.status !== "closed";

  return (
    <section className="rounded-md border border-stone-200 bg-white p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Resolution Report</p>

      {ticket.reportUrl ? (
        <a
          href={ticket.reportUrl}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-black hover:border-black"
        >
          <Paperclip className="h-3.5 w-3.5 text-black/55" /> Attached report
          <ExternalLink className="h-3 w-3 text-black/40" />
        </a>
      ) : (
        <p className="mt-2 text-xs text-black/45">No file attached yet.</p>
      )}

      {ticket.reportNotes && (
        <div className="mt-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-black/75 whitespace-pre-wrap">
          {ticket.reportNotes}
        </div>
      )}

      {editable && (
        <div className="mt-5 space-y-3 border-t border-stone-200 pt-5">
          <div>
            <label className={labelCls}>Upload report (PDF, image, doc)</label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-black/65 transition-colors hover:border-black hover:bg-stone-100">
              <UploadCloud className="h-4 w-4 text-black/45" />
              {reportFile ? reportFile.name : "Choose a file"}
              <input
                type="file"
                accept=".pdf,image/*,.doc,.docx"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label className={labelCls}>Notes / what was done</label>
            <textarea
              value={reportNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              placeholder="Replaced fuser unit, calibrated paper sensor, customer signed off."
              className="mt-1.5 w-full resize-none border border-stone-200 bg-white p-3 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onSave}
              disabled={pending || (!reportFile && !reportNotes.trim())}
              variant="outline"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
              Save Report
            </Button>
            <Button
              type="button"
              onClick={onResolve}
              disabled={pending || (!reportFile && !reportNotes.trim() && !ticket.reportUrl)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Resolve & Submit
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AlertTriangle, ArrowLeft, Loader2, Plus } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { TicketResolutionPanel } from "~/components/admin/ticket/TicketResolutionPanel";
import { TicketSidebar } from "~/components/admin/ticket/TicketSidebar";
import { TicketStatusStrip } from "~/components/admin/ticket/TicketStatusStrip";
import { TicketTimeline } from "~/components/admin/ticket/TicketTimeline";
import { useAuthStore } from "~/store/auth";
import {
  useAddTicketUpdate, useDeleteTicket, useTicket, useTicketTechnicians,
  useUpdateTicket, useUpload,
} from "~/lib/queries";
import {
  TICKET_PRIORITY_COLORS, TICKET_PRIORITY_LABELS,
  TICKET_STATUS_COLORS, TICKET_STATUS_LABELS,
  type TicketStatus,
} from "~/types";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: ticket, isLoading } = useTicket(id ?? "");
  const { data: techs = [] } = useTicketTechnicians();
  const update = useUpdateTicket();
  const addUpdate = useAddTicketUpdate();
  const remove = useDeleteTicket();
  const upload = useUpload();

  const [updateBody, setUpdateBody] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportNotes, setReportNotes] = useState("");
  const [transitionError, setTransitionError] = useState<string | null>(null);

  if (isLoading || !ticket) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10 space-y-4">
        <div className="h-8 w-64 animate-pulse bg-stone-100" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="h-96 animate-pulse rounded-md bg-stone-100" />
          <div className="h-72 animate-pulse rounded-md bg-stone-100" />
        </div>
      </div>
    );
  }

  function handleAdvance(next: TicketStatus) {
    if (!ticket) return;
    if (next === ticket.status) return;
    setTransitionError(null);

    if (next === "resolved" && !ticket.reportUrl && !reportNotes.trim() && !reportFile) {
      setTransitionError("Attach a resolution report (file or notes) before marking resolved.");
      return;
    }

    update.mutate({ id: ticket.id, status: next });
  }

  function handlePostUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket || !updateBody.trim()) return;
    addUpdate.mutate(
      { ticketId: ticket.id, body: updateBody.trim(), authorId: user?.id },
      { onSuccess: () => setUpdateBody("") },
    );
  }

  async function handleSubmitReport(opts: { resolve: boolean }) {
    if (!ticket) return;
    setTransitionError(null);

    let reportUrl = ticket.reportUrl;
    if (reportFile) {
      try {
        const dataUrl = await readAsDataUrl(reportFile);
        const result = await upload.mutateAsync({ filename: reportFile.name, data: dataUrl });
        reportUrl = result.url;
      } catch (err: any) {
        setTransitionError(err?.message ?? "Upload failed");
        return;
      }
    }

    if (opts.resolve && !reportUrl && !reportNotes.trim()) {
      setTransitionError("Attach a file or write resolution notes before resolving.");
      return;
    }

    update.mutate(
      {
        id: ticket.id,
        reportUrl: reportUrl ?? undefined,
        reportNotes: reportNotes.trim() || undefined,
        ...(opts.resolve ? { status: "resolved" } : {}),
      },
      { onSuccess: () => { setReportFile(null); setReportNotes(""); } },
    );
  }

  const showResolutionPanel = ["in_progress", "awaiting_parts", "resolved", "closed"].includes(ticket.status);
  const showUpdateForm = ticket.status !== "closed" && ticket.status !== "cancelled";
  const reportPanelPending = upload.isPending || update.isPending;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex flex-wrap items-center gap-4 border-b border-stone-200 pb-6">
        <Link
          to="/admin/maintenance/tickets"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 hover:border-black hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            <span>Ticket</span>
            <span className="font-mono text-black/65">{ticket.number}</span>
          </p>
          <h1 className="truncate font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            {ticket.title}
          </h1>
        </div>
        <Badge variant="outline" className={TICKET_PRIORITY_COLORS[ticket.priority]}>
          {TICKET_PRIORITY_LABELS[ticket.priority]}
        </Badge>
        <Badge variant="outline" className={TICKET_STATUS_COLORS[ticket.status]}>
          {TICKET_STATUS_LABELS[ticket.status]}
        </Badge>
      </header>

      <TicketStatusStrip
        current={ticket.status}
        hasReport={!!ticket.reportUrl}
        hasPendingReport={!!reportFile || !!reportNotes.trim()}
        onAdvance={handleAdvance}
        disabled={update.isPending}
      />

      {transitionError && (
        <div className="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" strokeWidth={1.8} />
          <p className="text-sm text-red-700">{transitionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-md border border-stone-200 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Description</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-black/80">{ticket.description}</p>
          </section>

          {showResolutionPanel && (
            <TicketResolutionPanel
              ticket={ticket}
              reportFile={reportFile}
              reportNotes={reportNotes}
              onFileChange={setReportFile}
              onNotesChange={setReportNotes}
              onSave={() => handleSubmitReport({ resolve: false })}
              onResolve={() => handleSubmitReport({ resolve: true })}
              pending={reportPanelPending}
            />
          )}

          {showUpdateForm && (
            <section className="rounded-md border border-stone-200 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Post Update</p>
              <form onSubmit={handlePostUpdate} className="mt-3 space-y-3">
                <textarea
                  value={updateBody}
                  onChange={(e) => setUpdateBody(e.target.value)}
                  rows={3}
                  placeholder="Spoke to customer, ETA tomorrow 10am · waiting for fuser part to arrive…"
                  className="w-full resize-none border border-stone-200 bg-white p-3 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                />
                <Button type="submit" disabled={addUpdate.isPending || !updateBody.trim()}>
                  {addUpdate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Post
                </Button>
              </form>
            </section>
          )}

          <TicketTimeline updates={ticket.updates} />
        </div>

        <TicketSidebar
          ticket={ticket}
          techs={techs}
          pending={update.isPending}
          onPriorityChange={(priority) => update.mutate({ id: ticket.id, priority })}
          onAssign={(agentId) => update.mutate({ id: ticket.id, assignedToId: agentId || null })}
          onSchedule={(value) => update.mutate({ id: ticket.id, scheduledFor: value || null })}
          onClose={() => handleAdvance("closed")}
          onDelete={() => {
            if (!confirm(`Delete ticket ${ticket.number}? Updates and report will be lost.`)) return;
            remove.mutate(ticket.id, { onSuccess: () => navigate("/admin/maintenance/tickets") });
          }}
          deletePending={remove.isPending}
        />
      </div>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Couldn't read file"));
    reader.readAsDataURL(file);
  });
}

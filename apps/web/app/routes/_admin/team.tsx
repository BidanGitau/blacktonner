import { useState } from "react";
import { Loader2, Plus, ShieldCheck, Trash2, UserCircle2, UsersRound } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  useCreateTeamMember, useDeleteTeamMember, useTeam, useUpdateTeamMember,
} from "~/lib/queries";
import { useAuthStore } from "~/store/auth";
import { formatDate, inputBase, labelCls } from "~/lib/admin-ui";
import type { Role } from "~/types";

const STAFF_ROLES: { value: Role; label: string; description: string }[] = [
  { value: "admin",      label: "Admin",      description: "Full access to all areas" },
  { value: "sales",      label: "Sales",      description: "Leads, customers, invoices, tickets" },
  { value: "technician", label: "Technician", description: "Maintenance tickets only" },
];

const ROLE_BADGE: Record<string, string> = {
  admin:      "border-black bg-black text-white",
  sales:      "border-blue-200 bg-blue-50 text-blue-700",
  technician: "border-orange-200 bg-orange-50 text-orange-700",
};

const fieldCls = `mt-1.5 ${inputBase} border-stone-200`;

export default function TeamPage() {
  const { user: currentUser } = useAuthStore();
  const { data: team = [], isLoading } = useTeam();
  const create = useCreateTeamMember();
  const update = useUpdateTeamMember();
  const remove = useDeleteTeamMember();

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    password: "", role: "sales" as Role,
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) return;
    create.mutate(form, {
      onSuccess: () => setForm({ name: "", email: "", phone: "", password: "", role: "sales" }),
    });
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Settings</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Team
          </h1>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {team.length} member{team.length !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* List */}
        <section className="overflow-hidden rounded-md border border-stone-200 bg-white">
          <div className="border-b border-stone-200 px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Staff</p>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-md bg-stone-100" />)}
            </div>
          ) : team.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-black/35">
              <UsersRound className="h-7 w-7" strokeWidth={1.5} />
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]">No team yet</p>
              <p className="max-w-xs text-xs">Add the first sales agent or technician on the right.</p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {team.map((m) => {
                const isSelf = m.id === currentUser?.id;
                return (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-black/55">
                      <UserCircle2 className="h-4 w-4" strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-black">{m.name} {isSelf && <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-black/40">(you)</span>}</p>
                      <p className="truncate text-xs text-black/55">{m.email}</p>
                    </div>
                    <select
                      value={m.role}
                      onChange={(e) => update.mutate({ id: m.id, role: e.target.value as Role })}
                      disabled={isSelf || update.isPending}
                      className="h-8 border border-stone-200 bg-white px-2 text-xs"
                    >
                      {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <Badge variant="outline" className={ROLE_BADGE[m.role] ?? ""}>
                      {m.role}
                    </Badge>
                    <button
                      type="button"
                      disabled={isSelf || remove.isPending}
                      onClick={() => {
                        if (!confirm(`Remove ${m.name}? They will lose access immediately.`)) return;
                        remove.mutate(m.id);
                      }}
                      title={isSelf ? "You can't delete your own account" : "Remove member"}
                      className="flex h-7 w-7 items-center justify-center text-black/40 hover:text-red-500 disabled:cursor-not-allowed disabled:text-black/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Add form */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <form onSubmit={handleCreate} className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-black/55" strokeWidth={1.8} />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Add Team Member</h2>
            </div>

            <div>
              <label className={labelCls}>Full name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Wanjiku" className={fieldCls} required />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@blacktoner.co.ke" className={fieldCls} required />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="07xx xxx xxx" className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Temporary password</label>
              <input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Share this securely" className={fieldCls} required minLength={6} />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <div className="mt-1.5 space-y-2">
                {STAFF_ROLES.map((r) => (
                  <label key={r.value}
                    className={`flex cursor-pointer items-start gap-2 border p-3 transition-colors ${
                      form.role === r.value ? "border-black bg-stone-50" : "border-stone-200 hover:border-stone-400"
                    }`}>
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={() => setForm((f) => ({ ...f, role: r.value }))}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">{r.label}</p>
                      <p className="text-xs text-black/55">{r.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={create.isPending} className="w-full">
              {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add Member
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}

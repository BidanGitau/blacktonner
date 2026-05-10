import { useState, useEffect } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { useCustomers } from "~/lib/queries";
import type { Customer } from "~/types";

interface CustomerPickerProps {
  value: Pick<Customer, "id" | "name" | "phone" | "email" | "company" | "address"> | null;
  onChange: (customer: { id?: string; name: string; phone: string; email?: string | null; company?: string | null; address?: string | null } | null) => void;
}

/**
 * Inline search-then-edit picker:
 * - Empty state: search input that filters existing customers
 * - Selected: shows the chosen customer's chip with editable fields
 * - "Create new" if no match
 */
export function CustomerPicker({ value, onChange }: CustomerPickerProps) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({ name: "", phone: "", email: "", company: "", address: "" });

  const { data: matches = [] } = useCustomers(search);

  useEffect(() => {
    if (value) setDraft({
      name: value.name,
      phone: value.phone,
      email: value.email ?? "",
      company: value.company ?? "",
      address: value.address ?? "",
    });
  }, [value?.id]);

  if (value) {
    return (
      <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Selected Customer</p>
            <p className="mt-1 text-sm font-medium text-black">{draft.name}</p>
            <p className="font-mono text-[11px] text-black/55">{draft.phone}</p>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setSearch(""); }}
            className="text-black/45 transition-colors hover:text-black"
            aria-label="Clear customer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" value={draft.name} onChange={(v) => updateField("name", v)} />
          <Field label="Phone" value={draft.phone} onChange={(v) => updateField("phone", v)} />
          <Field label="Email" value={draft.email} onChange={(v) => updateField("email", v)} />
          <Field label="Company" value={draft.company} onChange={(v) => updateField("company", v)} />
          <div className="sm:col-span-2">
            <Field label="Address" value={draft.address} onChange={(v) => updateField("address", v)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-stone-200 bg-white p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Customer</p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, email, or company…"
          className="h-10 w-full border border-stone-200 bg-white pl-9 pr-3 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
        />
      </div>

      {search && (
        <div className="mt-3 max-h-64 overflow-y-auto border border-stone-200 bg-white">
          {matches.length ? (
            <ul className="divide-y divide-stone-100">
              {matches.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => { onChange(c); setSearch(""); }}
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-stone-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-black">{c.name}</p>
                      <p className="truncate font-mono text-[10px] text-black/55">{c.phone}{c.company ? ` · ${c.company}` : ""}</p>
                    </div>
                    {c._count && (
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-black/40">
                        {c._count.invoices} inv · {c._count.tickets} tkt
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-xs text-black/45">No matches.</p>
          )}
          <button
            type="button"
            onClick={() => {
              const initial = parsePotentialPhone(search);
              setDraft({ name: initial.isPhone ? "" : search, phone: initial.isPhone ? search : "", email: "", company: "", address: "" });
              onChange({ name: initial.isPhone ? "" : search, phone: initial.isPhone ? search : "" });
              setSearch("");
            }}
            className="flex w-full items-center justify-center gap-2 border-t border-stone-200 bg-stone-50 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-stone-100"
          >
            <UserPlus className="h-3.5 w-3.5" /> Create new customer "{search}"
          </button>
        </div>
      )}
    </div>
  );

  function updateField(key: keyof typeof draft, val: string) {
    const next = { ...draft, [key]: val };
    setDraft(next);
    onChange({ id: value?.id, ...next });
  }
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-9 w-full border border-stone-200 bg-white px-3 text-sm text-black focus:border-black focus:outline-none"
      />
    </div>
  );
}

function parsePotentialPhone(s: string): { isPhone: boolean } {
  const digits = s.replace(/\D/g, "");
  return { isPhone: digits.length >= 7 && digits.length / Math.max(s.length, 1) > 0.6 };
}

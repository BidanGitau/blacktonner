import { useState } from "react";
import { Link } from "react-router";
import { Search, UserCircle2, Phone, Mail, Building2, Receipt, Wrench, Users } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useCustomers } from "~/lib/queries";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading } = useCustomers(search);

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Customers
          </h1>
          <p className="mt-1 text-sm text-black/55">All buying contacts. Search opens their full history.</p>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {customers.length} matching
        </p>
      </header>

      <div className="mb-4 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email or company…"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-md bg-stone-100" />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 border border-stone-200 bg-stone-50 py-16 text-center">
          <Users className="h-7 w-7 text-black/35" strokeWidth={1.5} />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">No customers yet</p>
          <p className="max-w-xs text-xs text-black/55">
            Customers are created when you raise an invoice or a maintenance ticket.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                to={`/admin/sales/customers/${c.id}`}
                className="block rounded-md border border-stone-200 bg-white p-4 transition-colors hover:border-black"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50">
                    <UserCircle2 className="h-5 w-5 text-black/45" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-black">{c.name}</p>
                    {c.company && (
                      <p className="flex items-center gap-1 truncate text-xs text-black/55">
                        <Building2 className="h-3 w-3" /> {c.company}
                      </p>
                    )}
                    <p className="flex items-center gap-1 truncate font-mono text-[11px] text-black/65">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </p>
                    {c.email && (
                      <p className="flex items-center gap-1 truncate text-xs text-black/55">
                        <Mail className="h-3 w-3" /> {c.email}
                      </p>
                    )}
                  </div>
                </div>
                {c._count && (
                  <div className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                    <span className="inline-flex items-center gap-1">
                      <Receipt className="h-3 w-3" /> {c._count.invoices} inv
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> {c._count.tickets} tkt
                    </span>
                    <span className="ml-auto text-black/35">
                      {c._count.leads} lead{c._count.leads !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

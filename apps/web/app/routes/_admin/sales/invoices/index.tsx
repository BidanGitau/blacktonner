import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Plus, Search, Receipt, SlidersHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTableSkeleton } from "~/components/admin/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useInvoices, useInvoiceStats } from "~/lib/queries";
import { formatDate, formatKES } from "~/lib/admin-ui";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  type Invoice,
  type InvoiceStatus,
} from "~/types";

const selectCls =
  "h-9 rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40";

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: invoices = [], isLoading } = useInvoices({ search: search || undefined, status });
  const { data: stats } = useInvoiceStats();

  const columns = useMemo<ColumnDef<Invoice>[]>(() => [
    {
      id: "number",
      accessorKey: "number",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-bold text-black">{getValue<string>()}</span>
      ),
    },
    {
      id: "date",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ getValue }) => (
        <span className="text-[11px] uppercase tracking-[0.16em] text-black/55">
          {formatDate(getValue<string>())}
        </span>
      ),
    },
    {
      id: "customer",
      accessorFn: (row) => row.customer?.name ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row: { original: inv } }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-black">{inv.customer?.name ?? "—"}</p>
          <p className="truncate font-mono text-[10px] text-black/55">{inv.customer?.phone ?? ""}</p>
        </div>
      ),
    },
    {
      id: "total",
      accessorKey: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row: { original: inv } }) => {
        const due = inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== "paid" && inv.status !== "cancelled";
        return (
          <div className="tabular-nums">
            <div className="font-semibold text-black">{formatKES(inv.total)}</div>
            {due && (
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">overdue</div>
            )}
          </div>
        );
      },
    },
    {
      id: "paid",
      accessorKey: "paidAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Paid" />,
      cell: ({ getValue }) => {
        const v = Number(getValue<number>());
        return (
          <span className="tabular-nums text-black/70">{v > 0 ? formatKES(v) : "—"}</span>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ getValue }) => {
        const s = getValue<InvoiceStatus>();
        return (
          <Badge variant="outline" className={INVOICE_STATUS_COLORS[s]}>
            {INVOICE_STATUS_LABELS[s]}
          </Badge>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: invoices,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Invoices
          </h1>
        </div>
        <Button asChild>
          <Link to="/admin/sales/invoices/new"><Plus className="h-4 w-4" /> New Invoice</Link>
        </Button>
      </header>

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-stone-200 bg-stone-200 sm:grid-cols-3">
          <Stat label="Outstanding" value={formatKES(stats.outstanding)} sub={`${stats.outstandingCount} invoice${stats.outstandingCount !== 1 ? "s" : ""}`} accent="text-orange-600" />
          <Stat label="Paid Today"   value={formatKES(stats.paidToday)}   sub={`${stats.paidTodayCount} closed`} accent="text-emerald-700" />
          <Stat label="Drafts"       value={String(stats.drafts)}         sub="awaiting issue" />
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search number, customer, phone…" className="pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectCls}>
          <option value="all">All statuses</option>
          {(Object.entries(INVOICE_STATUS_LABELS) as [InvoiceStatus, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-9">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((c) => c.getCanHide()).map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                className="capitalize"
                checked={col.getIsVisible()}
                onCheckedChange={(value) => col.toggleVisibility(!!value)}
              >
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {isLoading ? (
        <DataTableSkeleton rows={8} />
      ) : (
        <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => navigate(`/admin/sales/invoices/${row.original.id}`)}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-black/35">
                      <Receipt className="h-7 w-7" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">No invoices</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent = "" }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">{label}</p>
      <p className={`mt-2 text-2xl font-black tabular-nums ${accent || "text-black"}`} style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-black/40">{sub}</p>}
    </div>
  );
}

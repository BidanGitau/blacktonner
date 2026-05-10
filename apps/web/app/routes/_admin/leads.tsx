import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Plus, Search, Phone, Mail, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTableSkeleton } from "~/components/admin/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Pagination } from "~/components/admin/Pagination";
import { useDeleteLead, useLeadAgents, useLeads } from "~/lib/queries";
import { formatDate, formatKES } from "~/lib/admin-ui";
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  type Lead,
  type LeadStatus,
  type LeadSource,
} from "~/types";

const selectCls =
  "h-9 rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: leadsData, isLoading } = useLeads({
    status,
    assignedToId: assignedTo || undefined,
    source: source || undefined,
    search: search || undefined,
    page,
    limit: pageSize,
  });
  const leads = leadsData?.data ?? [];
  const total = leadsData?.total ?? 0;
  const { data: agents = [] } = useLeadAgents();
  const deleteLead = useDeleteLead();

  const columns = useMemo<ColumnDef<Lead>[]>(() => [
    {
      id: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      accessorKey: "name",
      cell: ({ row }) => {
        const l = row.original;
        return (
          <div>
            <Link to={`/admin/sales/leads/${l.id}`} className="font-medium text-black hover:underline">
              {l.name}
            </Link>
            {l.company && <p className="text-xs text-black/45">{l.company}</p>}
          </div>
        );
      },
    },
    {
      id: "phone",
      header: "Phone",
      enableSorting: false,
      cell: ({ row }) => (
        <a href={`tel:${row.original.phone}`} className="inline-flex items-center gap-1 font-mono text-xs text-black/70 hover:text-black">
          <Phone className="h-3 w-3" /> {row.original.phone}
        </a>
      ),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant="outline" className={LEAD_STATUS_COLORS[row.original.status]}>
          {LEAD_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "source",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      accessorFn: (l) => LEAD_SOURCE_LABELS[l.source],
      cell: ({ getValue }) => <span className="text-xs text-black/55">{getValue<string>()}</span>,
    },
    {
      id: "assignedTo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned" />,
      accessorFn: (l) => l.assignedTo?.name ?? "—",
      cell: ({ row }) => (
        <span className="text-xs text-black/65">
          {row.original.assignedTo?.name ?? <span className="text-black/30">Unassigned</span>}
        </span>
      ),
    },
    {
      id: "value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
      accessorFn: (l) => l.estimatedValue ?? 0,
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-black">
          {row.original.estimatedValue
            ? formatKES(row.original.estimatedValue)
            : <span className="font-normal text-black/30">—</span>}
        </span>
      ),
    },
    {
      id: "nextFollowUp",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Follow-Up" />,
      accessorKey: "nextFollowUp",
      cell: ({ row }) => {
        const date = row.original.nextFollowUp ? new Date(row.original.nextFollowUp) : null;
        if (!date) return <span className="text-xs text-black/30">—</span>;
        const overdue = date < new Date() && row.original.status !== "won" && row.original.status !== "lost";
        return (
          <span className={`text-xs ${overdue ? "font-bold text-red-600" : "text-black/65"}`}>
            {formatDate(date)}
            {overdue && " · overdue"}
          </span>
        );
      },
    },
    {
      id: "activities",
      header: "Touch",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-black/55">
          {row.original._count?.activities ?? 0}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/admin/sales/leads/${row.original.id}`}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Open
              </Link>
            </DropdownMenuItem>
            {row.original.email && (
              <DropdownMenuItem asChild>
                <a href={`mailto:${row.original.email}`}>
                  <Mail className="mr-2 h-3.5 w-3.5" /> Email
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => { if (confirm(`Delete lead "${row.original.name}"?`)) deleteLead.mutate(row.original.id); }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deleteLead]);

  const table = useReactTable({
    data: leads,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: leadsData?.totalPages ?? 0,
  });

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Leads
          </h1>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {leads.length} total
        </p>
      </header>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectCls}>
          <option value="all">All statuses</option>
          {(Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={selectCls}>
          <option value="">All agents</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={selectCls}>
          <option value="">All sources</option>
          {(Object.entries(LEAD_SOURCE_LABELS) as [LeadSource, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <Button asChild className="ml-auto">
          <Link to="/admin/sales/leads/new"><Plus className="h-4 w-4" /> New Lead</Link>
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <DataTableSkeleton rows={6} />
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
                  <TableRow key={row.id}>
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
                      <Users className="h-7 w-7" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">No leads found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={total}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }}
      />
    </div>
  );
}

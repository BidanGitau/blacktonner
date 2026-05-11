import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
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
import { Search, Users, SlidersHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTableSkeleton } from "~/components/admin/data-table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useCustomers } from "~/lib/queries";
import type { Customer } from "~/types";

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: customers = [], isLoading } = useCustomers(search);

  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ getValue }) => (
        <span className="font-medium text-black">{getValue<string>()}</span>
      ),
    },
    {
      id: "company",
      accessorFn: (row) => row.company ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ getValue }) => (
        <span className="text-black/70">{getValue<string>() || "—"}</span>
      ),
    },
    {
      id: "phone",
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-black/65">{getValue<string>()}</span>
      ),
    },
    {
      id: "email",
      accessorFn: (row) => row.email ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ getValue }) => (
        <span className="text-black/65">{getValue<string>() || "—"}</span>
      ),
    },
    {
      id: "invoices",
      accessorFn: (row) => row._count?.invoices ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoices" />,
      cell: ({ getValue }) => (
        <span className="tabular-nums text-black/70">{getValue<number>()}</span>
      ),
    },
    {
      id: "tickets",
      accessorFn: (row) => row._count?.tickets ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tickets" />,
      cell: ({ getValue }) => (
        <span className="tabular-nums text-black/70">{getValue<number>()}</span>
      ),
    },
    {
      id: "leads",
      accessorFn: (row) => row._count?.leads ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Leads" />,
      cell: ({ getValue }) => (
        <span className="tabular-nums text-black/70">{getValue<number>()}</span>
      ),
    },
  ], []);

  const table = useReactTable({
    data: customers,
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
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Sales</p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Customers
          </h1>
          <p className="mt-1 text-sm text-black/55">All buying contacts. Click a row to open their full history.</p>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {customers.length} matching
        </p>
      </header>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email or company…"
            className="pl-9"
          />
        </div>
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
                    onClick={() => navigate(`/admin/sales/customers/${row.original.id}`)}
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
                      <Users className="h-7 w-7" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">No customers</p>
                      <p className="max-w-xs text-xs text-black/45">Customers are created when you raise an invoice or a maintenance ticket.</p>
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

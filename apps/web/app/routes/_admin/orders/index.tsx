import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTableSkeleton } from "~/components/admin/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Pagination } from "~/components/admin/Pagination";
import { useAdminOrders } from "~/lib/queries";
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from "~/types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending_confirmation: "border-orange-200 bg-orange-50 text-orange-600",
  confirmed: "border-blue-200 bg-blue-50 text-blue-600",
  out_for_delivery: "border-purple-200 bg-purple-50 text-purple-600",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-600",
};

const selectCls =
  "h-9 rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40";

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data, isLoading } = useAdminOrders({
    status: status || undefined,
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: pageSize,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const columns = useMemo<ColumnDef<Order>[]>(() => [
    {
      id: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      accessorKey: "id",
      cell: ({ row }) => (
        <Link
          to={`/admin/orders/${row.original.id}`}
          className="font-mono text-xs font-bold text-black hover:underline"
        >
          #{row.original.id.slice(-8).toUpperCase()}
        </Link>
      ),
    },
    {
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      accessorFn: (row) => row.customer.name,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-black">{row.original.customer.name}</p>
          <p className="text-xs text-black/45">{row.original.phone}</p>
        </div>
      ),
    },
    {
      id: "items",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
      accessorFn: (row) => row.items.length,
      cell: ({ row }) => (
        <span className="text-sm text-black/60">
          {row.original.items.length} item{row.original.items.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      id: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      accessorKey: "total",
      cell: ({ row }) => (
        <div className="font-semibold tabular-nums text-black">
          KES {row.original.total.toLocaleString()}
        </div>
      ),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorKey: "status",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="outline" className={STATUS_BADGE[row.original.status]}>
          {ORDER_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-sm text-black/55">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Operations
          </p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Orders
          </h1>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {total} total
        </p>
      </header>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone…"
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className={selectCls}
        >
          <option value="">All statuses</option>
          {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          className={selectCls}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1); }}
          className={selectCls}
        />
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                      <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                        No orders found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
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

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, MoreHorizontal, Search, ShoppingBag } from "lucide-react";

import { DataTableCard, DataTableEmpty, DataTableSkeleton } from "~/components/admin/data-table";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTablePagination } from "~/components/admin/data-table-pagination";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useAdminOrders } from "~/lib/queries";
import { formatKES } from "~/lib/utils";
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from "~/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_confirmation: "bg-orange-50 text-orange-600",
  confirmed: "bg-blue-50 text-blue-600",
  out_for_delivery: "bg-purple-50 text-purple-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading } = useAdminOrders({
    status: status || undefined,
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const columns = useMemo<ColumnDef<Order>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select order ${row.original.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "id",
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => (
        <Link
          to={`/admin/orders/${row.original.id}`}
          className="font-mono text-xs text-blue-600 hover:underline"
        >
          #{row.original.id.slice(-8).toUpperCase()}
        </Link>
      ),
    },
    {
      id: "customer",
      accessorFn: (row) => row.customer.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{row.original.customer.name}</p>
          <p className="text-xs text-slate-400">{row.original.phone}</p>
        </div>
      ),
    },
    {
      id: "items",
      accessorFn: (row) => row.items.length,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {row.original.items.length} item{row.original.items.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      id: "total",
      accessorKey: "total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-slate-900">
          {formatKES(row.original.total)}
        </span>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className={STATUS_COLORS[row.original.status]}>
          {ORDER_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <span className="text-xs text-slate-400">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/orders/${row.original.id}`)}>
              <Eye className="mr-2 h-3.5 w-3.5" />
              View order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [navigate]);

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, pagination, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">{total} orders total</p>
        </div>
      </div>

      <DataTableCard>
        <div className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((state) => ({ ...state, pageIndex: 0 }));
                }}
                placeholder="Filter orders..."
                className="h-9 pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                value={status || "all"}
                onValueChange={(value) => {
                  setStatus(value === "all" ? "" : value);
                  setPagination((state) => ({ ...state, pageIndex: 0 }));
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPagination((state) => ({ ...state, pageIndex: 0 }));
                }}
                className="h-9 w-full sm:w-[160px]"
              />
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPagination((state) => ({ ...state, pageIndex: 0 }));
                }}
                className="h-9 w-full sm:w-[160px]"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <DataTableSkeleton rows={8} />
        ) : orders.length === 0 ? (
          <DataTableEmpty
            icon={<ShoppingBag className="h-10 w-10" />}
            title="No orders found"
            description="Orders that match your current filters will appear here."
          />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.id === "total" || header.id === "actions"
                          ? "text-right"
                          : undefined
                      }
                    >
                      <span
                        className={
                          header.id === "total" || header.id === "actions"
                            ? "flex items-center justify-end gap-1"
                            : "flex items-center gap-1"
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "total" || cell.column.id === "actions"
                          ? "text-right"
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTableCard>

      <div className="mt-4">
        <DataTableCard className="rounded-2xl">
          <DataTablePagination table={table} />
        </DataTableCard>
      </div>
    </div>
  );
}

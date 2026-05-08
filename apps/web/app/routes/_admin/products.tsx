import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  DropdownMenuSeparator,
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
import { useProducts, useCategories, useDeleteProduct } from "~/lib/queries";
import { formatKES } from "~/lib/utils";
import type { Product } from "~/types";

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data: products = [], isLoading } = useProducts({
    search: search || undefined,
    category: category || undefined,
  });
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();

  const columns = useMemo<ColumnDef<Product>[]>(() => [
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
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "product",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
      accessorFn: (row) => row.name,
      cell: ({ row: { original: p } }) => (
        <div className="flex items-center gap-3">
          <img
            src={p.images[0]}
            alt=""
            className="h-10 w-10 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate max-w-48">{p.name}</p>
            <p className="text-xs text-slate-400">{p.brand}</p>
          </div>
        </div>
      ),
    },
    {
      id: "sku",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
      accessorKey: "sku",
      cell: ({ getValue }) => (
        <span className="text-slate-500 font-mono text-xs">{getValue<string>()}</span>
      ),
    },
    {
      id: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      accessorFn: (row) => row.category.name,
      cell: ({ getValue }) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 capitalize">
          {getValue<string>()}
        </span>
      ),
    },
    {
      id: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      accessorKey: "price",
      cell: ({ row: { original: p } }) => (
        <div className="text-right">
          <p className="font-semibold text-slate-900">{formatKES(p.price)}</p>
          {p.originalPrice && (
            <p className="text-xs text-slate-400 line-through">{formatKES(p.originalPrice)}</p>
          )}
        </div>
      ),
    },
    {
      id: "stock",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
      accessorKey: "stock",
      cell: ({ getValue }) => {
        const stock = getValue<number>();
        return (
          <span className={`text-xs font-semibold text-right block ${stock === 0 ? "text-red-500" : stock <= 5 ? "text-orange-500" : "text-green-600"}`}>
            {stock}
          </span>
        );
      },
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorKey: "active",
      cell: ({ row: { original: p } }) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className={p.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-slate-100 text-slate-500 hover:bg-slate-100"}>
            {p.active ? "Active" : "Draft"}
          </Badge>
          {p.badge && (
            <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
              {p.badge}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row: { original: p } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit product
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => {
                if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                  deleteProduct.mutate(p.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deleteProduct, navigate]);

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} products total</p>
        </div>
      </div>

      <DataTableCard>
        <div className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter products..."
                className="h-9 pl-9"
              />
            </div>
            <Select value={category || "all"} onValueChange={(value) => setCategory(value === "all" ? "" : value)}>
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button asChild className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800">
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <DataTableSkeleton rows={6} />
        ) : products.length === 0 ? (
          <DataTableEmpty
            icon={<Package className="h-10 w-10" />}
            title="No products found"
            description="Add your first product or adjust your filters."
            action={
              <Button asChild>
                <Link to="/admin/products/new">Add product</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className={`${h.id === "price" || h.id === "stock" || h.id === "actions" ? "text-right" : ""}`}
                    >
                      <span className={`flex items-center gap-1 ${h.id === "price" || h.id === "stock" || h.id === "actions" ? "justify-end" : ""}`}>
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
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
                      className={cell.column.id === "price" || cell.column.id === "stock" || cell.column.id === "actions" ? "text-right" : undefined}
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

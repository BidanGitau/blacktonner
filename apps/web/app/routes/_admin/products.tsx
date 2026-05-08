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
  type RowSelectionState,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Package, Search, MoreHorizontal, SlidersHorizontal, EyeOff, Eye, Upload } from "lucide-react";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTableSkeleton } from "~/components/admin/data-table";
import { ImportProductsDialog } from "~/components/admin/ImportProductsDialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useProducts, useCategories, useDeleteProduct, useUpdateProduct } from "~/lib/queries";
import type { Product } from "~/types";

const selectCls =
  "h-9 rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40";

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data: products = [], isLoading } = useProducts({
    search: search || undefined,
    category: category || undefined,
  });
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
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
            className="h-9 w-9 shrink-0 rounded-md border border-stone-200 bg-stone-50 object-contain p-1"
          />
          <div className="min-w-0">
            <p className="truncate max-w-48 font-medium text-black">{p.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/40">{p.brand}</p>
          </div>
        </div>
      ),
    },
    {
      id: "sku",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
      accessorKey: "sku",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-black/55">{getValue<string>()}</span>
      ),
    },
    {
      id: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      accessorFn: (row) => row.category.name,
      cell: ({ getValue }) => (
        <Badge variant="outline">{getValue<string>()}</Badge>
      ),
    },
    {
      id: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      accessorKey: "price",
      cell: ({ row: { original: p } }) => (
        <div className="tabular-nums">
          <div className="font-semibold text-black">KES {p.price.toLocaleString()}</div>
          {p.originalPrice && (
            <div className="text-xs text-black/35 line-through">{p.originalPrice.toLocaleString()}</div>
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
          <Badge variant="outline" className={
            stock === 0 ? "border-red-200 bg-red-50 text-red-600"
            : stock <= 5 ? "border-orange-200 bg-orange-50 text-orange-600"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }>
            {stock}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorKey: "active",
      enableSorting: false,
      cell: ({ row: { original: p } }) => (
        <div className="flex flex-wrap gap-1">
          <Badge variant={p.active ? "default" : "secondary"}>
            {p.active ? "Active" : "Draft"}
          </Badge>
          {p.badge && (
            <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
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
      enableHiding: false,
      cell: ({ row: { original: p } }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/admin/products/${p.id}/edit`}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={updateProduct.isPending}
              onClick={() => updateProduct.mutate({ id: p.id, active: !p.active })}
            >
              {p.active ? (
                <><EyeOff className="mr-2 h-3.5 w-3.5" /> Deactivate</>
              ) : (
                <><Eye className="mr-2 h-3.5 w-3.5" /> Activate</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              disabled={deleteProduct.isPending}
              onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteProduct.mutate(p.id); }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deleteProduct, updateProduct]);

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Catalogue
          </p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Products
          </h1>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {products.length} total
        </p>
      </header>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand or SKU…"
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectCls}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
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
        <ImportProductsDialog>
          <Button variant="outline" size="sm" className="h-9">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
        </ImportProductsDialog>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </Button>
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
                      <Package className="h-7 w-7" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                        No products found
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
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

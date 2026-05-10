import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Tag, X, Check, Search, MoreHorizontal, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTableSkeleton } from "~/components/admin/data-table";
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
import { useCategories, useCategoriesCount, useCreateCategory, useUpdateCategory, useDeleteCategory } from "~/lib/queries";
import type { Category } from "~/types";

interface FormState { name: string; slug: string; description: string; }
const emptyForm: FormState = { name: "", slug: "", description: "" };

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const inputCls =
  "h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-1 focus:ring-black/40";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: categories = [], isLoading } = useCategories({ page, limit: pageSize, search: globalFilter });
  const { data: totalCount = 0 } = useCategoriesCount(globalFilter);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "" });
    setAdding(false);
  }

  function cancel() { setAdding(false); setEditId(null); setForm(emptyForm); }

  function saveAdd() {
    if (!form.name.trim()) return;
    create.mutate(
      { name: form.name.trim(), slug: form.slug || toSlug(form.name), description: form.description || undefined },
      { onSuccess: cancel },
    );
  }

  function saveEdit() {
    if (!editId || !form.name.trim()) return;
    update.mutate(
      { id: editId, name: form.name.trim(), slug: form.slug || toSlug(form.name), description: form.description || undefined },
      { onSuccess: cancel },
    );
  }

  const columns = useMemo<ColumnDef<Category>[]>(() => [
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
      id: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      accessorKey: "name",
      cell: ({ row }) => {
        const cat = row.original;
        if (editId === cat.id) {
          return (
            <div className="space-y-2 py-1">
              <div className="grid grid-cols-2 gap-2">
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" autoFocus className={inputCls} />
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="slug" className={inputCls} />
              </div>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className={inputCls} />
            </div>
          );
        }
        return (
          <div>
            <p className="font-medium text-black">{cat.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{cat.slug}</p>
            {cat.description && <p className="mt-0.5 text-xs text-black/55">{cat.description}</p>}
          </div>
        );
      },
    },
    {
      id: "products",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Products" />,
      accessorFn: (row) => row._count?.products ?? 0,
      cell: ({ getValue }) => (
        <Badge variant="secondary">{getValue<number>()} products</Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const cat = row.original;
        if (editId === cat.id) {
          return (
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" onClick={saveEdit} disabled={update.isPending}>
                <Check className="h-3.5 w-3.5" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={cancel}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          );
        }
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => startEdit(cat)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => { if (confirm(`Delete "${cat.name}"?`)) del.mutate(cat.id); }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [editId, form, update.isPending, del.isPending]);

  const table = useReactTable({
    data: categories,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Catalogue
          </p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Categories
          </h1>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {categories.length} total
        </p>
      </header>

      <div>
      {/* Add form */}
      {adding && (
        <div className="mb-4 space-y-3 rounded-md border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">New Category</p>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))} placeholder="Name" autoFocus className={inputCls} />
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="slug" className={inputCls} />
          </div>
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className={inputCls} />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveAdd} disabled={create.isPending}>
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel}>
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input value={globalFilter} onChange={(e) => { setGlobalFilter(e.target.value); setPage(1); }} placeholder="Filter categories…" className="pl-9" />
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
        {!adding && !editId && (
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add category
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <DataTableSkeleton rows={4} />
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
                    data-state={row.getIsSelected() && "selected"}
                    className={editId === row.original.id ? "bg-stone-50" : undefined}
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
                      <Tag className="h-7 w-7" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">
                        {categories.length === 0 ? "No categories yet" : "No results"}
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
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
            {table.getFilteredSelectedRowModel().rows.length} of {totalCount} total
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-black/55">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-8 rounded-md border border-stone-200 bg-white px-2 text-xs"
            >
              {[20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-black/55">
            Page {page} of {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}

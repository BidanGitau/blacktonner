import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Tag, X, Check, Search, MoreHorizontal } from "lucide-react";
import { DataTableCard, DataTableEmpty, DataTableSkeleton } from "~/components/admin/data-table";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "~/lib/queries";
import type { Category } from "~/types";

interface FormState {
  name: string;
  slug: string;
  description: string;
}

const emptyForm: FormState = { name: "", slug: "", description: "" };

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const inputCls = "text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "" });
    setAdding(false);
  }

  function cancel() {
    setAdding(false);
    setEditId(null);
    setForm(emptyForm);
  }

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
      id: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      accessorKey: "name",
      cell: ({ row }) => {
        const cat = row.original;
        if (editId === cat.id) {
          return (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Name"
                  autoFocus
                  className={inputCls}
                />
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="slug"
                  className={inputCls}
                />
              </div>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                className={`w-full ${inputCls}`}
              />
            </div>
          );
        }
        return (
          <div>
            <p className="font-semibold text-slate-900">{cat.name}</p>
            <p className="text-xs text-slate-400 font-mono">{cat.slug}</p>
            {cat.description && <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>}
          </div>
        );
      },
    },
    {
      id: "products",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Products" />,
      accessorFn: (row) => row._count?.products ?? 0,
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
          {getValue<number>()} products
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const cat = row.original;
        if (editId === cat.id) {
          return (
            <div className="flex gap-2 justify-end">
              <Button
                onClick={saveEdit}
                disabled={update.isPending}
                size="sm"
                className="rounded-xl"
              >
                <Check className="h-3 w-3" /> Save
              </Button>
              <Button onClick={cancel} variant="ghost" size="sm" className="rounded-xl text-slate-500 hover:text-slate-900">
                Cancel
              </Button>
            </div>
          );
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => startEdit(cat)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  if (confirm(`Delete "${cat.name}"?`)) del.mutate(cat.id);
                }}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [editId, form, update.isPending, del.isPending]);

  const table = useReactTable({
    data: categories,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  });

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">{categories.length} categories</p>
        </div>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-700">New Category</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))}
              placeholder="Name"
              autoFocus
              className={inputCls}
            />
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="slug"
              className={inputCls}
            />
          </div>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            className={`w-full ${inputCls}`}
          />
          <div className="flex gap-2">
            <Button
              onClick={saveAdd}
              disabled={create.isPending}
              className="rounded-xl"
            >
              <Check className="h-3.5 w-3.5" /> Save
            </Button>
            <Button onClick={cancel} variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-900">
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <DataTableCard>
        <div className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Filter categories..."
              className="h-9 pl-9"
            />
          </div>
          {!adding && !editId ? (
            <Button
              onClick={() => setAdding(true)}
              className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Add category
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <DataTableSkeleton rows={4} />
        ) : table.getRowModel().rows.length === 0 ? (
          <DataTableEmpty
            icon={<Tag className="h-10 w-10" />}
            title={categories.length === 0 ? "No categories yet" : "No matching categories"}
            description={categories.length === 0 ? "Create categories to organize your product catalog." : "Try a different search term."}
          />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/80">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className={h.id === "actions" ? "text-right" : ""}
                    >
                      <span className={`flex items-center gap-1 ${h.id === "actions" ? "justify-end" : ""}`}>
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={editId === row.original.id ? "bg-blue-50/40 hover:bg-blue-50/40" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "actions" ? "text-right" : undefined}
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
    </div>
  );
}

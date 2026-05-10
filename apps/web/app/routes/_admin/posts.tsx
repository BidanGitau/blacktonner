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
import { Plus, Pencil, Trash2, FileText, PlayCircle, Search, MoreHorizontal, SlidersHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "~/components/admin/data-table-column-header";
import { DataTableSkeleton } from "~/components/admin/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { useAdminPosts, useDeletePost } from "~/lib/queries";
import { POST_CATEGORY_LABELS, type Post, type PostCategory } from "~/types";

const selectCls =
  "h-9 rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40";

export default function AdminPostsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: posts = [], isLoading } = useAdminPosts({
    search: search || undefined,
    category: category || undefined,
    status,
  });
  const deletePost = useDeletePost();

  const columns = useMemo<ColumnDef<Post>[]>(() => [
    {
      id: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      accessorKey: "title",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            {p.coverImage ? (
              <img
                src={p.coverImage}
                alt=""
                className="h-10 w-14 shrink-0 border border-stone-200 bg-stone-50 object-cover"
              />
            ) : (
              <div className="flex h-10 w-14 shrink-0 items-center justify-center border border-stone-200 bg-stone-50 text-black/30">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0">
              <p className="line-clamp-1 max-w-md font-medium text-black">{p.title}</p>
              <p className="line-clamp-1 max-w-md text-xs text-black/45">{p.excerpt}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      accessorFn: (p) => POST_CATEGORY_LABELS[p.category],
      cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
    },
    {
      id: "media",
      header: "Media",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.videoUrl && (
            <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
              <PlayCircle className="mr-1 h-3 w-3" /> Video
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      accessorKey: "status",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
          {row.original.status === "published" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      id: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      accessorKey: "updatedAt",
      cell: ({ row }) => (
        <span className="text-sm text-black/55">
          {new Date(row.original.updatedAt).toLocaleDateString()}
        </span>
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
              <Link to={`/admin/posts/${p.id}/edit`}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            {p.status === "published" && (
              <DropdownMenuItem asChild>
                <Link to={`/blog/${p.slug}`} target="_blank">View live</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              disabled={deletePost.isPending}
              onClick={() => { if (confirm(`Delete "${p.title}"?`)) deletePost.mutate(p.id); }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [deletePost]);

  const table = useReactTable({
    data: posts,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Content
          </p>
          <h1 className="font-black uppercase tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            Blog Posts
          </h1>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">
          {posts.length} total
        </p>
      </header>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.8} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or excerpt…"
            className="pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="">All categories</option>
          {(Object.entries(POST_CATEGORY_LABELS) as [PostCategory, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
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
        <Button asChild>
          <Link to="/admin/posts/new">
            <Plus className="h-4 w-4" /> New Post
          </Link>
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
                      <FileText className="h-7 w-7" strokeWidth={1.5} />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em]">No posts found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-end gap-3 rounded-md border border-stone-200 bg-white px-3 py-3 sm:mt-4 sm:justify-between sm:px-4">
        <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 sm:block">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
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

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "~/components/ui/button";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  selectedCount?: number;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  selectedCount = 0,
  pageSizeOptions = [20, 50, 100],
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
            {selectedCount} of {totalCount} selected
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-black/55">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="h-8 rounded-md border border-stone-200 bg-white px-2 text-xs"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-black/55">
          Page {page} of {totalPages} ({totalCount} items)
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

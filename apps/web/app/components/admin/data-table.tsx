import type { ReactNode } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function DataTableCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-stone-200 bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DataTableEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-black/30">
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-xs text-black/45">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function DataTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-stone-200 rounded-md border border-stone-200 bg-white">
      <div className="flex h-10 items-center px-4">
        <div className="h-3 w-24 animate-pulse rounded bg-stone-200" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex h-12 items-center px-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

export function DataTablePagination({
  pageLabel,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  pageLabel: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-stone-200 bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">{pageLabel}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!canPrevious}
        >
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!canNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

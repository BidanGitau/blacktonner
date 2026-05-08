import { ChevronDown, SlidersHorizontal } from "lucide-react";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_SORT_OPTIONS,
} from "~/components/products-page/products-page-data";

export function ProductsToolbar({
  category,
  sort,
  showFilters,
  minPrice,
  maxPrice,
  onToggleFilters,
  onSelectCategory,
  onSortChange,
  onMinPriceChange,
  onMaxPriceChange,
  onRangeChange,
  onResetPrice,
}: {
  category: string;
  sort: string;
  showFilters: boolean;
  minPrice: number;
  maxPrice: number;
  onToggleFilters: () => void;
  onSelectCategory: (value: string) => void;
  onSortChange: (value: string) => void;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onRangeChange: (value: number) => void;
  onResetPrice: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFilters}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Filters"}
        </button>

        <div className="hidden flex-1 flex-wrap items-center gap-2 md:flex">
          {PRODUCT_CATEGORIES.map((categoryOption) => (
            <button
              key={categoryOption.value}
              onClick={() => onSelectCategory(categoryOption.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === categoryOption.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {categoryOption.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-slate-500 sm:block">Sort by</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRODUCT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span className="shrink-0 text-xs font-semibold text-slate-500">Price (KES)</span>
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="number"
            min={0}
            max={maxPrice}
            step={500}
            value={minPrice || ""}
            placeholder="Min"
            onChange={(event) => onMinPriceChange(Number(event.target.value))}
            className="w-28 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-xs text-slate-400">—</span>
          <input
            type="number"
            min={minPrice}
            max={200000}
            step={500}
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(Number(event.target.value))}
            className="w-28 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <input
          type="range"
          min={0}
          max={200000}
          step={500}
          value={maxPrice}
          onChange={(event) => onRangeChange(Number(event.target.value))}
          className="h-1.5 min-w-24 flex-1 accent-blue-600"
        />
        {minPrice > 0 || maxPrice < 200000 ? (
          <button
            onClick={onResetPrice}
            className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}

import { X } from "lucide-react";

import { PRODUCT_CATEGORIES } from "~/components/products-page/products-page-data";

export function ProductsFiltersSidebar({
  visible,
  category,
  brands,
  selectedBrands,
  minPrice,
  maxPrice,
  hasActiveFilters,
  onSelectCategory,
  onToggleBrand,
  onMinPriceChange,
  onMaxPriceChange,
  onRangeChange,
  onClearFilters,
}: {
  visible: boolean;
  category: string;
  brands: string[];
  selectedBrands: string[];
  minPrice: number;
  maxPrice: number;
  hasActiveFilters: boolean;
  onSelectCategory: (value: string) => void;
  onToggleBrand: (brand: string) => void;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onRangeChange: (value: number) => void;
  onClearFilters: () => void;
}) {
  return (
    <aside className={`w-56 shrink-0 ${visible ? "block" : "hidden"} lg:block`}>
      <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Category
          </h3>
          <ul className="space-y-1">
            {PRODUCT_CATEGORIES.map((categoryOption) => (
              <li key={categoryOption.value}>
                <button
                  onClick={() => onSelectCategory(categoryOption.value)}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    category === categoryOption.value
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {categoryOption.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {brands.length > 0 ? (
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Brand
            </h3>
            <ul className="space-y-1.5">
              {brands.map((brand) => (
                <li key={brand}>
                  <label className="group flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => onToggleBrand(brand)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900">
                      {brand}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Price (KES)
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={maxPrice}
                step={500}
                value={minPrice || ""}
                placeholder="Min"
                onChange={(event) => onMinPriceChange(Number(event.target.value))}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="shrink-0 text-xs text-slate-400">—</span>
              <input
                type="number"
                min={minPrice}
                max={200000}
                step={500}
                value={maxPrice}
                onChange={(event) => onMaxPriceChange(Number(event.target.value))}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <input
              type="range"
              min={0}
              max={200000}
              step={500}
              value={maxPrice}
              onChange={(event) => onRangeChange(Number(event.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {hasActiveFilters ? (
          <button
            onClick={onClearFilters}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        ) : null}
      </div>
    </aside>
  );
}

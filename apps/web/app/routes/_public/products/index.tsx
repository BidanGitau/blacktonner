import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import type { MetaFunction } from "react-router";
import { ProductsFiltersSidebar } from "~/components/products-page/ProductsFiltersSidebar";
import { ProductsGrid } from "~/components/products-page/ProductsGrid";
import { ProductsPageHeader } from "~/components/products-page/ProductsPageHeader";
import {
  PRODUCT_CATEGORIES,
} from "~/components/products-page/products-page-data";
import { ProductsToolbar } from "~/components/products-page/ProductsToolbar";
import {
  filterAndSortProducts,
  getUniqueBrands,
} from "~/components/products-page/products-page-utils";
import { useProducts } from "~/lib/queries";

export const meta: MetaFunction = () => [
  { title: "Products — Blacktoner" },
  { name: "description", content: "Browse laptops, printers, cartridges, and accessories." },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);

  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "featured";
  const search = searchParams.get("q") ?? "";

  const { data: products = [], isLoading } = useProducts({ category: category || undefined, search: search || undefined });

  const brands = useMemo(() => getUniqueBrands(products), [products]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  function clearFilters() {
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(200000);
  }

  const filtered = useMemo(() => {
    return filterAndSortProducts({
      products,
      selectedBrands,
      minPrice,
      maxPrice,
      sort,
    });
  }, [maxPrice, minPrice, products, selectedBrands, sort]);

  const hasActiveFilters = selectedBrands.length > 0 || minPrice > 0 || maxPrice < 200000;
  const activeLabel =
    PRODUCT_CATEGORIES.find((categoryOption) => categoryOption.value === category)
      ?.label ?? "All Products";

  return (
    <div className="min-h-screen bg-slate-50">
      <ProductsPageHeader
        title={activeLabel}
        countLabel={isLoading ? "Loading…" : `${filtered.length} products found`}
      />

      <div className="container mx-auto px-4 lg:px-6 py-6 flex gap-6">
        <ProductsFiltersSidebar
          visible={showFilters}
          category={category}
          brands={brands}
          selectedBrands={selectedBrands}
          minPrice={minPrice}
          maxPrice={maxPrice}
          hasActiveFilters={hasActiveFilters}
          onSelectCategory={(value) => setParam("category", value)}
          onToggleBrand={toggleBrand}
          onMinPriceChange={(value) =>
            setMinPrice(value > maxPrice ? maxPrice : value < 0 ? 0 : value)
          }
          onMaxPriceChange={(value) =>
            setMaxPrice(value < minPrice ? minPrice : value > 200000 ? 200000 : value)
          }
          onRangeChange={(value) => setMaxPrice(value < minPrice ? minPrice : value)}
          onClearFilters={clearFilters}
        />

        <div className="flex-1 min-w-0">
          <ProductsToolbar
            category={category}
            sort={sort}
            showFilters={showFilters}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onToggleFilters={() => setShowFilters((visible) => !visible)}
            onSelectCategory={(value) => setParam("category", value)}
            onSortChange={(value) => setParam("sort", value)}
            onMinPriceChange={(value) =>
              setMinPrice(value > maxPrice ? maxPrice : value < 0 ? 0 : value)
            }
            onMaxPriceChange={(value) =>
              setMaxPrice(value < minPrice ? minPrice : value > 200000 ? 200000 : value)
            }
            onRangeChange={(value) => setMaxPrice(value < minPrice ? minPrice : value)}
            onResetPrice={() => {
              setMinPrice(0);
              setMaxPrice(200000);
            }}
          />
          <ProductsGrid
            products={filtered}
            isLoading={isLoading}
            onClearAll={() => {
              setParam("category", "");
              clearFilters();
            }}
          />
        </div>
      </div>
    </div>
  );
}

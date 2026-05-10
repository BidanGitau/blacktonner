import { useMemo, useState, useEffect } from "react";
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

  useEffect(() => {
    const brandsParam = searchParams.get("brands");
    if (brandsParam) setSelectedBrands(brandsParam.split(","));
    else setSelectedBrands([]);
    const min = searchParams.get("minPrice");
    if (min) setMinPrice(Number(min));
    else setMinPrice(0);
    const max = searchParams.get("maxPrice");
    if (max) setMaxPrice(Number(max));
    else setMaxPrice(200000);
  }, [searchParams]);

  const { data: productsData, isLoading } = useProducts({ limit: 100 });
  const allProducts = productsData?.data ?? [];

  const brands = useMemo(() => getUniqueBrands(allProducts), [allProducts]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  }

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand];
      const nextParams = new URLSearchParams(searchParams);
      if (next.length > 0) nextParams.set("brands", next.join(","));
      else nextParams.delete("brands");
      setSearchParams(nextParams);
      return next;
    });
  }

  function clearFilters() {
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(200000);
    const nextParams = new URLSearchParams();
    if (searchParams.get("q")) nextParams.set("q", searchParams.get("q")!);
    if (searchParams.get("sort")) nextParams.set("sort", searchParams.get("sort")!);
    setSearchParams(nextParams);
  }

  const filtered = useMemo(() => {
    let result = allProducts;
    if (category) result = result.filter((p) => p.category.slug === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "name": return a.name.localeCompare(b.name);
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
    return result;
  }, [allProducts, category, search, selectedBrands, minPrice, maxPrice, sort]);

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
          onMinPriceChange={(value) => {
            const next = new URLSearchParams(searchParams);
            if (value > 0) next.set("minPrice", String(value));
            else next.delete("minPrice");
            setSearchParams(next);
            setMinPrice(value > maxPrice ? maxPrice : value < 0 ? 0 : value);
          }}
          onMaxPriceChange={(value) => {
            const next = new URLSearchParams(searchParams);
            if (value < 200000) next.set("maxPrice", String(value));
            else next.delete("maxPrice");
            setSearchParams(next);
            setMaxPrice(value < minPrice ? minPrice : value > 200000 ? 200000 : value);
          }}
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
            onMinPriceChange={(value) => {
              const next = new URLSearchParams(searchParams);
              if (value > 0) next.set("minPrice", String(value));
              else next.delete("minPrice");
              setSearchParams(next);
              setMinPrice(value > maxPrice ? maxPrice : value < 0 ? 0 : value);
            }}
            onMaxPriceChange={(value) => {
              const next = new URLSearchParams(searchParams);
              if (value < 200000) next.set("maxPrice", String(value));
              else next.delete("maxPrice");
              setSearchParams(next);
              setMaxPrice(value < minPrice ? minPrice : value > 200000 ? 200000 : value);
            }}
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

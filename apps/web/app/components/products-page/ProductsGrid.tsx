import { ProductCard } from "~/components/product/ProductCard";
import type { Product } from "~/types";

export function ProductsGrid({
  products,
  isLoading,
  onClearAll,
}: {
  products: Product[];
  isLoading: boolean;
  onClearAll: () => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-2xl border border-slate-100 bg-white"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-2 text-2xl font-bold text-slate-300">No products found</p>
        <p className="text-sm text-slate-500">
          Try adjusting your filters or category.
        </p>
        <button onClick={onClearAll} className="mt-4 text-sm text-blue-600 hover:underline">
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

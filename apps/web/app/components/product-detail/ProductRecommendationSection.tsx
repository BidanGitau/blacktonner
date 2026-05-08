import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { ProductCard } from "~/components/product/ProductCard";
import type { Product } from "~/types";

export function ProductRecommendationSection({
  eyebrow,
  title,
  products,
  viewAllTo,
  viewAllLabel,
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllTo?: string;
  viewAllLabel?: string;
}) {
  if (!products.length) return null;

  return (
    <div className="mt-20 border-t border-stone-200 pt-10">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            {eyebrow}
          </p>
          <h2
            className="text-2xl font-black uppercase tracking-tight text-black md:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
        </div>
        {viewAllTo && viewAllLabel ? (
          <Link
            to={viewAllTo}
            className="hidden items-center gap-2 border-b border-black/30 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:border-black sm:inline-flex"
          >
            {viewAllLabel} <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

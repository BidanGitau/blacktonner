import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { ProductCard } from "~/components/product/ProductCard";
import type { Product } from "~/types";

export function HomeFeaturedSection({ featured }: { featured: Product[] }) {
  return (
    <section className="border-y border-stone-200 bg-stone-50 px-4 py-16">
      <div className="container mx-auto lg:px-2">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
              — Handpicked —
            </p>
            <h2
              className="text-2xl font-black uppercase tracking-tight text-black md:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-2 border-b border-black/30 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:border-black sm:inline-flex"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {featured.length > 0
            ? featured.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            : Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse bg-stone-100" />
              ))}
        </div>
      </div>
    </section>
  );
}

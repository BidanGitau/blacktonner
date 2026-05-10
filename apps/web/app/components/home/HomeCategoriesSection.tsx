import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { CATEGORIES } from "~/components/home/home-data";

export function HomeCategoriesSection() {
  return (
    <section className="container mx-auto px-4 pb-10 pt-12 sm:pt-16 lg:px-6">
      <div className="mb-8 flex items-end justify-between sm:mb-10">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            — Browse —
          </p>
          <h2
            className="text-2xl font-black uppercase tracking-tight text-black sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shop By Category
          </h2>
        </div>
        <Link
          to="/products"
          className="hidden items-center gap-2 border-b border-black/30 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:border-black sm:inline-flex"
        >
          All Products <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 md:grid-cols-4">
        {CATEGORIES.map((category, index) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl"
              style={{
                animationDelay: `${index * 80}ms`,
                animation: "fade-up 0.5s ease forwards",
                opacity: 0,
              }}
            >
              <div className="p-4 sm:p-5">
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${category.light}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {category.desc}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-blue-500">
                  Shop now <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

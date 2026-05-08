import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { CATEGORIES } from "~/components/home/home-data";
import type { Product } from "~/types";

export function HeroSection({
  heroSlides,
  slide,
  catIndex,
  onPrev,
  onNext,
}: {
  heroSlides: Product[];
  slide: number;
  catIndex: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-black" style={{ maxHeight: "60vh", height: "60vh" }}>
      <div
        className="absolute inset-y-0 right-0 w-full bg-white lg:w-[55%]"
        style={{ clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)" }}
      />

      <div className="relative z-10 grid h-full grid-cols-1 items-center lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 lg:px-12 xl:px-16">
          <div style={{ animation: "fade-up 0.5s ease forwards" }}>
            <div className="mb-3 flex items-center gap-2">
              <span className="block h-px w-6 bg-white/25" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                Kenya&apos;s #1 Tech Store
              </span>
            </div>

            <h1
              className="font-black uppercase leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontFamily: "var(--font-display)" }}
            >
              Shop Smart.
              <br />
              <span className="text-white/30">Shop Fast.</span>
            </h1>

            <p className="mt-4 max-w-md text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
              Laptops · Printers · Toners · Accessories
            </p>

            <div className="mt-5 flex items-center gap-5">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-white/90"
              >
                Shop Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                key={CATEGORIES[catIndex].slug}
                to={`/products?category=${CATEGORIES[catIndex].slug}`}
                className="border-b border-white/20 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:border-white hover:text-white"
                style={{ animation: "fade-up 0.4s ease forwards" }}
              >
                Shop {CATEGORIES[catIndex].name}
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden h-full items-center justify-center px-8 lg:flex xl:px-12">
          <div
            className="flex h-full w-full max-w-md items-center"
            style={{ animation: "fade-up 0.65s ease forwards", opacity: 0 }}
          >
            {heroSlides.length > 0 ? (
              <div className="relative w-full">
                {heroSlides.map((product, index) => (
                  <div
                    key={product.id}
                    className={`transition-all duration-500 ${
                      index === slide ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative flex h-32 w-32 shrink-0 items-center justify-center xl:h-40 xl:w-40">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="relative z-10 h-full w-full object-contain drop-shadow-xl"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center gap-2">
                          {product.badge ? (
                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black/40">
                              {product.badge}
                            </span>
                          ) : null}
                          {product.originalPrice ? (
                            <>
                              <span className="h-2.5 w-px bg-black/15" />
                              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-red-500">
                                -{Math.round((1 - product.price / product.originalPrice) * 100)}% off
                              </span>
                            </>
                          ) : null}
                        </div>
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                          {product.brand}
                        </p>
                        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-tight text-black">
                          {product.name}
                        </h3>
                        <div className="mb-3 flex items-baseline gap-2">
                          <span className="text-xl font-black tracking-tighter text-black">
                            KES {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice ? (
                            <span className="text-xs font-medium text-black/30 line-through">
                              {product.originalPrice.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        <Link
                          to={`/products/${product.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[11px] font-bold text-white transition-all hover:gap-2 hover:bg-black/85"
                        >
                          View deal <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-black/30">
                    {String(slide + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={onPrev}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-black/30 transition-colors hover:bg-black/5 hover:text-black"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={onNext}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-black/30 transition-colors hover:bg-black/5 hover:text-black"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 w-full animate-pulse rounded-2xl bg-white/5" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

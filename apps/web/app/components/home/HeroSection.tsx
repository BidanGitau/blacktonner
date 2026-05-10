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
    <section className="relative overflow-hidden bg-black lg:min-h-[60vh]">
      {/* Diagonal white wedge — desktop only */}
      <div
        className="absolute inset-y-0 right-0 hidden bg-white lg:block lg:w-[55%]"
        style={{ clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0% 100%)" }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:h-full lg:grid-cols-2 lg:items-center">
        {/* Text column */}
        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-0 xl:px-16">
          <div style={{ animation: "fade-up 0.5s ease forwards" }}>
            <div className="mb-3 flex items-center gap-2">
              <span className="block h-px w-6 bg-white/25" />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40 sm:text-[10px] sm:tracking-[0.22em]">
                Kenya&apos;s #1 Tech Store
              </span>
            </div>

            <h1
              className="font-black uppercase leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(2rem, 13vw, 3.5rem)", fontFamily: "var(--font-display)" }}
            >
              Shop Smart.
              <br />
              <span className="text-white/30">Shop Fast.</span>
            </h1>

            <p className="mt-4 max-w-md text-[10px] font-medium uppercase tracking-[0.14em] text-white/45 sm:text-[11px] sm:tracking-[0.2em]">
              Laptops · Printers · Toners · Accessories
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                to="/products"
                className="inline-flex min-h-11 items-center gap-2 bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-white/90 sm:px-6 sm:text-[11px] sm:tracking-[0.2em]"
              >
                Shop Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                key={CATEGORIES[catIndex].slug}
                to={`/products?category=${CATEGORIES[catIndex].slug}`}
                className="border-b border-white/20 pb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 transition-colors hover:border-white hover:text-white sm:text-[11px] sm:tracking-[0.2em]"
                style={{ animation: "fade-up 0.4s ease forwards" }}
              >
                Shop {CATEGORIES[catIndex].name}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel column — stacked white block on mobile, embedded in wedge on lg+ */}
        <div className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 sm:py-12 lg:bg-transparent lg:px-8 lg:py-0 xl:px-12">
          <div
            className="flex w-full max-w-lg items-center"
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
                    <div className="flex flex-col gap-5">
                      <div className="relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-2xl bg-linear-to-br from-stone-50 to-stone-100 p-5 ring-1 ring-black/5 sm:max-w-72 sm:p-8 lg:max-w-80">
                        <span
                          aria-hidden
                          className="absolute inset-x-8 bottom-4 h-6 rounded-full bg-black/30 blur-2xl"
                        />
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="relative z-10 h-full w-full object-contain"
                          style={{ filter: "drop-shadow(0 24px 32px rgba(0,0,0,0.35)) drop-shadow(0 8px 14px rgba(0,0,0,0.18))" }}
                        />
                        {(product.badge || product.originalPrice) && (
                          <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5 sm:left-4 sm:top-4">
                            {product.badge && (
                              <span className="bg-black px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white">
                                {product.badge}
                              </span>
                            )}
                            {product.originalPrice && (
                              <span className="bg-red-500 px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white">
                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-black/35">
                            {product.brand}
                          </p>
                          <h3 className="line-clamp-2 text-sm font-bold leading-tight text-black">
                            {product.name}
                          </h3>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-xl font-black tracking-tighter text-black">
                              KES {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs font-medium text-black/30 line-through">
                                {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/products/${product.slug}`}
                          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:gap-2 hover:bg-black/85 sm:w-auto sm:text-[11px] sm:tracking-[0.18em]"
                        >
                          View deal <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Counter + nav — placed inline below the slide, never clipped */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tabular-nums text-black/40">
                    {String(slide + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Previous slide"
                      onClick={onPrev}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next slide"
                      onClick={onNext}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 w-full animate-pulse rounded-2xl bg-stone-100" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

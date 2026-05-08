import { Link, useNavigate } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { DELIVERY_ZONE_OPTIONS, useCartStore } from "~/store/cart";

export const meta: MetaFunction = () => [
  { title: "Cart — Blacktoner" },
];

export default function CartPage() {
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);
  const update = useCartStore((s) => s.update);
  const clear = useCartStore((s) => s.clear);
  const deliveryZone = useCartStore((s) => s.deliveryZone);
  const setDeliveryZone = useCartStore((s) => s.setDeliveryZone);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const total = useCartStore((s) => s.total());
  const count = useCartStore((s) => s.count());

  const isEmpty = items.length === 0;
  const freeDeliveryThreshold = 5000;
  const qualifiesForFree = subtotal >= freeDeliveryThreshold;

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-8 lg:px-6 lg:py-10">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            — Your Bag —
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1
              className="text-3xl font-black uppercase leading-none tracking-tight text-black md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cart
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
              {isEmpty ? "Empty" : `${count} item${count !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:px-6 lg:py-14">
        {isEmpty ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 border border-stone-200 bg-stone-50 px-8 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-black/40">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <p
              className="text-2xl font-black uppercase tracking-tight text-black"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your bag is empty
            </p>
            <p className="text-sm leading-relaxed text-black/55">
              Browse our catalogue and add the items you need — laptops, printers, toners and more.
            </p>
            <Link
              to="/products"
              className="mt-2 inline-flex items-center gap-2 bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85"
            >
              Shop Products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
            {/* Items */}
            <div className="min-w-0">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                  {items.length} product{items.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={clear}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" /> Clear Bag
                </button>
              </div>

              <ul className="divide-y divide-stone-200">
                {items.map(({ product, quantity }) => {
                  const lineTotal = product.price * quantity;
                  return (
                    <li key={product.id} className="flex gap-4 py-5">
                      <Link
                        to={`/products/${product.slug}`}
                        className="block h-20 w-20 shrink-0 border border-stone-200 bg-stone-50 p-2 sm:h-24 sm:w-24"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                              {product.brand}
                            </p>
                            <Link
                              to={`/products/${product.slug}`}
                              className="mt-0.5 line-clamp-2 text-sm font-medium text-black hover:underline"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">
                              SKU · {product.sku}
                            </p>
                          </div>
                          <button
                            onClick={() => remove(product.id)}
                            aria-label={`Remove ${product.name}`}
                            className="shrink-0 text-black/35 transition-colors hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                          <div className="flex items-center border border-black/15">
                            <button
                              onClick={() => update(product.id, quantity - 1)}
                              aria-label="Decrease quantity"
                              className="flex h-9 w-9 items-center justify-center text-black/70 transition-colors hover:bg-black hover:text-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-9 text-center text-xs font-bold tabular-nums text-black">
                              {quantity}
                            </span>
                            <button
                              onClick={() => update(product.id, Math.min(product.stock, quantity + 1))}
                              aria-label="Increase quantity"
                              disabled={quantity >= product.stock}
                              className="flex h-9 w-9 items-center justify-center text-black/70 transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black/70"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-base font-black tabular-nums text-black"
                              style={{ fontFamily: "var(--font-display)" }}
                            >
                              KES {lineTotal.toLocaleString()}
                            </p>
                            {quantity > 1 && (
                              <p className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                                KES {product.price.toLocaleString()} each
                              </p>
                            )}
                            {product.stock <= 5 && product.stock > 0 && (
                              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                                Only {product.stock} left
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 border-b border-black/20 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black/55 transition-colors hover:border-black hover:text-black"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border border-black/10 bg-white">
                <div className="border-b border-stone-200 px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                    Order Summary
                  </p>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-black/60">Subtotal</span>
                    <span className="tabular-nums text-black">KES {subtotal.toLocaleString()}</span>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">
                      Delivery Zone
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className="mt-1.5 h-9 w-full border border-black/15 bg-white px-3 text-xs text-black focus:border-black focus:outline-none"
                    >
                      {DELIVERY_ZONE_OPTIONS.map((zone) => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-black/60">Delivery Fee</span>
                    <span className="tabular-nums text-black">
                      KES {deliveryFee.toLocaleString()}
                    </span>
                  </div>

                  {!qualifiesForFree && (
                    <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                      Add KES {(freeDeliveryThreshold - subtotal).toLocaleString()} more for the free-delivery tier
                    </p>
                  )}

                  <div className="flex items-baseline justify-between border-t-2 border-black pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                      Total
                    </span>
                    <span
                      className="text-xl font-black tabular-nums text-black"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      KES {total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 bg-black text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-black/85"
                  >
                    Proceed To Checkout <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="border-t border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/45">
                    Secure Checkout · Cash On Delivery Available
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

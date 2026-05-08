import type { RefObject } from "react";
import { CheckCircle, ChevronDown, Heart, Minus, Plus, RefreshCw, Share2, ShieldCheck, Truck } from "lucide-react";

import { DELIVERY_FEES } from "~/store/cart";
import type { Product } from "~/types";

const PERKS = [
  { icon: Truck, label: "Same-Day Delivery", sub: "Within Nairobi" },
  { icon: ShieldCheck, label: "100% Authentic", sub: "Genuine product" },
  { icon: RefreshCw, label: "Easy Returns", sub: "Within 7 days" },
];

const ZONE_OPTIONS = Object.keys(DELIVERY_FEES);

type ProductSpec = { label: string; value: string };

export function ProductPurchasePanel({
  product,
  qty,
  added,
  zone,
  copied,
  deliveryFee,
  openSection,
  specs,
  addRef,
  wishlisted,
  onDecreaseQty,
  onIncreaseQty,
  onAddToCart,
  onToggleWishlist,
  onShare,
  onZoneChange,
  onToggleSection,
}: {
  product: Product;
  qty: number;
  added: boolean;
  zone: string;
  copied: boolean;
  deliveryFee: number;
  openSection: string | null;
  specs: ProductSpec[];
  addRef: RefObject<HTMLDivElement | null>;
  wishlisted: boolean;
  onDecreaseQty: () => void;
  onIncreaseQty: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onShare: () => void;
  onZoneChange: (zone: string) => void;
  onToggleSection: (key: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
        {product.brand}
      </p>
      <h1
        className="text-2xl font-black uppercase leading-[1.05] tracking-tight text-black lg:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {product.name}
      </h1>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
        SKU · {product.sku}
      </p>

      <div className="mt-6 flex items-baseline gap-3 border-b border-stone-200 pb-6">
        <span
          className="text-2xl font-black tracking-tight text-black"
          style={{ fontFamily: "var(--font-display)" }}
        >
          KES {product.price.toLocaleString()}
        </span>
        {product.originalPrice ? (
          <span className="text-base font-medium text-black/35 line-through">
            KES {product.originalPrice.toLocaleString()}
          </span>
        ) : null}
      </div>

      <div className="mt-8">
        {[
          { key: "description", label: "Description" },
          { key: "specs", label: "Specifications", disabled: specs.length === 0 },
          { key: "shipping", label: "Shipping & Returns" },
        ].map((section, index) => {
          if (section.disabled) return null;
          const open = openSection === section.key;

          return (
            <div
              key={section.key}
              className={`border-b border-stone-200 ${index === 0 ? "border-t" : ""}`}
            >
              <button
                onClick={() => onToggleSection(section.key)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-black">
                  {section.label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-black transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open ? (
                <div className="pb-6 text-sm leading-relaxed text-black/70">
                  {section.key === "description" ? <p>{product.description}</p> : null}
                  {section.key === "specs" ? (
                    <div className="divide-y divide-stone-200">
                      {specs.map((spec) => (
                        <div key={spec.label} className="grid grid-cols-2 gap-4 py-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
                            {spec.label}
                          </span>
                          <span className="text-xs text-black">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {section.key === "shipping" ? (
                    <ul className="space-y-2 text-xs">
                      <li>· Same-day delivery within Nairobi for orders placed before 1pm.</li>
                      <li>· Countrywide delivery via courier — 1 to 3 business days.</li>
                      <li>· Free delivery on orders over KES 5,000 within Nairobi.</li>
                      <li>· 7-day returns on unopened items in original packaging.</li>
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
        {product.stock > 0 ? (
          <>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className={product.stock <= 5 ? "text-orange-600" : "text-emerald-700"}>
              {product.stock <= 5 ? `Only ${product.stock} Left` : "In Stock"}
            </span>
          </>
        ) : (
          <>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-400" />
            <span className="text-black/40">Sold Out</span>
          </>
        )}
      </div>

      <div ref={addRef} className="mt-4 flex items-stretch gap-3">
        <div className="flex items-center border border-black">
          <button
            onClick={onDecreaseQty}
            className="flex h-12 w-12 items-center justify-center text-black transition-colors hover:bg-black hover:text-white"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-black">{qty}</span>
          <button
            onClick={onIncreaseQty}
            className="flex h-12 w-12 items-center justify-center text-black transition-colors hover:bg-black hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={onAddToCart}
          disabled={product.stock === 0}
          className={`inline-flex h-12 flex-1 items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] transition-all ${
            product.stock === 0
              ? "cursor-not-allowed bg-stone-200 text-black/40"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-black text-white hover:bg-black/85"
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="h-4 w-4" /> Added To Bag
            </>
          ) : product.stock === 0 ? (
            "Sold Out"
          ) : (
            <>
              Add To Bag <span className="opacity-60">·</span> KES{" "}
              {(product.price * qty).toLocaleString()}
            </>
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <button
          onClick={onToggleWishlist}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:text-black/60"
        >
          <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-black" : ""}`} />
          {wishlisted ? "Saved" : "Add To Wishlist"}
        </button>
        <button
          onClick={onShare}
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:text-black/60"
        >
          {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Share"}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-stone-200 pt-6">
        {PERKS.map((perk) => (
          <div key={perk.label} className="flex flex-col gap-1">
            <perk.icon className="mb-1 h-4 w-4 text-black" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black">
              {perk.label}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
              {perk.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-stone-200 pt-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
          Estimate Delivery
        </p>
        <div className="flex items-center gap-3">
          <select
            value={zone}
            onChange={(event) => onZoneChange(event.target.value)}
            className="flex-1 border border-black/15 bg-white px-3 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black focus:border-black focus:outline-none"
          >
            {ZONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p
            className="text-sm font-black tracking-tight text-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            KES {deliveryFee.toLocaleString()}
          </p>
        </div>
        {product.price >= 5000 ? (
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Free Delivery On Orders Over KES 5,000
          </p>
        ) : null}
      </div>
    </div>
  );
}

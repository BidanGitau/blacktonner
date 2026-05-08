import { useState } from "react";
import { Link } from "react-router";
import { Heart, CheckCircle } from "lucide-react";
import { useWishlistStore } from "~/store/wishlist";
import type { Product } from "~/types";

interface Props {
  product: Product;
  index?: number;
}

function calcDiscount(price: number, originalPrice: number | null): number | null {
  if (!originalPrice) return null;
  return Math.round((1 - price / originalPrice) * 100);
}

export function ProductCard({ product, index = 0 }: Props) {
  const discount = calcDiscount(product.price, product.originalPrice ?? null);
  const [added, setAdded] = useState(false);
  const toggle = useWishlistStore((s) => s.toggle);
  const wishlisted = useWishlistStore((s) => s.has(product.id));

  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;
  const secondImage = product.images[1] ?? product.images[0];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle(product.id);
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative flex flex-col"
      style={{ animationDelay: `${index * 60}ms`, animation: "fade-up 0.4s ease forwards", opacity: 0 }}
    >
      {/* Image tile */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-6 transition-opacity duration-500 group-hover:opacity-0"
        />
        <img
          src={secondImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && (
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase bg-black text-white px-2 py-1">
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase bg-white text-black px-2 py-1">
              {product.badge}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center transition-all duration-200 ${
            wishlisted
              ? "text-black opacity-100"
              : "text-black/40 opacity-0 group-hover:opacity-100 hover:text-black"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-black" : ""}`} />
        </button>

        {/* Quick add bar */}
        {!outOfStock && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-0 left-0 right-0 bg-black text-white text-[11px] font-bold tracking-[0.18em] uppercase py-3 transition-transform duration-300 ${
              added ? "translate-y-0 bg-emerald-600" : "translate-y-full group-hover:translate-y-0"
            }`}
          >
            {added ? (
              <span className="inline-flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Added</span>
            ) : (
              "Quick Add"
            )}
          </button>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-stone-100/80 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/60 bg-white px-3 py-1.5">Sold Out</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="pt-4 pb-1 flex flex-col gap-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">{product.brand}</p>

        <h3 className="text-sm font-medium text-black leading-snug line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-sm font-bold text-black tracking-tight">
            KES {product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-black/35 line-through font-medium">
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {lowStock && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-600 mt-0.5">
            Only {product.stock} left
          </p>
        )}
      </div>
    </Link>
  );
}

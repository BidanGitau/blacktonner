import type { Product } from "~/types";

export function ProductStickyBar({
  product,
  added,
  onAddToCart,
}: {
  product: Product;
  added: boolean;
  onAddToCart: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white px-4 py-3">
      <div className="container mx-auto flex items-center gap-4">
        <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
          <img
            src={product.images[0]}
            alt=""
            className="h-10 w-10 shrink-0 bg-stone-100 object-contain p-1"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-[0.15em] text-black">
              {product.name}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">
              KES {product.price.toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={onAddToCart}
          disabled={product.stock === 0}
          className={`ml-auto h-10 px-6 text-[11px] font-bold uppercase tracking-[0.25em] transition-all ${
            product.stock === 0
              ? "cursor-not-allowed bg-stone-200 text-black/40"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-black text-white hover:bg-black/85"
          }`}
        >
          {added ? "Added" : "Add To Bag"}
        </button>
      </div>
    </div>
  );
}

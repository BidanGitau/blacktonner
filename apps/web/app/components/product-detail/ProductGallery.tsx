import type { Product } from "~/types";

export function ProductGallery({
  product,
  activeImage,
  onSelectImage,
  discount,
}: {
  product: Product;
  activeImage: number;
  onSelectImage: (index: number) => void;
  discount: number | null;
}) {
  return (
    <>
      {product.images.length > 1 ? (
        <div className="hidden flex-col gap-3 lg:flex">
          {product.images.map((img, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              className={`aspect-square overflow-hidden bg-stone-100 transition-opacity ${
                activeImage === index ? "opacity-100 ring-1 ring-black" : "opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-contain p-2" />
            </button>
          ))}
        </div>
      ) : null}

      <div className={product.images.length > 1 ? "lg:col-span-1" : "lg:col-span-2"}>
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          <img
            src={product.images[activeImage]}
            alt={product.name}
            className="h-full w-full object-contain p-8"
          />
          <div className="absolute left-4 top-4 flex flex-col gap-1">
            {discount ? (
              <span className="bg-black px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                -{discount}% Off
              </span>
            ) : null}
            {product.badge ? (
              <span className="bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
                {product.badge}
              </span>
            ) : null}
          </div>
        </div>

        {product.images.length > 1 ? (
          <div className="mt-3 flex gap-2 lg:hidden">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => onSelectImage(index)}
                className={`flex-1 aspect-square overflow-hidden bg-stone-100 transition-opacity ${
                  activeImage === index ? "opacity-100 ring-1 ring-black" : "opacity-60"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-contain p-1.5" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

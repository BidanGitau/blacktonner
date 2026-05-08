import { useRef, useState } from "react";
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
        <ZoomImage
          src={product.images[activeImage]}
          alt={product.name}
          discount={discount}
          badge={product.badge}
        />

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

function ZoomImage({
  src, alt, discount, badge,
}: {
  src: string;
  alt: string;
  discount: number | null;
  badge: string | null | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zooming, setZooming] = useState(false);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--zx", `${x}%`);
    el.style.setProperty("--zy", `${y}%`);
  }

  return (
    <div
      ref={ref}
      onMouseEnter={() => setZooming(true)}
      onMouseLeave={() => setZooming(false)}
      onMouseMove={handleMove}
      className="group relative aspect-square cursor-zoom-in overflow-hidden bg-stone-100"
      style={{ ["--zx" as any]: "50%", ["--zy" as any]: "50%" }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-contain p-8 transition-transform duration-200 ease-out will-change-transform select-none"
        style={{
          transformOrigin: "var(--zx) var(--zy)",
          transform: zooming ? "scale(2)" : "scale(1)",
        }}
      />
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
        {discount ? (
          <span className="bg-black px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            -{discount}% Off
          </span>
        ) : null}
        {badge ? (
          <span className="bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

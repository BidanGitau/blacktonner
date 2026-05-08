import { Link } from "react-router";

export function ProductDetailNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <p
          className="mb-3 text-2xl font-black uppercase tracking-tight text-black"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Product Not Found
        </p>
        <Link
          to="/products"
          className="border-b border-black pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
        >
          Browse All Products
        </Link>
      </div>
    </div>
  );
}

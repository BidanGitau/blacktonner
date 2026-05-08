import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

export function ProductBreadcrumb({
  categoryName,
  categorySlug,
}: {
  categoryName: string;
  categorySlug: string;
}) {
  return (
    <div className="border-b border-stone-200">
      <div className="container mx-auto flex items-center gap-2 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 lg:px-6">
        <Link to="/" className="transition-colors hover:text-black">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="transition-colors hover:text-black">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/products?category=${categorySlug}`}
          className="transition-colors hover:text-black"
        >
          {categoryName}
        </Link>
      </div>
    </div>
  );
}

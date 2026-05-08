import type { Product } from "~/types";

export function getUniqueBrands(products: Product[]) {
  return [...new Set(products.map((product) => product.brand))].sort();
}

export function filterAndSortProducts({
  products,
  selectedBrands,
  minPrice,
  maxPrice,
  sort,
}: {
  products: Product[];
  selectedBrands: string[];
  minPrice: number;
  maxPrice: number;
  sort: string;
}) {
  const list = products
    .filter((product) =>
      selectedBrands.length ? selectedBrands.includes(product.brand) : true
    )
    .filter((product) => product.price >= minPrice && product.price <= maxPrice);

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (sort === "reviews") list.sort((a, b) => b.reviews - a.reviews);

  return list;
}

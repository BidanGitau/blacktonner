import { useMemo, useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import type { MetaFunction } from "react-router";
import { ProductBreadcrumb } from "~/components/product-detail/ProductBreadcrumb";
import { ProductDetailLoading } from "~/components/product-detail/ProductDetailLoading";
import { ProductDetailNotFound } from "~/components/product-detail/ProductDetailNotFound";
import { ProductGallery } from "~/components/product-detail/ProductGallery";
import { ProductPurchasePanel } from "~/components/product-detail/ProductPurchasePanel";
import { ProductRecommendationSection } from "~/components/product-detail/ProductRecommendationSection";
import { ProductStickyBar } from "~/components/product-detail/ProductStickyBar";
import { useProduct, useProducts } from "~/lib/queries";
import { DELIVERY_FEES, useCartStore } from "~/store/cart";
import { useWishlistStore } from "~/store/wishlist";

export const meta: MetaFunction = () => [{ title: "Product — Blacktoner" }];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug ?? "");

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [zone, setZone] = useState("Nairobi CBD");
  const [copied, setCopied] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  const toggle = useWishlistStore((s) => s.toggle);
  const wishlisted = useWishlistStore((s) => product ? s.has(product.id) : false);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    const el = addRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  const { data: categoryProductsData } = useProducts(
    product ? { category: product.category.slug } : {}
  );
  const { data: allProductsData } = useProducts({});

  const categoryProducts = categoryProductsData?.data ?? [];
  const allProducts = allProductsData?.data ?? [];

  const compatibleAll = useMemo(() => {
    if (!product?.relatedSkus?.length) return [];
    return allProducts.filter((p) => product.relatedSkus!.includes(p.sku));
  }, [product, allProducts]);

  const compatibleHeading = useMemo(() => {
    if (!product || !compatibleAll.length) return "";
    if (product.category.slug === "printers") return "Compatible Toners";
    if (product.category.slug === "cartridges") return "Compatible Printers";
    if (product.category.slug === "laptops") return "Recommended Accessories";
    return "You May Also Need";
  }, [product, compatibleAll]);

  const related = useMemo(() => {
    if (!product) return [];
    return categoryProducts
      .filter((p) => p.id !== product.id && !product.relatedSkus?.includes(p.sku))
      .slice(0, 4);
  }, [product, categoryProducts]);

  if (isLoading) {
    return <ProductDetailLoading />;
  }

  if (isError || !product) {
    return <ProductDetailNotFound />;
  }

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;
  const deliveryFee = DELIVERY_FEES[zone] ?? 300;
  const specs = (product.specs as { label: string; value: string }[] | null) ?? [];

  function handleAddToCart() {
    if (!product || product.stock === 0) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: product!.name, url });
    else navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function toggleSection(key: string) {
    setOpenSection((s) => (s === key ? null : key));
  }

  return (
    <div className="min-h-screen bg-white">
      <ProductBreadcrumb
        categoryName={product.category.name}
        categorySlug={product.category.slug}
      />

      <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_1fr] gap-6 lg:gap-12">
          <ProductGallery
            product={product}
            activeImage={activeImage}
            onSelectImage={setActiveImage}
            discount={discount}
          />
          <ProductPurchasePanel
            product={product}
            qty={qty}
            added={added}
            zone={zone}
            copied={copied}
            deliveryFee={deliveryFee}
            openSection={openSection}
            specs={specs}
            addRef={addRef}
            wishlisted={wishlisted}
            onDecreaseQty={() => setQty((q) => Math.max(1, q - 1))}
            onIncreaseQty={() => setQty((q) => Math.min(product.stock, q + 1))}
            onAddToCart={handleAddToCart}
            onToggleWishlist={() => toggle(product.id)}
            onShare={handleShare}
            onZoneChange={setZone}
            onToggleSection={toggleSection}
          />
        </div>

        <ProductRecommendationSection
          eyebrow="— Pairs With —"
          title={compatibleHeading}
          products={compatibleAll}
        />
        <ProductRecommendationSection
          eyebrow="— You May Also Like —"
          title={`More ${product.category.name}`}
          products={related}
          viewAllTo={`/products?category=${product.category.slug}`}
          viewAllLabel="View All"
        />
      </div>

      {showSticky ? (
        <ProductStickyBar
          product={product}
          added={added}
          onAddToCart={handleAddToCart}
        />
      ) : null}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useProduct, useUpdateProduct, useCategories } from "~/lib/queries";

interface SpecRow { label: string; value: string }

function parseList(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id!);
  const { data: categories = [] } = useCategories();
  const update = useUpdateProduct();

  const [form, setForm] = useState({
    name: "", slug: "", sku: "", brand: "", description: "",
    price: "", originalPrice: "", costPrice: "", stock: "0",
    categoryId: "", badge: "", badgeColor: "",
    rating: "0", reviews: "0", relatedSkus: "",
    metaTitle: "", metaDescription: "",
    images: [""],
    featured: false, active: true,
  });
  const [specs, setSpecs] = useState<SpecRow[]>([{ label: "", value: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand,
      description: product.description ?? "",
      price: String(product.price),
      originalPrice: product.originalPrice != null ? String(product.originalPrice) : "",
      costPrice: String(product.costPrice),
      stock: String(product.stock),
      categoryId: product.category.id,
      badge: product.badge ?? "",
      badgeColor: product.badgeColor ?? "",
      rating: String(product.rating ?? 0),
      reviews: String(product.reviews ?? 0),
      relatedSkus: product.relatedSkus?.join(", ") ?? "",
      metaTitle: product.metaTitle ?? "",
      metaDescription: product.metaDescription ?? "",
      images: product.images.length ? product.images : [""],
      featured: product.featured,
      active: product.active,
    });
    setSpecs(product.specs?.length ? product.specs : [{ label: "", value: "" }]);
  }, [product]);

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())        e.name = "Required";
    if (!form.slug.trim())        e.slug = "Required";
    if (!form.sku.trim())         e.sku = "Required";
    if (!form.brand.trim())       e.brand = "Required";
    if (!form.categoryId)         e.categoryId = "Required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price";
    if (!form.costPrice || isNaN(Number(form.costPrice))) e.costPrice = "Enter a valid cost price";
    if (form.rating && (isNaN(Number(form.rating)) || Number(form.rating) < 0 || Number(form.rating) > 5)) e.rating = "Use a rating between 0 and 5";
    if (form.reviews && (isNaN(Number(form.reviews)) || Number(form.reviews) < 0)) e.reviews = "Use a review count of 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    update.mutate({
      id: id!,
      name: form.name.trim(),
      slug: form.slug.trim(),
      sku: form.sku.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      costPrice: Number(form.costPrice),
      stock: Number(form.stock),
      categoryId: form.categoryId,
      badge: form.badge || null,
      badgeColor: form.badgeColor || null,
      rating: Number(form.rating || 0),
      reviews: Number(form.reviews || 0),
      relatedSkus: parseList(form.relatedSkus),
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      images: form.images.map((image) => image.trim()).filter(Boolean),
      featured: form.featured,
      active: form.active,
      specs: specs
        .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() }))
        .filter((spec) => spec.label && spec.value),
    } as any, {
      onSuccess: () => navigate("/admin/products"),
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? "Failed to update product";
        setErrors({ submit: Array.isArray(msg) ? msg.join(", ") : msg });
      },
    });
  }

  const inputCls = (field: string) =>
    `w-full h-9 text-sm border rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black ${errors[field] ? "border-red-400" : "border-stone-200"}`;

  if (isLoading) {
    return (
      <div className="space-y-4 px-6 py-8 lg:px-10 lg:py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-stone-100" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-md border border-stone-200 bg-white p-6">
            {[1, 2, 3].map((j) => <div key={j} className="h-9 animate-pulse rounded bg-stone-100" />)}
          </div>
        ))}
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <p className="text-sm text-red-600">Product not found.</p>
        <Link to="/admin/products" className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-black hover:underline">← Back to products</Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/products" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 transition-colors hover:border-black hover:text-black">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">Edit product</p>
          <h1 className="truncate font-black tracking-tight text-black" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}>{product.name}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="bg-white rounded-md border border-stone-200 p-6 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Basic Info</h2>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Product name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. HP LaserJet Pro M404n"
              className={inputCls("name")}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Slug *</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls("slug")} />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">SKU *</label>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls("sku")} />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Brand *</label>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls("brand")} />
              {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Category *</label>
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls("categoryId")}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Describe this product…"
              className={inputCls("description").replace("h-9", "h-auto py-2") + " resize-none"}
            />
          </div>
        </section>

        {/* Pricing & Stock */}
        <section className="bg-white rounded-md border border-stone-200 p-6 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Sale price (KES) *</label>
              <input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls("price")} />
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Original price (KES)</label>
              <input type="number" min={0} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} className={inputCls("originalPrice")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Cost price (KES) *</label>
              <input type="number" min={0} value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} className={inputCls("costPrice")} />
              {errors.costPrice && <p className="text-xs text-red-500">{errors.costPrice}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Stock quantity</label>
              <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls("stock")} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => {
                  const v = e.target.value;
                  set("badge", v);
                  set("badgeColor",
                    v === "Hot Deal" ? "bg-red-500 text-white" :
                    v === "Best Seller" || v === "Sale" ? "bg-brand text-brand-foreground" :
                    v === "New" || v === "Popular" ? "bg-blue-600 text-white" : ""
                  );
                }}
                className={inputCls("badge")}
              >
                <option value="">None</option>
                <option value="Hot Deal">Hot Deal</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Sale">Sale</option>
                <option value="New">New</option>
                <option value="Popular">Popular</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Rating</label>
              <input type="number" min={0} max={5} step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} className={inputCls("rating")} />
              {errors.rating && <p className="text-xs text-red-500">{errors.rating}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Reviews</label>
              <input type="number" min={0} value={form.reviews} onChange={(e) => set("reviews", e.target.value)} className={inputCls("reviews")} />
              {errors.reviews && <p className="text-xs text-red-500">{errors.reviews}</p>}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="rounded border-stone-300 text-black focus:ring-black/40" />
              <span className="text-sm font-medium text-black">Featured on home page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded border-stone-300 text-black focus:ring-black/40" />
              <span className="text-sm font-medium text-black">Active (visible to customers)</span>
            </label>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-md border border-stone-200 p-6 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Images</h2>
          <div className="space-y-2">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={url}
                  onChange={(e) => { const imgs = [...form.images]; imgs[i] = e.target.value; set("images", imgs as any); }}
                  placeholder="https://…"
                  className="flex-1 h-9 text-sm border border-stone-200 rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black"
                />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i) as any)} className="flex h-9 w-9 items-center justify-center rounded-md text-black/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => set("images", [...form.images, ""] as any)} className="text-[10px] font-bold uppercase tracking-[0.18em] text-black hover:text-black/60 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add image URL
            </button>
          </div>
        </section>

        {/* Specs */}
        <section className="bg-white rounded-md border border-stone-200 p-6 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Specifications</h2>
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={spec.label}
                  onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], label: e.target.value }; setSpecs(s); }}
                  placeholder="Label (e.g. RAM)"
                  className="w-36 h-9 text-sm border border-stone-200 rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black"
                />
                <input
                  value={spec.value}
                  onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], value: e.target.value }; setSpecs(s); }}
                  placeholder="Value (e.g. 16GB DDR4)"
                  className="flex-1 h-9 text-sm border border-stone-200 rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black"
                />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="flex h-9 w-9 items-center justify-center rounded-md text-black/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setSpecs([...specs, { label: "", value: "" }])} className="text-[10px] font-bold uppercase tracking-[0.18em] text-black hover:text-black/60 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add spec row
            </button>
          </div>
        </section>

        <section className="bg-white rounded-md border border-stone-200 p-6 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">Related Products & SEO</h2>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Related product SKUs</label>
            <textarea
              value={form.relatedSkus}
              onChange={(e) => set("relatedSkus", e.target.value)}
              rows={3}
              placeholder="HP-BAG-156-TL, ORICO-HUB7C"
              className={inputCls("relatedSkus").replace("h-9", "h-auto py-2") + " resize-none"}
            />
            <p className="text-xs text-black/45">Separate SKUs with commas or new lines.</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Meta title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="Search-friendly page title"
              className={inputCls("metaTitle")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">Meta description</label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              rows={3}
              placeholder="Short product summary for search and previews"
              className={inputCls("metaDescription").replace("h-9", "h-auto py-2") + " resize-none"}
            />
          </div>
        </section>

        {errors.submit && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errors.submit}</p>
        )}

        <div className="flex items-center gap-3 border-t border-stone-200 pt-6">
          <button
            type="submit"
            disabled={update.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-black px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black/85 disabled:opacity-60"
          >
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {update.isPending ? "Saving…" : "Save changes"}
          </button>
          <Link to="/admin/products" className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45 transition-colors hover:text-black">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

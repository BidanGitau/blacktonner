import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useCreateProduct, useCategories } from "~/lib/queries";

interface SpecRow { label: string; value: string }

function parseList(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProductNewPage() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const create = useCreateProduct();

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

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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

    create.mutate({
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
        const msg = err?.response?.data?.message ?? "Failed to create product";
        setErrors({ submit: Array.isArray(msg) ? msg.join(", ") : msg });
      },
    });
  }

  const inputCls = (field: string) =>
    `w-full text-sm border rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 ${errors[field] ? "border-red-400" : "border-slate-200"}`;

  return (
    <div className="w-full p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add product</h1>
          <p className="text-sm text-slate-500 mt-0.5">New product will be live immediately</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Info</h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Product name *</label>
            <input
              value={form.name}
              onChange={(e) => { set("name", e.target.value); set("slug", autoSlug(e.target.value)); }}
              placeholder="e.g. HP LaserJet Pro M404n"
              className={inputCls("name")}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Slug *</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="hp-laserjet-m404n" className={inputCls("slug")} />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">SKU *</label>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="HP-LJ-M404N" className={inputCls("sku")} />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Brand *</label>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="HP" className={inputCls("brand")} />
              {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Category *</label>
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls("categoryId")}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Describe this product…"
              className={inputCls("description") + " resize-none"}
            />
          </div>
        </section>

        {/* Pricing & Stock */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Pricing & Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Sale price (KES) *</label>
              <input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="28500" className={inputCls("price")} />
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Original price (KES)</label>
              <input type="number" min={0} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="33000" className={inputCls("originalPrice")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Cost price (KES) *</label>
              <input type="number" min={0} value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="22000" className={inputCls("costPrice")} />
              {errors.costPrice && <p className="text-xs text-red-500">{errors.costPrice}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Stock quantity</label>
              <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls("stock")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Badge</label>
              <select value={form.badge} onChange={(e) => { const v = e.target.value; set("badge", v); set("badgeColor", v === "Hot Deal" ? "bg-red-500 text-white" : v === "Best Seller" ? "bg-yellow-400 text-slate-900" : v === "Sale" ? "bg-yellow-400 text-slate-900" : v === "New" ? "bg-blue-600 text-white" : v === "Popular" ? "bg-blue-600 text-white" : ""); }} className={inputCls("badge")}>
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
              <label className="text-xs font-semibold text-slate-600">Rating</label>
              <input type="number" min={0} max={5} step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} className={inputCls("rating")} />
              {errors.rating && <p className="text-xs text-red-500">{errors.rating}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Reviews</label>
              <input type="number" min={0} value={form.reviews} onChange={(e) => set("reviews", e.target.value)} className={inputCls("reviews")} />
              {errors.reviews && <p className="text-xs text-red-500">{errors.reviews}</p>}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Featured on home page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">Active (visible to customers)</span>
            </label>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Images</h2>
          <div className="space-y-2">
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={url}
                  onChange={(e) => { const imgs = [...form.images]; imgs[i] = e.target.value; set("images", imgs as any); }}
                  placeholder="https://…"
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i) as any)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => set("images", [...form.images, ""] as any)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add image URL
            </button>
          </div>
        </section>

        {/* Specs */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Specifications</h2>
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={spec.label}
                  onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], label: e.target.value }; setSpecs(s); }}
                  placeholder="Label (e.g. RAM)"
                  className="w-36 text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={spec.value}
                  onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], value: e.target.value }; setSpecs(s); }}
                  placeholder="Value (e.g. 16GB DDR4)"
                  className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setSpecs([...specs, { label: "", value: "" }])} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add spec row
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Related Products & SEO</h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Related product SKUs</label>
            <textarea
              value={form.relatedSkus}
              onChange={(e) => set("relatedSkus", e.target.value)}
              rows={3}
              placeholder="HP-BAG-156-TL, ORICO-HUB7C"
              className={inputCls("relatedSkus") + " resize-none"}
            />
            <p className="text-xs text-slate-400">Separate SKUs with commas or new lines.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Meta title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="Search-friendly page title"
              className={inputCls("metaTitle")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Meta description</label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              rows={3}
              placeholder="Short product summary for search and previews"
              className={inputCls("metaDescription") + " resize-none"}
            />
          </div>
        </section>

        {errors.submit && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200">{errors.submit}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {create.isPending ? "Saving…" : "Save product"}
          </button>
          <Link to="/admin/products" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

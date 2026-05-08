import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";

import { ImageInputRow } from "./ImageInputRow";
import type { Category, Product, ProductSpec } from "~/types";

export interface ProductFormValue {
  name: string; slug: string; sku: string; brand: string; description: string;
  price: string; originalPrice: string; costPrice: string; stock: string;
  categoryId: string; badge: string; badgeColor: string;
  rating: string; reviews: string; relatedSkus: string;
  metaTitle: string; metaDescription: string;
  images: string[];
  featured: boolean; active: boolean;
  specs: ProductSpec[];
}

export const emptyProduct: ProductFormValue = {
  name: "", slug: "", sku: "", brand: "", description: "",
  price: "", originalPrice: "", costPrice: "", stock: "0",
  categoryId: "", badge: "", badgeColor: "",
  rating: "0", reviews: "0", relatedSkus: "",
  metaTitle: "", metaDescription: "",
  images: [""],
  featured: false, active: true,
  specs: [{ label: "", value: "" }],
};

export function productToForm(p: Product): ProductFormValue {
  return {
    name: p.name, slug: p.slug, sku: p.sku, brand: p.brand,
    description: p.description ?? "",
    price: String(p.price),
    originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
    costPrice: String(p.costPrice),
    stock: String(p.stock),
    categoryId: p.category.id,
    badge: p.badge ?? "",
    badgeColor: p.badgeColor ?? "",
    rating: String(p.rating ?? 0),
    reviews: String(p.reviews ?? 0),
    relatedSkus: p.relatedSkus?.join(", ") ?? "",
    metaTitle: p.metaTitle ?? "",
    metaDescription: p.metaDescription ?? "",
    images: p.images.length ? p.images : [""],
    featured: p.featured,
    active: p.active,
    specs: p.specs?.length ? p.specs : [{ label: "", value: "" }],
  };
}

export function formToPayload(form: ProductFormValue) {
  return {
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
    relatedSkus: form.relatedSkus
      .split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
    metaTitle: form.metaTitle.trim() || null,
    metaDescription: form.metaDescription.trim() || null,
    images: form.images.map((url) => url.trim()).filter(Boolean),
    featured: form.featured,
    active: form.active,
    specs: form.specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value),
  };
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const BADGE_COLORS: Record<string, string> = {
  "Hot Deal":     "bg-red-500 text-white",
  "Best Seller":  "bg-brand text-brand-foreground",
  "Sale":         "bg-brand text-brand-foreground",
  "New":          "bg-blue-600 text-white",
  "Popular":      "bg-blue-600 text-white",
};

interface ProductFormProps {
  initialValue?: ProductFormValue;
  title: string;
  eyebrow: string;
  categories: Category[];
  saving: boolean;
  submitLabel?: string;
  /** When true, slug auto-generates from name as the user types (until they edit slug). */
  autoSlug?: boolean;
  submitError?: string;
  onSave: (form: ProductFormValue) => void;
}

export function ProductForm({
  initialValue,
  title,
  eyebrow,
  categories,
  saving,
  submitLabel = "Save",
  autoSlug = false,
  submitError,
  onSave,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValue>(initialValue ?? emptyProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValue) setForm(initialValue);
  }, [initialValue]);

  function set<K extends keyof ProductFormValue>(key: K, value: ProductFormValue[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Required";
    if (!form.slug.trim())  e.slug  = "Required";
    if (!form.sku.trim())   e.sku   = "Required";
    if (!form.brand.trim()) e.brand = "Required";
    if (!form.categoryId)   e.categoryId = "Required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Enter a valid price";
    if (!form.costPrice || isNaN(Number(form.costPrice)))
      e.costPrice = "Enter a valid cost price";
    if (form.rating && (isNaN(Number(form.rating)) || Number(form.rating) < 0 || Number(form.rating) > 5))
      e.rating = "Use a rating between 0 and 5";
    if (form.reviews && (isNaN(Number(form.reviews)) || Number(form.reviews) < 0))
      e.reviews = "Use a review count of 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const inputCls = (field: string) =>
    `w-full h-9 text-sm border rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black ${errors[field] ? "border-red-400" : "border-stone-200"}`;
  const textareaCls = (field: string) =>
    `w-full text-sm border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black resize-none ${errors[field] ? "border-red-400" : "border-stone-200"}`;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/products" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 transition-colors hover:border-black hover:text-black">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="eyebrow-xs mb-1 text-black/40">{eyebrow}</p>
          <h1 className="font-display truncate font-black tracking-tight text-black" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}>
            {title}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Basic Info">
          <Field label="Product name *" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (autoSlug) set("slug", toSlug(e.target.value));
              }}
              placeholder="e.g. HP LaserJet Pro M404n"
              className={inputCls("name")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug *" error={errors.slug}>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="hp-laserjet-m404n" className={inputCls("slug")} />
            </Field>
            <Field label="SKU *" error={errors.sku}>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="HP-LJ-M404N" className={inputCls("sku")} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand *" error={errors.brand}>
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="HP" className={inputCls("brand")} />
            </Field>
            <Field label="Category *" error={errors.categoryId}>
              <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls("categoryId")}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Describe this product…"
              className={textareaCls("description")}
            />
          </Field>
        </Section>

        <Section title="Pricing & Stock">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Sale price (KES) *" error={errors.price}>
              <input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="28500" className={inputCls("price")} />
            </Field>
            <Field label="Original price (KES)">
              <input type="number" min={0} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="33000" className={inputCls("originalPrice")} />
            </Field>
            <Field label="Cost price (KES) *" error={errors.costPrice}>
              <input type="number" min={0} value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="22000" className={inputCls("costPrice")} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock quantity">
              <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls("stock")} />
            </Field>
            <Field label="Badge">
              <select
                value={form.badge}
                onChange={(e) => {
                  const v = e.target.value;
                  set("badge", v);
                  set("badgeColor", BADGE_COLORS[v] ?? "");
                }}
                className={inputCls("badge")}
              >
                <option value="">None</option>
                {Object.keys(BADGE_COLORS).map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rating" error={errors.rating}>
              <input type="number" min={0} max={5} step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} className={inputCls("rating")} />
            </Field>
            <Field label="Reviews" error={errors.reviews}>
              <input type="number" min={0} value={form.reviews} onChange={(e) => set("reviews", e.target.value)} className={inputCls("reviews")} />
            </Field>
          </div>

          <div className="flex items-center gap-6">
            <Toggle
              checked={form.featured}
              onChange={(v) => set("featured", v)}
              label="Featured on home page"
            />
            <Toggle
              checked={form.active}
              onChange={(v) => set("active", v)}
              label="Active (visible to customers)"
            />
          </div>
        </Section>

        <Section title="Images">
          <div className="space-y-2">
            {form.images.map((url, i) => (
              <ImageInputRow
                key={i}
                value={url}
                onChange={(next) => {
                  const imgs = [...form.images];
                  imgs[i] = next;
                  set("images", imgs);
                }}
                onRemove={form.images.length > 1
                  ? () => set("images", form.images.filter((_, j) => j !== i))
                  : undefined}
              />
            ))}
            <button
              type="button"
              onClick={() => set("images", [...form.images, ""])}
              className="eyebrow-xs flex items-center gap-1.5 text-black hover:text-black/60"
            >
              <Plus className="h-3.5 w-3.5" /> Add image
            </button>
          </div>
        </Section>

        <Section title="Specifications">
          <div className="space-y-2">
            {form.specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={spec.label}
                  onChange={(e) => {
                    const next = [...form.specs];
                    next[i] = { ...next[i], label: e.target.value };
                    set("specs", next);
                  }}
                  placeholder="Label (e.g. RAM)"
                  className="w-36 h-9 text-sm border border-stone-200 rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black"
                />
                <input
                  value={spec.value}
                  onChange={(e) => {
                    const next = [...form.specs];
                    next[i] = { ...next[i], value: e.target.value };
                    set("specs", next);
                  }}
                  placeholder="Value (e.g. 16GB DDR4)"
                  className="flex-1 h-9 text-sm border border-stone-200 rounded-md px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black/40 text-black"
                />
                <button
                  type="button"
                  onClick={() => set("specs", form.specs.filter((_, j) => j !== i))}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-black/40 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}
              className="eyebrow-xs flex items-center gap-1.5 text-black hover:text-black/60"
            >
              <Plus className="h-3.5 w-3.5" /> Add spec row
            </button>
          </div>
        </Section>

        <Section title="Related Products & SEO">
          <Field label="Related product SKUs" hint="Separate SKUs with commas or new lines.">
            <textarea
              value={form.relatedSkus}
              onChange={(e) => set("relatedSkus", e.target.value)}
              rows={3}
              placeholder="HP-BAG-156-TL, ORICO-HUB7C"
              className={textareaCls("relatedSkus")}
            />
          </Field>
          <Field label="Meta title">
            <input
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="Search-friendly page title"
              className={inputCls("metaTitle")}
            />
          </Field>
          <Field label="Meta description">
            <textarea
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              rows={3}
              placeholder="Short product summary for search and previews"
              className={textareaCls("metaDescription")}
            />
          </Field>
        </Section>

        {submitError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-stone-200 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="eyebrow-xs inline-flex items-center gap-2 rounded-md bg-black px-6 py-2.5 text-white transition-colors hover:bg-black/85 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : submitLabel}
          </button>
          <Link to="/admin/products" className="eyebrow-xs text-black/45 transition-colors hover:text-black">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ── internal helpers ─────────────────────────────────────── */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-stone-200 bg-white p-6">
      <h2 className="eyebrow-xs text-black/45">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="eyebrow-xs block text-black/55">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-black/45">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-stone-300 text-black focus:ring-black/40"
      />
      <span className="text-sm font-medium text-black">{label}</span>
    </label>
  );
}

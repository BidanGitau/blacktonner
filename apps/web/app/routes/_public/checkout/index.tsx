import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag } from "lucide-react";

import { normaliseKePhone } from "~/lib/brand";
import { useCreateOrder } from "~/lib/queries";
import { DELIVERY_ZONE_OPTIONS, useCartStore } from "~/store/cart";

export const meta: MetaFunction = () => [
  { title: "Checkout — Blacktoner" },
];

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const deliveryZone = useCartStore((s) => s.deliveryZone);
  const setDeliveryZone = useCartStore((s) => s.setDeliveryZone);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const total = useCartStore((s) => s.total());
  const clear = useCartStore((s) => s.clear);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createOrder = useCreateOrder();

  if (items.length === 0) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16 lg:px-6">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 border border-stone-200 bg-stone-50 px-8 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-black/40">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <p className="text-2xl font-black uppercase tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
              Nothing to check out
            </p>
            <p className="text-sm leading-relaxed text-black/55">
              Your bag is empty. Add a few products and come back here to place your order.
            </p>
            <Link
              to="/products"
              className="mt-2 inline-flex items-center gap-2 bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85"
            >
              Shop Products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!name.trim()) next.name = "Required";
    if (!normaliseKePhone(phone)) next.phone = "Enter a valid Kenyan phone number";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (!address.trim()) next.address = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);

    createOrder.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryZone,
        deliveryFee,
        notes: notes.trim() || undefined,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      },
      {
        onSuccess: (order) => {
          clear();
          navigate(`/order-confirmed/${order.id}`);
        },
        onError: (err: any) => {
          setSubmitError(
            err?.response?.data?.message ?? "Could not place order. Please try again.",
          );
        },
      },
    );
  }

  const inputCls = (field: keyof Errors) =>
    `mt-1.5 h-10 w-full border bg-white px-3 text-sm text-black placeholder:text-black/35 focus:outline-none ${
      errors[field] ? "border-red-400 focus:border-red-500" : "border-black/15 focus:border-black"
    }`;

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-8 lg:px-6 lg:py-10">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            — Almost There —
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-black md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
              Checkout
            </h1>
            <button
              onClick={() => navigate("/cart")}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/55 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-3 w-3" /> Back To Cart
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:px-6 lg:py-14">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          {/* Customer details */}
          <div className="min-w-0 space-y-8">
            <section>
              <header className="mb-5 border-b border-stone-200 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                  01 · Your Details
                </p>
              </header>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: undefined })); }}
                    placeholder="Jane Wanjiku"
                    className={inputCls("name")}
                  />
                  {errors.name && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((er) => ({ ...er, phone: undefined })); }}
                    placeholder="07xx xxx xxx"
                    className={inputCls("phone")}
                  />
                  {errors.phone && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: undefined })); }}
                    placeholder="you@example.com"
                    className={inputCls("email")}
                  />
                  {errors.email && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.email}</p>}
                </div>
              </div>
            </section>

            <section>
              <header className="mb-5 border-b border-stone-200 pb-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                  02 · Delivery
                </p>
              </header>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setErrors((er) => ({ ...er, address: undefined })); }}
                    placeholder="Street, building, floor / office"
                    className={inputCls("address")}
                  />
                  {errors.address && <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    Zone
                  </label>
                  <select
                    value={deliveryZone}
                    onChange={(e) => setDeliveryZone(e.target.value)}
                    className="mt-1.5 h-10 w-full border border-black/15 bg-white px-3 text-sm text-black focus:border-black focus:outline-none"
                  >
                    {DELIVERY_ZONE_OPTIONS.map((zone) => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    Notes <span className="text-black/30">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Best time to call, gate codes, special instructions…"
                    className="mt-1.5 w-full resize-none border border-black/15 bg-white p-3 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="border border-black/10 bg-stone-50 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                How this works
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-black/65">
                When you submit, we record your order and our sales team responds within a few business hours
                to confirm stock and arrange delivery &amp; payment. No payment is taken right now.
              </p>
            </section>

            {submitError && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-black/10 bg-white">
              <div className="border-b border-stone-200 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                  Your Order
                </p>
              </div>

              <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-3 p-4">
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-12 w-12 shrink-0 border border-stone-200 bg-stone-50 object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-black">{product.name}</p>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">{product.sku}</p>
                      <div className="mt-1 flex items-baseline justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-black/45">
                          ×{quantity}
                        </span>
                        <span className="text-xs font-black tabular-nums text-black" style={{ fontFamily: "var(--font-display)" }}>
                          KES {(product.price * quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 border-t border-stone-200 px-5 py-4">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span className="tabular-nums text-black">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-black/60">Delivery · {deliveryZone}</span>
                  <span className="tabular-nums text-black">KES {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex items-baseline justify-between border-t-2 border-black pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                    Total
                  </span>
                  <span className="text-xl font-black tabular-nums text-black" style={{ fontFamily: "var(--font-display)" }}>
                    KES {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 p-5">
                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 bg-black text-[11px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-stone-300"
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Placing order…
                    </>
                  ) : (
                    <>
                      Place Order <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
                <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-black/40">
                  No payment now · Sales team confirms stock first
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

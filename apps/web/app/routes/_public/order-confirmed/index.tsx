import { Link, useParams } from "react-router";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useOrder } from "~/lib/queries";

export default function OrderConfirmedPage() {
  const { id = "" } = useParams();
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center px-4 py-24 text-black/55">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">Order not found</p>
        <p className="mt-2 text-sm text-black/55">We couldn't find an order with that reference.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85"
        >
          Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const firstName = order.customer?.name?.split(" ")[0] ?? "friend";
  const shortId = order.id.slice(-8).toUpperCase();

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16 lg:px-6">
        <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-6 w-6" strokeWidth={1.6} />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
                — Order Received —
              </p>
              <h1
                className="text-3xl font-black uppercase tracking-tight text-black md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Thank you, {firstName}
              </h1>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-black/45">
                Ref · {shortId}
              </p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-black/65">
              We've recorded your order and our sales team will reach out shortly to confirm stock
              and arrange delivery. No payment is taken right now.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85"
              >
                Continue Shopping <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/"
                className="border-b border-black/20 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black/55 transition-colors hover:border-black hover:text-black"
              >
                Home
              </Link>
            </div>
          </div>

          <aside className="border border-black/10 bg-white">
            <div className="border-b border-stone-200 px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">Summary</p>
            </div>
            <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
              {order.items?.map((it) => (
                <li key={it.id} className="flex gap-3 p-4">
                  <img
                    src={it.product.images?.[0]}
                    alt=""
                    className="h-12 w-12 shrink-0 border border-stone-200 bg-stone-50 object-contain p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-black">{it.product.name}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">
                      {it.product.sku}
                    </p>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-black/45">
                        ×{it.quantity}
                      </span>
                      <span
                        className="text-xs font-black tabular-nums text-black"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        KES {Number(it.total).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-stone-200 px-5 py-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-black/60">Subtotal</span>
                <span className="tabular-nums text-black">
                  KES {Number(order.subtotal).toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-black/60">Delivery · {order.deliveryZone}</span>
                <span className="tabular-nums text-black">
                  KES {Number(order.deliveryFee).toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t-2 border-black pt-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                  Total
                </span>
                <span
                  className="text-xl font-black tabular-nums text-black"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  KES {Number(order.total).toLocaleString()}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

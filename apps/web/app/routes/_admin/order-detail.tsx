import { useParams, Link } from "react-router";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useOrder, useUpdateOrderStatus, useConfirmOrder } from "~/lib/queries";
import { ORDER_STATUS_LABELS, type OrderStatus } from "~/types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending_confirmation: "border-orange-200 bg-orange-50 text-orange-600",
  confirmed: "border-blue-200 bg-blue-50 text-blue-600",
  out_for_delivery: "border-purple-200 bg-purple-50 text-purple-600",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-600",
};

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-md border border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
        {label}
      </p>
      <div className="text-sm font-medium text-black">{children}</div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrder(id!);
  const updateStatus = useUpdateOrderStatus();
  const confirmOrder = useConfirmOrder();

  if (isLoading) {
    return (
      <div className="space-y-4 px-6 py-8 lg:px-10 lg:py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-stone-100" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-72 animate-pulse rounded-md border border-stone-200 bg-white" />
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-md border border-stone-200 bg-white" />
            <div className="h-48 animate-pulse rounded-md border border-stone-200 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <p className="text-sm text-red-600">Order not found.</p>
        <Link to="/admin/orders" className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-black hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link
          to="/admin/orders"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-black/55 transition-colors hover:border-black hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
            Order
          </p>
          <h1 className="font-black tracking-tight text-black" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
            #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
            {new Date(order.createdAt).toLocaleDateString("en-KE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_BADGE[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column — Items */}
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-md border border-stone-200 bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
                Items
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-stone-50/60">
                <tr className="border-b border-stone-200">
                  <th className="px-5 py-2.5 text-left text-sm font-medium text-black/55">Product</th>
                  <th className="px-5 py-2.5 text-right text-sm font-medium text-black/55">Qty</th>
                  <th className="px-5 py-2.5 text-right text-sm font-medium text-black/55">Unit</th>
                  <th className="px-5 py-2.5 text-right text-sm font-medium text-black/55">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {item.product.images[0] && (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="h-9 w-9 shrink-0 rounded-md border border-stone-200 bg-stone-50 object-contain p-1"
                          />
                        )}
                        <div>
                          <p className="font-medium text-black">{item.product.name}</p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">
                            {item.product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-black/70">{item.quantity}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-black/70">
                      KES {item.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-black">
                      KES {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1.5 border-t border-stone-200 bg-stone-50/40 px-5 py-4">
              <div className="flex justify-between text-sm text-black/65">
                <span>Subtotal</span>
                <span className="tabular-nums">KES {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-black/65">
                <span>Delivery</span>
                <span className="tabular-nums">KES {order.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-black">
                <span className="uppercase tracking-[0.18em]">Total</span>
                <span className="tabular-nums">KES {order.total.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right rail — Details */}
        <aside className="space-y-6">
          <Section title="Status">
            <div className="space-y-3">
              {order.status === "pending_confirmation" && (
                <Button
                  onClick={() => confirmOrder.mutate(order.id)}
                  disabled={confirmOrder.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {confirmOrder.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Confirm order
                </Button>
              )}
              <select
                value={order.status}
                onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                disabled={updateStatus.isPending}
                className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black/40 disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </Section>

          <Section title="Customer">
            <div className="space-y-4">
              <Field label="Name">{order.customer.name}</Field>
              <Field label="Phone">{order.phone}</Field>
              <Field label="Email">
                <span className="break-all">{order.customer.email}</span>
              </Field>
              <Field label="OTP Verified">
                <span className={order.otpVerified ? "text-emerald-600" : "text-black/40"}>
                  {order.otpVerified ? "Yes" : "No"}
                </span>
              </Field>
            </div>
          </Section>

          <Section title="Delivery">
            <div className="space-y-4">
              <Field label="Address">
                {order.deliveryAddress}
              </Field>
              <Field label="Zone">{order.deliveryZone}</Field>
              {order.notes && <Field label="Notes">{order.notes}</Field>}
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

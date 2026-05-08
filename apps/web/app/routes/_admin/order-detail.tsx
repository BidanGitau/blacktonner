import { useParams, Link } from "react-router";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useOrder, useUpdateOrderStatus, useConfirmOrder } from "~/lib/queries";
import { ORDER_STATUS_LABELS, type OrderStatus } from "~/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_confirmation: "bg-orange-50 text-orange-600 border-orange-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  out_for_delivery: "bg-purple-50 text-purple-600 border-purple-200",
  delivered: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrder(id!);
  const updateStatus = useUpdateOrderStatus();
  const confirmOrder = useConfirmOrder();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-red-500">Order not found.</p>
        <Link to="/admin/orders" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/orders"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-KE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Actions</h2>
        <div className="flex flex-wrap items-center gap-3">
          {order.status === "pending_confirmation" && (
            <button
              onClick={() => confirmOrder.mutate(order.id)}
              disabled={confirmOrder.isPending}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {confirmOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirm order
            </button>
          )}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">Status:</label>
            <select
              value={order.status}
              onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
              disabled={updateStatus.isPending}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 disabled:opacity-60"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Customer</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Name</p>
            <p className="font-medium text-slate-900">{order.customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Phone</p>
            <p className="font-medium text-slate-900">{order.phone}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Email</p>
            <p className="font-medium text-slate-900">{order.customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">OTP Verified</p>
            <p className={`font-medium ${order.otpVerified ? "text-green-600" : "text-slate-400"}`}>
              {order.otpVerified ? "Yes" : "No"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400 mb-0.5">Delivery Address</p>
            <p className="font-medium text-slate-900">
              {order.deliveryAddress}, {order.deliveryZone}
            </p>
          </div>
          {order.notes && (
            <div className="col-span-2">
              <p className="text-xs text-slate-400 mb-0.5">Notes</p>
              <p className="text-slate-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-t border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Product
              </th>
              <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Qty
              </th>
              <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Unit
              </th>
              <th className="text-right px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="h-10 w-10 rounded-lg object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{item.product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="px-6 py-3 text-right text-slate-600">
                  KES {item.unitPrice.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right font-bold text-slate-900">
                  KES {item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 p-6 space-y-1.5">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>KES {order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Delivery</span>
            <span>KES {order.deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
            <span>Total</span>
            <span>KES {order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared admin form/cell styles + display formatters.

export const labelCls =
  "block text-[10px] font-bold uppercase tracking-[0.18em] text-black/55";

export const inputBase =
  "h-9 w-full border bg-white px-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-1 focus:ring-black/40";

export function inputCls(err = false) {
  return `mt-1.5 ${inputBase} ${err ? "border-red-400" : "border-stone-200"}`;
}

export const textareaCls =
  "mt-1.5 w-full resize-none border border-stone-200 bg-white p-3 text-sm text-black placeholder:text-black/35 focus:outline-none focus:ring-1 focus:ring-black/40";

export function formatKES(amount: number | string | null | undefined) {
  const n = Number(amount ?? 0);
  return `KES ${n.toLocaleString("en-KE")}`;
}

const DATE_OPTS_SHORT: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
const DATE_OPTS_LONG: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
const DATE_OPTS_TIME: Intl.DateTimeFormatOptions = {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
};

export function formatDate(value: string | Date | null | undefined, variant: "short" | "long" | "time" = "short") {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "—";
  const opts = variant === "long" ? DATE_OPTS_LONG : variant === "time" ? DATE_OPTS_TIME : DATE_OPTS_SHORT;
  return d.toLocaleDateString("en-KE", opts);
}

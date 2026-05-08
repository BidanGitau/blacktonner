import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Cable,
  Droplets,
  Headphones,
  Laptop,
  Printer,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const CATEGORIES: Array<{
  name: string;
  slug: string;
  icon: LucideIcon;
  desc: string;
  from: string;
  to: string;
  light: string;
}> = [
  { name: "Laptops", slug: "laptops", icon: Laptop, desc: "Business, gaming & student laptops", from: "from-blue-600", to: "to-blue-400", light: "bg-blue-50 text-blue-600" },
  { name: "Printers", slug: "printers", icon: Printer, desc: "Inkjet, laser & multifunction", from: "from-violet-600", to: "to-violet-400", light: "bg-violet-50 text-violet-600" },
  { name: "Cartridges", slug: "cartridges", icon: Droplets, desc: "OEM & compatible ink & toner", from: "from-cyan-600", to: "to-cyan-400", light: "bg-cyan-50 text-cyan-600" },
  { name: "Accessories", slug: "accessories", icon: Cable, desc: "Cables, bags, stands & more", from: "from-amber-500", to: "to-yellow-400", light: "bg-amber-50 text-amber-600" },
];

export const TRUST: Array<{
  icon: LucideIcon;
  title: string;
  sub: string;
}> = [
  { icon: Truck, title: "Same-day Delivery", sub: "Within Nairobi" },
  { icon: Banknote, title: "Cash on Delivery", sub: "Pay when you receive" },
  { icon: ShieldCheck, title: "Genuine Products", sub: "100% authentic" },
  { icon: Headphones, title: "Support", sub: "Mon–Sat 8am–6pm" },
];

import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowRight, Award, Headphones, Laptop, Mail, MessageCircle, Phone, ShieldCheck, Truck } from "lucide-react";

import { BRAND } from "~/lib/brand";

export const meta: MetaFunction = () => [
  { title: "About — Blacktoner Technologies" },
  { name: "description", content: "Blacktoner Technologies is a Kenyan tech supplier specialising in laptops, printers, cartridges and accessories — built on genuine products, fair pricing, and fast Nairobi delivery." },
];

const STATS = [
  { value: "5+",     label: "Years In Business" },
  { value: "10K+",   label: "Items Delivered" },
  { value: "98%",    label: "On-Time Delivery" },
  { value: "Same-Day", label: "Nairobi Dispatch" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Genuine Only",
    body: "Every laptop, printer, toner and accessory we list is sourced from authorised channels. No counterfeits, no surprises.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    body: "Same-day dispatch within Nairobi for orders placed before 1pm. Countrywide delivery via trusted couriers in 1–3 business days.",
  },
  {
    icon: Award,
    title: "Fair Pricing",
    body: "We benchmark against the market daily so you don't have to. Transparent pricing, with bulk discounts for businesses.",
  },
  {
    icon: Headphones,
    title: "Real Support",
    body: "A real person on the other end of the WhatsApp. We help match the right device to your workload — not just close the sale.",
  },
];

const SPECIALITIES = [
  { icon: Laptop, label: "Business Laptops",  desc: "Dell, Lenovo, HP — workstations and enterprise notebooks" },
  { icon: Laptop, label: "Office Printers",   desc: "LaserJet, ink-tank, multifunction units for SMEs" },
  { icon: Laptop, label: "Toners & Inks",     desc: "OEM cartridges for HP, Canon, Epson, Brother and more" },
  { icon: Laptop, label: "Accessories",       desc: "Cables, docks, monitors, peripherals — the complete kit" },
];

const BRAND_PARTNERS = [
  "Kyocera",
  "Ricoh",
  "HP",
  "Canon",
  "Epson",
  "Brother",
  "Xerox",
  "Lenovo",
  "Dell",
  "Samsung",
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-14 lg:px-6 lg:py-20">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
                <span className="block h-px w-6 bg-black/25" />
                About {BRAND.name}
              </p>
              <h1
                className="font-black uppercase leading-[0.95] tracking-tight text-black"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontFamily: "var(--font-display)" }}
              >
                Tech That Just <span className="text-brand">Works.</span>
                <br />
                <span className="text-black/30">Sourced In Kenya.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-black/65">
                {BRAND.name} is a Nairobi-based supplier of laptops, printers, cartridges and IT accessories. We help businesses, schools and households buy the right gear — without the markup, the runaround, or the counterfeit risk.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/85"
                >
                  Shop Products <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/catalogue"
                  className="border-b border-black/20 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black/55 transition-colors hover:border-black hover:text-black"
                >
                  Build A Catalogue
                </Link>
              </div>
            </div>

            {/* Stats panel */}
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-stone-200 bg-stone-200">
              {STATS.map((s) => (
                <div key={s.label} className="bg-white p-6">
                  <p
                    className="text-3xl font-black tracking-tight text-black md:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.7fr_1fr] lg:gap-16">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
                — Our Story —
              </p>
              <h2
                className="text-2xl font-black uppercase tracking-tight text-black md:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Built For Kenya's Workplaces.
              </h2>
            </div>
            <div className="space-y-5 text-[15px] leading-relaxed text-black/70">
              <p>
                We started {BRAND.name} after years of watching businesses overpay for grey-market printers and worry whether the toner they just bought was real. Tech procurement in East Africa shouldn't be that stressful.
              </p>
              <p>
                Today we serve SMEs, NGOs, schools and individual buyers across Kenya — pairing a curated catalogue of trusted brands with fast, accountable fulfilment. Every order ships from our Nairobi warehouse, every cartridge is checked, and every customer talks to a real person.
              </p>
              <p>
                We're not the biggest. We are the most accountable.
              </p>
            </div>
          </div>

          {/* Brand partners */}
          <div className="mt-16 border-t border-stone-200 pt-12">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
              — Authorised Partner —
            </p>
            <h3
              className="max-w-3xl text-xl font-black uppercase leading-tight tracking-tight text-black md:text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              We are authorised wholesalers and retailers of brand new top renowned distinguished brands such as:
            </h3>

            <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-stone-200 bg-stone-200 sm:grid-cols-3 md:grid-cols-5">
              {BRAND_PARTNERS.map((name) => (
                <li
                  key={name}
                  className="flex h-20 items-center justify-center bg-white px-4 transition-colors hover:bg-stone-50"
                >
                  <span
                    className="text-base font-black uppercase tracking-[0.18em] text-black/55 transition-colors hover:text-black md:text-lg"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {name}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-black/40">
              All products carry full manufacturer warranties · Sourced through authorised channels
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
              — What We Stand For —
            </p>
            <h2
              className="text-2xl font-black uppercase tracking-tight text-black md:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Four Promises We Don't Bend.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden border border-stone-200 bg-stone-200 md:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white p-8 transition-colors hover:bg-stone-50">
                <div className="flex h-10 w-10 items-center justify-center bg-brand text-brand-foreground">
                  <v.icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                  {v.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we sell */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
                — What We Carry —
              </p>
              <h2
                className="text-2xl font-black uppercase tracking-tight text-black md:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Specialised, Not Sprawling.
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-2 border-b border-black/30 pb-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-colors hover:border-black sm:inline-flex"
            >
              Shop All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-px overflow-hidden border border-stone-200 bg-stone-200 md:grid-cols-2 lg:grid-cols-4">
            {SPECIALITIES.map((s) => (
              <li key={s.label} className="bg-white p-6">
                <s.icon className="h-4 w-4 text-black/40" strokeWidth={1.6} />
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black">
                  {s.label}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-black/55">
                  {s.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-black text-white">
        <div className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
                <span className="block h-px w-6 bg-white/25" />
                Get In Touch
              </p>
              <h2
                className="text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Need Help Picking? <br />
                <span className="text-white/40">We'll Get On A Call.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                Tell us your workload — number of users, expected page volume, budget — and we'll spec the kit. No pressure, no markup games.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.8} />
                {BRAND.phone}
              </a>
              <a
                href={`https://wa.me/${BRAND.whatsappNumber}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-3 bg-brand px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-foreground transition-colors hover:bg-brand/90"
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
                WhatsApp Sales
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.8} />
                {BRAND.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

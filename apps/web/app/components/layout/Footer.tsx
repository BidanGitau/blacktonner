import { Link } from "react-router";

const SOCIALS = [
  {
    label: "Instagram",
    to: "#",
    path: "M12 2.2c3.2 0 3.58.012 4.85.07 1.17.054 1.8.249 2.23.413.56.218.96.479 1.38.9.42.42.681.82.9 1.38.163.42.358 1.05.412 2.23.058 1.265.07 1.645.07 4.85s-.012 3.58-.07 4.85c-.054 1.17-.249 1.8-.413 2.23-.218.56-.479.96-.9 1.38-.42.42-.82.681-1.38.9-.42.163-1.05.358-2.23.412-1.265.058-1.645.07-4.85.07s-3.58-.012-4.85-.07c-1.17-.054-1.8-.249-2.23-.413-.56-.218-.96-.479-1.38-.9-.42-.42-.681-.82-.9-1.38-.163-.42-.358-1.05-.412-2.23C2.212 15.58 2.2 15.2 2.2 12s.012-3.58.07-4.85c.054-1.17.249-1.8.413-2.23.218-.56.479-.96.9-1.38.42-.42.82-.681 1.38-.9.42-.163 1.05-.358 2.23-.412C8.42 2.212 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.52.012-4.76.069-1.07.05-1.65.226-2.04.376-.51.2-.88.44-1.27.83-.39.39-.63.76-.83 1.27-.15.39-.327.97-.376 2.04-.057 1.24-.069 1.61-.069 4.76s.012 3.52.069 4.76c.05 1.07.226 1.65.376 2.04.2.51.44.88.83 1.27.39.39.76.63 1.27.83.39.15.97.327 2.04.376 1.24.057 1.61.069 4.76.069s3.52-.012 4.76-.069c1.07-.05 1.65-.226 2.04-.376.51-.2.88-.44 1.27-.83.39-.39.63-.76.83-1.27.15-.39.327-.97.376-2.04.057-1.24.069-1.61.069-4.76s-.012-3.52-.069-4.76c-.05-1.07-.226-1.65-.376-2.04-.2-.51-.44-.88-.83-1.27-.39-.39-.76-.63-1.27-.83-.39-.15-.97-.327-2.04-.376C15.52 4.012 15.15 4 12 4zm0 3.06a4.94 4.94 0 110 9.88 4.94 4.94 0 010-9.88zm0 8.14a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zm6.28-8.34a1.15 1.15 0 11-2.3 0 1.15 1.15 0 012.3 0z",
  },
  {
    label: "Facebook",
    to: "#",
    path: "M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03h-2.54v-2.9h2.54v-2.2c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.57v1.87h2.77l-.44 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94z",
  },
  {
    label: "Twitter",
    to: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/products" },
      { label: "Laptops",      to: "/products?category=laptops" },
      { label: "Printers",     to: "/products?category=printers" },
      { label: "Cartridges",   to: "/products?category=cartridges" },
      { label: "Sale",         to: "/products?badge=Hot+Deal" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us",       to: "/about" },
      { label: "Contact",        to: "/about#contact" },
      { label: "Tips & How-Tos", to: "/blog" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "0111 040 400",     to: "tel:+254111040400" },
      { label: "WhatsApp · 0792 792 750", to: "https://wa.me/254792792750" },
      { label: "sales@blacktonertechnologies.co.ke", to: "mailto:sales@blacktonertechnologies.co.ke" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black text-white">
      <div className="container mx-auto grid gap-10 px-4 py-10 md:grid-cols-[1.2fr_2fr] md:gap-12 md:py-12 lg:px-6">
        {/* Brand block */}
        <div>
          <Link to="/" className="text-xl font-black tracking-tight">
            Black<span className="text-white/60">toner</span>
          </Link>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/55">
            Genuine printer supplies, laptops & repair services — built in Nairobi, delivered nationwide.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map(({ label, to, path }) => (
              <a
                key={label}
                href={to}
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-white hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to.startsWith("http") || link.to.startsWith("tel:") || link.to.startsWith("mailto:") ? (
                      <a
                        href={link.to}
                        target={link.to.startsWith("http") ? "_blank" : undefined}
                        rel={link.to.startsWith("http") ? "noopener" : undefined}
                        className="text-xs text-white/65 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className="text-xs text-white/65 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 sm:flex-row lg:px-6">
          <p>© {new Date().getFullYear()} Blacktoner · Nairobi, Kenya</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-white">Privacy</a>
            <a href="#" className="transition-colors hover:text-white">Terms</a>
            <a href="#" className="transition-colors hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

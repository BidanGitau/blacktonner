import { Link } from "react-router";

const SOCIALS = [
  { label: "Instagram", to: "#" },
  { label: "Facebook",  to: "#" },
  { label: "Twitter",   to: "#" },
];

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products",  to: "/products" },
      { label: "Laptops",       to: "/products?category=laptops" },
      { label: "Printers",      to: "/products?category=printers" },
      { label: "Cartridges",    to: "/products?category=cartridges" },
      { label: "Accessories",   to: "/products?category=accessories" },
      { label: "Sale",          to: "/products?badge=Hot+Deal" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In",       to: "/login" },
      { label: "Register",      to: "/register" },
      { label: "My Orders",     to: "/orders" },
      { label: "My Catalogues", to: "/catalogue" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us",    to: "#" },
      { label: "Shipping",      to: "#" },
      { label: "Returns",       to: "#" },
      { label: "FAQ",           to: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      {/* Main columns */}
      <div className="container mx-auto px-4 lg:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white mb-5">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs text-white/55 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact column */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white mb-5">Contact</h4>
          <ul className="space-y-3 text-xs text-white/55">
            <li>Nairobi, Kenya</li>
            <li><a href="tel:+254700000000" className="hover:text-white transition-colors">+254 700 000 000</a></li>
            <li><a href="mailto:hello@blacktoner.co.ke" className="hover:text-white transition-colors">hello@blacktoner.co.ke</a></li>
          </ul>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.to} className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55 hover:text-white transition-colors">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          <p>© {new Date().getFullYear()} Blacktoner — Built In Kenya</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

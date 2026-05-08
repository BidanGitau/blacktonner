import { Link, useLocation } from "react-router";
import { ShoppingBag, Search, X, Menu, User } from "lucide-react";
import { useCartStore } from "~/store/cart";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Shop All",    to: "/products" },
  { label: "Laptops",     to: "/products?category=laptops" },
  { label: "Printers",    to: "/products?category=printers" },
  { label: "Cartridges",  to: "/products?category=cartridges" },
  { label: "Accessories", to: "/products?category=accessories" },
  { label: "Sale",        to: "/products?badge=Hot+Deal" },
  { label: "About",       to: "/about" },
];

export function Header() {
  const count = useCartStore((s) => s.count());
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.search]);

  const isActive = (to: string) =>
    to === "/products"
      ? location.pathname === "/products" && !location.search
      : location.pathname + location.search === to;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? "border-b border-stone-200" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-10">

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="md:hidden flex h-9 w-9 items-center justify-center text-black -ml-2"
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.6} /> : <Menu className="h-5 w-5" strokeWidth={1.6} />}
          </button>

          {/* Logo (left on desktop, centered on mobile) */}
          <Link to="/" className="shrink-0 flex items-center md:mr-10 mx-auto md:mx-0">
            <img src="/logo.png" alt="Blacktoner" className="h-10 w-10" />
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-7 flex-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    active ? "text-black" : "text-black/55 hover:text-black"
                  }`}
                >
                  {link.label}
                  {active && <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-black" />}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 md:gap-5 ml-auto">
            <Link to="/search" aria-label="Search" className="hidden sm:flex h-9 w-9 items-center justify-center text-black hover:opacity-60 transition-opacity">
              <Search className="h-5 w-5" strokeWidth={1.6} />
            </Link>
            <Link to="/login" aria-label="Account" className="hidden sm:flex h-9 w-9 items-center justify-center text-black hover:opacity-60 transition-opacity">
              <User className="h-5 w-5" strokeWidth={1.6} />
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative flex h-9 w-9 items-center justify-center text-black hover:opacity-60 transition-opacity">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black text-white text-[9px] font-bold leading-none px-1">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-stone-200">
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center justify-between px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b border-stone-100 last:border-0 transition-colors ${
                    isActive(link.to) ? "text-black bg-stone-50" : "text-black/55 hover:text-black hover:bg-stone-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 border-t border-stone-200">
                <Link to="/search" className="flex items-center justify-center gap-2 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-stone-50">
                  <Search className="h-4 w-4" strokeWidth={1.6} /> Search
                </Link>
                <Link to="/login" className="flex items-center justify-center gap-2 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-stone-50 border-l border-stone-200">
                  <User className="h-4 w-4" strokeWidth={1.6} /> Account
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="h-16" />
    </>
  );
}

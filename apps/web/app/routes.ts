import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  // Public storefront
  layout("routes/_public/layout.tsx", [
    index("routes/_public/home/index.tsx"),
    route("products", "routes/_public/products/index.tsx"),
    route("products/:slug", "routes/_public/products/detail.tsx"),
    route("cart", "routes/_public/cart/index.tsx"),
    route("checkout", "routes/_public/checkout/index.tsx"),
    route("checkout/otp", "routes/_public/checkout/otp.tsx"),
    route("order-confirmed/:id", "routes/_public/order-confirmed/index.tsx"),
    route("search", "routes/_public/search/index.tsx"),
    route("catalogue", "routes/_public/catalogue/index.tsx"),
    route("about", "routes/_public/about/index.tsx"),
    route("blog", "routes/_public/blog/index.tsx"),
    route("blog/:slug", "routes/_public/blog/detail.tsx"),
  ]),

  // Auth (no shell)
  route("login", "routes/_auth/login.tsx"),
  route("register", "routes/_auth/register.tsx"),

  // Admin dashboard
  layout("routes/_admin/layout.tsx", [
    route("admin", "routes/_admin/dashboard.tsx"),
    route("admin/orders", "routes/_admin/orders/index.tsx"),
    route("admin/orders/:id", "routes/_admin/orders/detail.tsx"),
    route("admin/products", "routes/_admin/products/index.tsx"),
    route("admin/products/new", "routes/_admin/products/new.tsx"),
    route("admin/products/:id/edit", "routes/_admin/products/edit.tsx"),
    route("admin/categories", "routes/_admin/categories.tsx"),
    route("admin/prices", "routes/_admin/prices.tsx"),
    route("admin/scraper", "routes/_admin/scraper.tsx"),
    route("admin/posts", "routes/_admin/posts/index.tsx"),
    route("admin/posts/new", "routes/_admin/posts/new.tsx"),
    route("admin/posts/:id/edit", "routes/_admin/posts/edit.tsx"),
    route("admin/sales/leads", "routes/_admin/sales/leads/index.tsx"),
    route("admin/sales/leads/new", "routes/_admin/sales/leads/new.tsx"),
    route("admin/sales/leads/:id", "routes/_admin/sales/leads/detail.tsx"),
    route("admin/sales/pipeline", "routes/_admin/sales/pipeline.tsx"),
    route("admin/sales/customers", "routes/_admin/sales/customers/index.tsx"),
    route("admin/sales/customers/:id", "routes/_admin/sales/customers/detail.tsx"),
    route("admin/sales/invoices", "routes/_admin/sales/invoices/index.tsx"),
    route("admin/sales/invoices/new", "routes/_admin/sales/invoices/new.tsx"),
    route("admin/sales/invoices/:id", "routes/_admin/sales/invoices/detail.tsx"),
    route("admin/maintenance/tickets", "routes/_admin/maintenance/tickets/index.tsx"),
    route("admin/maintenance/tickets/new", "routes/_admin/maintenance/tickets/new.tsx"),
    route("admin/maintenance/tickets/:id", "routes/_admin/maintenance/tickets/detail.tsx"),
    route("admin/team", "routes/_admin/team.tsx"),
  ]),
] satisfies RouteConfig;

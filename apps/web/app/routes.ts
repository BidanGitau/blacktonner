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
    route("admin/orders", "routes/_admin/orders.tsx"),
    route("admin/orders/:id", "routes/_admin/order-detail.tsx"),
    route("admin/products", "routes/_admin/products.tsx"),
    route("admin/products/new", "routes/_admin/product-new.tsx"),
    route("admin/products/:id/edit", "routes/_admin/product-edit.tsx"),
    route("admin/categories", "routes/_admin/categories.tsx"),
    route("admin/prices", "routes/_admin/prices.tsx"),
    route("admin/scraper", "routes/_admin/scraper.tsx"),
    route("admin/posts", "routes/_admin/posts.tsx"),
    route("admin/posts/new", "routes/_admin/post-new.tsx"),
    route("admin/posts/:id/edit", "routes/_admin/post-edit.tsx"),
    route("admin/sales/leads", "routes/_admin/leads.tsx"),
    route("admin/sales/leads/new", "routes/_admin/lead-new.tsx"),
    route("admin/sales/leads/:id", "routes/_admin/lead-detail.tsx"),
    route("admin/sales/pipeline", "routes/_admin/sales-pipeline.tsx"),
    route("admin/sales/customers", "routes/_admin/customers.tsx"),
    route("admin/sales/customers/:id", "routes/_admin/customer-detail.tsx"),
    route("admin/sales/invoices", "routes/_admin/invoices.tsx"),
    route("admin/sales/invoices/new", "routes/_admin/invoice-new.tsx"),
    route("admin/sales/invoices/:id", "routes/_admin/invoice-detail.tsx"),
    route("admin/maintenance/tickets", "routes/_admin/tickets.tsx"),
    route("admin/maintenance/tickets/new", "routes/_admin/ticket-new.tsx"),
    route("admin/maintenance/tickets/:id", "routes/_admin/ticket-detail.tsx"),
    route("admin/team", "routes/_admin/team.tsx"),
  ]),
] satisfies RouteConfig;

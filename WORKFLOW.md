# BLACKTONER E-COMMERCE WORKFLOW

> Implementation roadmap — tier by tier. No code. Track progress by checking off each item.

---

## WEEK 1 — FOUNDATION

### Backend
- [ ] Initialize NestJS project
- [ ] Setup PostgreSQL database
- [ ] Setup Redis
- [ ] Create database schema
  - `users`
  - `products`
  - `categories`
  - `orders`
  - `order_items`
  - `competitor_products`
  - `price_history`
- [ ] Run migrations
- [ ] Seed test data (50 products, categories)

### Frontend
- [ ] Initialize Remix project
- [ ] Install dependencies
  - TanStack Query
  - TanStack Table
  - Tailwind CSS
  - shadcn/ui
- [ ] Setup folder structure
- [ ] Configure API client

---

## WEEK 2 — AUTHENTICATION + PRODUCTS API

### Backend
- [ ] Build authentication module (JWT)
- [ ] Create auth endpoints — `login`, `register`
- [ ] Setup role guards — `customer`, `admin`
- [ ] Build products API — `list`, `detail`, `create`, `update`, `delete`
- [ ] Add filters — category, brand, price range, search
- [ ] Add pagination
- [ ] Build categories API

### Testing
- [ ] Test all endpoints with Postman / Thunder Client
- [ ] Setup Swagger documentation

---

## WEEK 3 — CUSTOMER STOREFRONT

### Frontend — Public Pages
- [ ] Build homepage (hero, featured products, categories)
- [ ] Build product listing page (with filters and search)
- [ ] Build product detail page
- [ ] Build navigation header
- [ ] Build footer
- [ ] Make responsive (mobile-first)

### Integration
- [ ] Connect to products API
- [ ] Setup TanStack Query for data fetching
- [ ] Add loading states
- [ ] Add error handling

---

## WEEK 4 — SHOPPING CART + CHECKOUT

### Frontend — Cart
- [ ] Build cart state management (Zustand)
- [ ] Build add to cart functionality
- [ ] Build cart page — list items, update quantities, remove items
- [ ] Add cart localStorage persistence
- [ ] Build cart calculations — subtotal, delivery fee, total

### Backend — Orders
- [ ] Build orders API (`create order`)
- [ ] Add delivery location zones with fees
- [ ] Generate OTP for phone verification
- [ ] Integrate Africa's Talking SMS API
- [ ] Build OTP verification endpoint

### Frontend — Checkout
- [ ] Build checkout form (delivery details, phone)
- [ ] Add phone number validation (Kenya format)
- [ ] Build OTP input screen
- [ ] Build order confirmation page
- [ ] Add order status to user account

### Integration
- [ ] Connect checkout to orders API
- [ ] Test full COD flow end-to-end

---

## WEEK 5 — ADMIN DASHBOARD: ORDERS

### Backend
- [ ] Build admin orders API — list all, filter by status, search
- [ ] Add order detail endpoint
- [ ] Add update order status endpoint
- [ ] Add confirm order endpoint

### Frontend — Admin
- [ ] Build admin layout (sidebar, header)
- [ ] Build admin login page
- [ ] Add route protection (admin only)
- [ ] Build dashboard overview — stats: orders today, pending, revenue
- [ ] Build orders table (TanStack Table)
- [ ] Add filters — status, date range
- [ ] Add search — customer name, phone
- [ ] Build order detail modal
- [ ] Add status update dropdown
- [ ] Add confirm order button

---

## WEEK 6 — ADMIN DASHBOARD: PRODUCTS

### Backend
- [ ] Add image upload endpoint (Cloudinary integration)
- [ ] Add bulk product upload (CSV)

### Frontend — Admin
- [ ] Build products table (TanStack Table)
- [ ] Add search and filters
- [ ] Build add product form (with image upload)
- [ ] Build edit product form
- [ ] Add delete product confirmation
- [ ] Build category management page
- [ ] Add stock level indicators
- [ ] Add low stock alerts

---

## WEEK 7 — CATALOGUE BUILDER

### Backend
- [ ] Build catalogues API — create, save, list
- [ ] Build catalogue items API
- [ ] Setup Puppeteer for PDF generation
- [ ] Create branded PDF template
- [ ] Add Excel export functionality
- [ ] Add email catalogue endpoint

### Frontend — Customer
- [ ] Build "Add to Catalogue" button on products
- [ ] Build catalogue sidebar widget
- [ ] Build catalogue management page (for logged-in users)
- [ ] Add customize catalogue form — project name, company
- [ ] Build export options — PDF, Excel, email
- [ ] Add shareable link generation

---

## WEEK 8 — PRICE SCRAPING: MANUAL

### Backend
- [ ] Build competitor products API
- [ ] Add manual price entry endpoints
- [ ] Build price history tracking

### Frontend — Admin
- [ ] Build competitor price management page
- [ ] Add form to add / update competitor prices
- [ ] Build price history view

### Frontend — Customer
- [ ] Build price comparison widget on product pages
- [ ] Show "You save KSh X" badge
- [ ] Display competitor prices list

---

## WEEK 9–10 — AUTOMATED SCRAPING

### Python Service
- [ ] Setup Python FastAPI service (separate from NestJS)
- [ ] Install Playwright
- [ ] Build scraper for Jumia
- [ ] Build scraper for Kilimall
- [ ] Build scraper for Avechi
- [ ] Build scraper for Saruk
- [ ] Add product matching logic (fuzzy match by SKU / name)
- [ ] Setup Celery + Redis for scheduling
- [ ] Schedule scrapers to run every 12 hours

### Integration
- [ ] Connect Python service to PostgreSQL
- [ ] Store scraped prices in `competitor_products` table
- [ ] Update `price_history` table

### Backend — Auto Pricing
- [ ] Build pricing rules API
- [ ] Build auto-pricing service (runs after scraping)
- [ ] Add pricing rule: "Set price 5–10% below lowest competitor"
- [ ] Add minimum margin protection
- [ ] Send email alert if competitor price drops below cost

### Frontend — Admin
- [ ] Build scraper monitoring dashboard
- [ ] Show last scrape time per competitor
- [ ] Show scraping errors / failures
- [ ] Add manual trigger scrape button
- [ ] Build pricing rules configuration page
- [ ] Add price change alerts view

---

## WEEK 11 — TESTING + DEPLOYMENT

### Testing
- [ ] Test all customer flows — browse, cart, checkout, OTP
- [ ] Test all admin flows — orders, products, prices
- [ ] Test on mobile devices (Android, iOS)
- [ ] Test with real Kenya phone numbers (OTP)
- [ ] Load test with 100 concurrent users
- [ ] Fix critical bugs

### Performance
- [ ] Add database indexes — `products.sku`, `orders.status`, `users.email`
- [ ] Setup Redis caching for product listings
- [ ] Optimize images (Cloudinary auto-optimization)
- [ ] Enable code splitting
- [ ] Add lazy loading for images

---

## TIER SUMMARY

| Week | Tier | Focus |
|------|------|-------|
| 1 | Foundation | Project setup, DB schema, seed data |
| 2 | Core API | Auth, products, categories |
| 3 | Storefront | Public pages, product browsing |
| 4 | Transactions | Cart, checkout, COD + OTP |
| 5 | Admin — Orders | Order management dashboard |
| 6 | Admin — Products | Product & inventory management |
| 7 | Catalogue | PDF/Excel export, shareable links |
| 8 | Pricing (Manual) | Competitor price entry & comparison |
| 9–10 | Pricing (Auto) | Scrapers, scheduling, auto-pricing rules |
| 11 | Ship | Testing, perf, deployment |

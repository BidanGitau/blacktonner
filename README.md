# Blacktoner

Blacktoner is a full-stack ecommerce and admin platform for selling toner, printers, laptops, accessories, and related office tech. The repo is organized as a JavaScript monorepo with a React Router storefront and admin dashboard on the frontend, plus a NestJS + Prisma API backed by PostgreSQL.

## Deployment stack

This project is set up to work with:

- React Router web app deployed on Vercel
- NestJS API deployed on Railway
- PostgreSQL hosted on Neon

## What is in the project

- Public storefront for browsing products, categories, blog posts, cart, checkout, catalogue requests, and order confirmation.
- Admin dashboard for managing products, categories, orders, posts, and pricing-related workflows.
- NestJS API with modules for auth, products, categories, orders, uploads, and posts.
- Prisma schema and seed script for bootstrapping a working development database.

## Monorepo structure

```text
.
├── apps/api   # NestJS API + Prisma + PostgreSQL
├── apps/web   # React Router web app and admin UI
├── package.json
└── README.md
```

## Tech stack

- Frontend: React 19, React Router 7, Vite, Tailwind CSS 4, TanStack Query, Zustand
- Backend: NestJS 10, Fastify
- Database: PostgreSQL
- ORM: Prisma 7
- Package manager: npm workspaces

## Prerequisites

Make sure you have these installed before setup:

- Node.js 20+
- npm 10+
- PostgreSQL 14+ running locally or remotely

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create an env file for the API at `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blacktoner?schema=public"
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Optional frontend env file at `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Notes:

- `VITE_API_URL` is optional for local development because the Vite dev server already proxies `/api` to `http://localhost:3001`.
- `PORT` defaults to `3001` if it is not set.
- `FRONTEND_URL` controls allowed CORS origins for the API. You can provide multiple origins as a comma-separated list.

### 3. Create the database

Create a PostgreSQL database named `blacktoner`, or update `DATABASE_URL` to point to an existing database.

### 4. Run Prisma migrations

```bash
npm run prisma:migrate --workspace=apps/api
```

### 5. Seed development data

```bash
npm run prisma:seed --workspace=apps/api
```

The seed adds:

- an admin user
- product categories
- sample inventory and product data

Default seeded admin account:

- Email: `admin@blacktoner.co.ke`
- Password: `admin123`

## Running the project

### Run both apps together

```bash
npm run dev:all
```

### Run only the web app

```bash
npm run dev
```

Available at:

- Web: `http://localhost:5173`

### Run only the API

```bash
npm run dev:api
```

Available at:

- API base URL: `http://localhost:3001/api`

## Useful commands

```bash
# Root
npm run dev
npm run dev:api
npm run dev:all
npm run build
npm run build:api

# API workspace
npm run prisma:generate --workspace=apps/api
npm run prisma:migrate --workspace=apps/api
npm run prisma:studio --workspace=apps/api
npm run prisma:seed --workspace=apps/api
npm run typecheck --workspace=apps/api

# Web workspace
npm run typecheck --workspace=apps/web
```

## Main routes

### Public web routes

- `/`
- `/products`
- `/products/:slug`
- `/cart`
- `/checkout`
- `/checkout/otp`
- `/order-confirmed/:id`
- `/search`
- `/catalogue`
- `/about`
- `/blog`
- `/blog/:slug`
- `/login`
- `/register`

### Admin routes

- `/admin`
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/categories`
- `/admin/prices`
- `/admin/scraper`
- `/admin/posts`
- `/admin/posts/new`
- `/admin/posts/:id/edit`

## API overview

The API runs with a global `/api` prefix, so routes are served under `http://localhost:3001/api`.

Current feature areas include:

- `POST /api/auth/login`
- `GET|POST|PATCH|DELETE /api/products`
- `POST /api/products/import`
- `GET|POST|PATCH|DELETE /api/categories`
- `GET /api/orders`
- `GET /api/orders/stats`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `POST /api/orders/:id/confirm`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET|POST|PATCH|DELETE /api/admin/posts`

## Data model highlights

The Prisma schema currently includes:

- users with roles such as `customer`, `admin`, `sales`, and `technician`
- product categories and products
- orders and order items
- saved catalogues and catalogue items
- competitor pricing and price history
- blog posts with draft and published states

## Build

Build the web app:

```bash
npm run build
```

Build the API:

```bash
npm run build:api
```

## Production deployment

### Vercel web app

Set this environment variable in Vercel:

```env
VITE_API_URL=https://your-railway-api.up.railway.app/api
```

### Railway API

Set these environment variables in Railway:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
PORT=3001
FRONTEND_URL=https://your-vercel-app.vercel.app
```

If you use a custom domain on Vercel, set `FRONTEND_URL` to that domain instead. For preview and production domains, you can use a comma-separated value such as:

```env
FRONTEND_URL=https://your-app.vercel.app,https://your-custom-domain.com
```

### Neon database

- Create a Neon project and database.
- Copy the Neon connection string into `DATABASE_URL` on Railway.
- Run Prisma migrations against the Neon database before first use.

Typical flow:

```bash
npm run prisma:migrate --workspace=apps/api
```

## Notes

- The web app uses SSR with React Router.
- The API uses `FRONTEND_URL` for CORS and falls back to `http://localhost:5173` locally.
- The repo currently includes a starter `apps/web/README.md` from the original React Router template; the root README is the main project guide.

# ShopSphere — Modern E-commerce Store

A full-stack e-commerce app built with React, Tailwind CSS, and Supabase
(PostgreSQL + Auth + Storage).

## 1. Create your Supabase project

1. Go to supabase.com → New project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. In **SQL Editor**, paste the entire contents of `supabase/schema.sql` and run it.
   This creates all tables, Row Level Security policies, and seeds 7 categories
   and 24 sample products.
4. (Optional, for image uploads from the admin panel) In **Storage**, create a
   new **public** bucket named `product-images`.

## 2. Create your first admin account

The app has no hardcoded admin credentials. To make yourself an admin:

1. Register a normal account in the app (Register page).
2. In Supabase → **Table Editor → profiles**, find your row and change
   `role` from `customer` to `admin`.
3. Log out and back in — the "Admin Dashboard" link now appears in your
   account menu, and `/admin` becomes accessible.

## 3. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Never commit `.env` or expose your Supabase **service role** key in
frontend code — only the anon key belongs here, and Row Level Security
is what keeps data safe.

## 4. Run it

```
npm install
npm run dev
```

Build for production:

```
npm run build
```

This outputs a static `dist/` folder — deploy it to Netlify, Vercel, or
any static host. Set the two environment variables above in your host's
dashboard as well.

## Notes on scope

- Payments are simulated ("Cash on Delivery" or "Demo Online Payment").
  No real payment gateway is wired up — see the checkout page's comments
  if you want to add Razorpay/Stripe later.
- Reviews can only be left by users who have an order containing that
  product (enforced by a Row Level Security policy), but there's no
  dedicated "write a review" UI yet — add a small form on the product
  page if your internship demo needs one.
- The category filter on `/products` does client-side filtering after
  the query for correctness (Supabase's `.eq()` on a joined table filters
  the join, not the outer rows), so result counts stay accurate; genuinely
  large catalogs would want a `category_id` column-based query instead.

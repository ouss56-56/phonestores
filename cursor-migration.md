# Lumina Admin Suite — Cursor Migration Guide

> **Purpose:** Full codebase overview and step-by-step instructions to disconnect all Lovable.dev dependencies and run this project in a local development environment.

---

## 1. Codebase Overview

### What Is This Project?

**Lumina Admin Suite** is an **e-commerce admin panel and storefront** for a phone & accessories shop ("Le Bon Coin" style). It's built as a **single-page application** with an admin dashboard, product catalog, shopping cart, checkout flow, and a repair/maintenance tracking system.

The UI language is **French**.

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Vite](https://vitejs.dev/) 5 + [React](https://react.dev/) 18 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 + CSS variables |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (50 components in `src/components/ui/`) |
| **Routing** | React Router DOM 6 |
| **State/Data** | TanStack React Query 5 |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | [Supabase](https://supabase.com/) (Auth, Postgres DB, Edge Functions) |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Notifications** | Sonner + Radix Toast |

### Project Structure

```
lumina-admin-suite-main/
├── index.html                    # SPA entry point (has Lovable branding — to remove)
├── package.json                  # Dependencies (has lovable-tagger — to remove)
├── vite.config.ts                # Vite config (imports lovable-tagger — to clean)
├── tailwind.config.ts            # Tailwind + shadcn/ui theme tokens
├── components.json               # shadcn/ui configuration
├── tsconfig.json                 # TypeScript config (uses @ path alias)
├── eslint.config.js              # ESLint flat config
├── postcss.config.js             # PostCSS (autoprefixer + tailwindcss)
├── vitest.config.ts              # Test runner config
├── .env                          # Supabase credentials (KEEP — your own project)
├── .gitignore
├── README.md                     # Lovable boilerplate README (to replace)
│
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component — routing + providers
│   ├── index.css                 # Global styles + CSS variables + Tailwind directives
│   ├── App.css                   # Additional app styles
│   ├── vite-env.d.ts             # Vite type declarations
│   │
│   ├── pages/
│   │   ├── Index.tsx             # Storefront homepage
│   │   ├── Admin.tsx             # Admin dashboard (products, orders, repairs, POS)
│   │   ├── AdminLogin.tsx        # Admin authentication page
│   │   ├── Checkout.tsx          # Shopping cart checkout
│   │   └── NotFound.tsx          # 404 page
│   │
│   ├── components/
│   │   ├── NavLink.tsx           # Navigation link component
│   │   ├── store/                # Storefront components
│   │   │   ├── CartDrawer.tsx    # Shopping cart slide-out drawer
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   └── ReviewsSection.tsx
│   │   └── ui/                   # 50 shadcn/ui primitives (accordion → tooltip)
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx           # Supabase auth context (login, admin role check)
│   │   ├── useCart.tsx            # Shopping cart context
│   │   ├── use-mobile.tsx        # Mobile breakpoint detection
│   │   └── use-toast.ts          # Toast notification hook
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client (reads from .env)
│   │       └── types.ts          # Auto-generated database types
│   │
│   ├── lib/
│   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│   │
│   └── test/
│       ├── setup.ts              # Vitest setup
│       └── example.test.ts       # Example test
│
└── supabase/
    ├── config.toml               # Supabase project ID
    ├── migrations/
    │   ├── ...initial.sql        # Full schema: roles, profiles, categories, products,
    │   │                         #   IMEI records, orders, order_items, repairs,
    │   │                         #   inventory_snapshots + RLS policies + triggers
    │   └── ...fix.sql            # search_path fix for trigger functions
    └── functions/
        └── setup-admin/
            └── index.ts          # Edge function: creates admin user + seeds data
```

### Database Schema (Supabase Postgres)

| Table | Purpose |
|---|---|
| `user_roles` | Maps users → roles (`admin`, `user`) with RLS |
| `profiles` | User profiles (auto-created on signup) |
| `categories` | Product categories (phone, accessory, spare_part) |
| `products` | Full product catalog with SKU auto-generation |
| `imei_records` | IMEI tracking per device (in_stock, sold, returned, etc.) |
| `orders` | Orders with auto-generated order numbers (`LBC-YYYYMMDD-XXXX`) |
| `order_items` | Line items per order, with optional IMEI link |
| `repairs` | Repair/maintenance tickets with status workflow |
| `inventory_snapshots` | Periodic inventory capital/count snapshots |

### Authentication Flow

- Supabase Auth with email/password
- Admin role checked via `user_roles` table
- Protected routes redirect to `/admin/login` if not authenticated
- `setup-admin` edge function creates the initial admin account

### Key Environment Variables (`.env`)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

---

## 2. Lovable.dev Dependencies — Complete Inventory

Here is **every** Lovable-specific reference in the project:

| # | File | What to Change |
|---|---|---|
| 1 | `package.json` (line 83) | Remove `"lovable-tagger": "^1.1.13"` from `devDependencies` |
| 2 | `vite.config.ts` (line 4) | Remove `import { componentTagger } from "lovable-tagger"` |
| 3 | `vite.config.ts` (line 15) | Remove `mode === "development" && componentTagger()` from plugins |
| 4 | `index.html` (line 7) | Change `<title>` from "Lovable App" to your app name |
| 5 | `index.html` (line 8) | Update `<meta description>` from "Lovable Generated Project" |
| 6 | `index.html` (line 9) | Update `<meta author>` from "Lovable" |
| 7 | `index.html` (lines 12-13) | Update `og:title` and `og:description` |
| 8 | `index.html` (line 15) | Remove or replace `og:image` (points to lovable.dev) |
| 9 | `index.html` (lines 18-19) | Update `twitter:site` and replace `twitter:image` |
| 10 | `README.md` | Entire file is Lovable boilerplate — replace completely |
| 11 | `bun.lockb` | Delete (Bun lockfile from Lovable's build environment) |

> **Good news:** There are **zero** Lovable references in any application source code (`src/`). The actual app logic, components, hooks, and integrations are all clean.

---

## 3. Step-by-Step Migration Instructions

### Step 1: Remove `lovable-tagger` from `package.json`

Open `package.json` and remove this line from `devDependencies`:

```diff
  "devDependencies": {
    ...
-   "lovable-tagger": "^1.1.13",
    ...
  }
```

### Step 2: Clean `vite.config.ts`

Replace the file contents with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Changes:** Removed the `lovable-tagger` import, removed `componentTagger()` from plugins, and simplified the export (no longer needs the `({ mode }) =>` wrapper).

### Step 3: Update `index.html` meta tags

Replace the Lovable branding with your own:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lumina Admin Suite</title>
    <meta name="description" content="E-commerce admin panel and storefront" />
    <meta name="author" content="Your Name" />

    <meta property="og:title" content="Lumina Admin Suite" />
    <meta property="og:description" content="E-commerce admin panel and storefront" />
    <meta property="og:type" content="website" />
    <!-- Replace with your own OG image or remove -->
    <!-- <meta property="og:image" content="/og-image.png" /> -->

    <meta name="twitter:card" content="summary_large_image" />
    <!-- <meta name="twitter:site" content="@YourHandle" /> -->
    <!-- <meta name="twitter:image" content="/og-image.png" /> -->
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 4: Delete `bun.lockb`

This is a Bun lockfile from Lovable's build environment. You'll use npm instead:

```bash
del bun.lockb
```

### Step 5: Delete `node_modules` and reinstall

```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

This generates a fresh `package-lock.json` without any `lovable-tagger` references.

### Step 6: Replace `README.md`

Replace the entire Lovable boilerplate README. You can use this as a starting point:

```md
# Lumina Admin Suite

E-commerce admin panel and storefront for a phone & accessories shop.

## Tech Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- TanStack React Query
- React Router DOM

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`
5. Open http://localhost:8080

### Environment Variables
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 8080 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
```

### Step 7: Add `.env` to `.gitignore` (if not already)

Your `.env` file contains Supabase credentials. Make sure `.gitignore` includes it:

```
# Add to .gitignore if not present
.env
.env.local
.env.*.local
```

### Step 8: Verify the build

```bash
npm run dev
```

The app should start on `http://localhost:8080`. Verify:
- ✅ Homepage loads (storefront with products)
- ✅ `/admin/login` renders the login page
- ✅ No console errors referencing `lovable-tagger`
- ✅ `npm run build` completes without errors

---

## 4. Supabase Setup (If Starting Fresh)

If you need to connect to a **new** Supabase project:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/` via the Supabase SQL Editor (in order)
3. Deploy the `setup-admin` edge function or run its SQL manually to create the admin user
4. Update `.env` with your new project's URL, anon key, and project ID

### Default Admin Credentials (from `setup-admin` edge function)

| Field | Value |
|---|---|
| Email | `admin@gmail.com` |
| Password | `00000000` |

> ⚠️ **Change these immediately in production!**

---

## 5. Summary Checklist

- [ ] Remove `lovable-tagger` from `package.json`
- [ ] Clean `vite.config.ts` (remove import + plugin)
- [ ] Update `index.html` (title, meta tags, OG images)
- [ ] Delete `bun.lockb`
- [ ] Delete `node_modules` + `package-lock.json`, then `npm install`
- [ ] Replace `README.md`
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Run `npm run dev` — verify app starts clean
- [ ] Run `npm run build` — verify production build succeeds

# MisiMarket — Restaurant Price Intelligence Platform

> **Stop vendor overcharging. Protect your margins. Forecast before it costs you.**

MisiMarket is a full-stack SaaS dashboard built for independent restaurant owners. It gives operators the same data-driven purchasing power that large chain restaurants have — without the enterprise price tag.

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Feature Modules](#feature-modules)
3. [Current State (MVP)](#current-state-mvp)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Roadmap to Full Production App](#roadmap-to-full-production-app)
7. [Database Schema Templates](#database-schema-templates)
8. [API Route Templates](#api-route-templates)
9. [Authentication Template](#authentication-template)
10. [Environment Variables](#environment-variables)
11. [Deployment](#deployment)
12. [Getting Started (Local Dev)](#getting-started-local-dev)

---

## Product Vision

An independent restaurant spends 28–35% of revenue on food. The difference between profit and loss is often just a few percentage points on ingredient costs. MisiMarket solves this by:

- **Comparing supplier prices side-by-side** so you always buy at the lowest price
- **Scanning invoices automatically** to catch price creep before it compounds
- **Monitoring dish profitability in real time** so a menu price stays healthy as ingredient costs move
- **Forecasting ingredient spikes** using market signals so you can stock up before prices rise

The end product is a white-label B2B SaaS tool sold on a per-restaurant subscription (e.g. \$49–\$149/month), with the operator logging in to see their restaurant's live data.

---

## Feature Modules

### 1. Shop-Hop — Supplier Price Comparison (`/price-comparison`)
- Catalogue of ingredients with prices from every supplier the restaurant uses
- Filter by category (Grain, Protein, Dairy, Spice, etc.)
- Search by ingredient name
- Price normalized to per-oz so different unit sizes are always comparable
- "BEST" badge on cheapest supplier per ingredient
- Supplier type tagging: Local vs. National distributor

**End goal:** Connect to live supplier APIs (Sysco, GFS, etc.) or allow manual price entry with email/SMS reminders when a better price is found.

---

### 2. Price Creep Detector — Invoice Scanner (`/invoice-scanner`)
- Upload a PDF or image of a supplier invoice
- OCR extracts line items automatically
- Each item is compared against the last recorded price
- Overcharges are flagged in red with the exact dollar overage
- Total overcharge summary shown at top

**End goal:** Integrate Google Document AI or AWS Textract. Store every invoice permanently. Send an alert email/SMS to the owner when overcharge exceeds a threshold (e.g. > \$10).

---

### 3. Biryani Guard — Dish Profitability (`/dish-guard`)
- Every menu dish shows its exact ingredient cost (normalized to oz portions)
- Live margin calculator: edit the menu price and the margin updates instantly
- Dishes below target margin (default 30%) are flagged with a suggested price increase
- Ingredient cost breakdown table per dish

**End goal:** Sync with POS system (Square, Toast, Clover) to pull actual sales volume. Weight the profitability analysis by how many covers sell per day.

---

### 4. Predictive Stocking — Forecasts (`/forecasts`)
- Ingredient spike forecasts with urgency level (low / medium / high)
- Reasoning shown per forecast (e.g. "drought in Punjab driving basmati prices up")
- Recommended stock-up window in months
- Substitute ingredient suggestions with savings percentage

**End goal:** Integrate commodity price feeds (USDA, FAO, Bloomberg) and an ML model (fine-tuned LLM or time-series model) to generate weekly forecast reports delivered by email.

---

## Current State (MVP)

| Module | UI | Data | Backend | Auth |
|---|---|---|---|---|
| Dashboard | ✅ Complete | Mock | ❌ | ❌ |
| Price Comparison | ✅ Complete | Mock | ❌ | ❌ |
| Invoice Scanner | ✅ Complete | Mock | ❌ (OCR not wired) | ❌ |
| Dish Guard | ✅ Complete | Mock | ❌ | ❌ |
| Forecasts | ✅ Complete | Mock | ❌ | ❌ |
| Auth / Login | ❌ | — | ❌ | ❌ |
| Real DB | ❌ | — | ❌ | — |
| Live Supplier Data | ❌ | — | ❌ | — |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Font | Geist (Google Fonts) |
| Runtime | Node.js 20+ |
| **Planned: Database** | PostgreSQL (via Supabase or Neon) |
| **Planned: ORM** | Prisma |
| **Planned: Auth** | NextAuth.js v5 (Auth.js) |
| **Planned: File Storage** | Supabase Storage or AWS S3 |
| **Planned: OCR** | Google Document AI |
| **Planned: Email** | Resend |
| **Planned: Deployment** | Vercel |

---

## Project Structure

```
app/
├── layout.tsx                  # Root layout (Nav, fonts, global styles)
├── page.tsx                    # Dashboard — KPI overview
├── globals.css                 # Design tokens + utility classes
│
├── price-comparison/
│   └── page.tsx                # Shop-Hop supplier comparison
│
├── invoice-scanner/
│   └── page.tsx                # Price Creep Detector
│
├── dish-guard/
│   └── page.tsx                # Biryani Guard profitability
│
├── forecasts/
│   └── page.tsx                # Predictive Stocking forecasts
│
├── components/
│   └── Nav.tsx                 # Top navigation bar
│
├── lib/
│   └── data.ts                 # Mock data, types, helper functions
│                               # ← Replace with DB queries when ready
│
│   # ADD THESE:
├── api/
│   ├── scan-invoice/
│   │   └── route.ts            # POST: upload + OCR invoice
│   ├── ingredients/
│   │   └── route.ts            # GET: ingredient catalogue
│   ├── invoices/
│   │   └── route.ts            # GET/POST: invoice history
│   └── forecasts/
│       └── route.ts            # GET: forecast feed
│
└── (auth)/
    ├── login/
    │   └── page.tsx            # Login page
    └── register/
        └── page.tsx            # Register / onboarding
```

---

## Roadmap to Full Production App

### Phase 1 — Database & Auth (Week 1–2)
- [ ] Set up Supabase (or Neon) PostgreSQL database
- [ ] Install Prisma: `npm install prisma @prisma/client`
- [ ] Define schema (see [Database Schema Templates](#database-schema-templates))
- [ ] Install NextAuth.js: `npm install next-auth@beta`
- [ ] Add login/register pages
- [ ] Wrap all pages in session guard (redirect to login if no session)
- [ ] Seed database with the mock data from `app/lib/data.ts`

### Phase 2 — Real API Routes (Week 2–3)
- [ ] Replace `app/lib/data.ts` mock functions with Prisma DB queries
- [ ] Build `GET /api/ingredients` — returns ingredient catalogue for logged-in restaurant
- [ ] Build `POST /api/invoices` — saves a new invoice scan result
- [ ] Build `GET /api/dishes` — returns dish profitability data
- [ ] Build `GET /api/forecasts` — returns forecast feed

### Phase 3 — Invoice OCR (Week 3–4)
- [ ] Sign up for Google Document AI (or AWS Textract)
- [ ] Build `POST /api/scan-invoice` — accepts file upload, calls OCR, returns line items
- [ ] Wire the upload zone in `/invoice-scanner` to call this real endpoint
- [ ] Store every scan in DB with timestamp

### Phase 4 — Alerts & Notifications (Week 4–5)
- [ ] Install Resend: `npm install resend`
- [ ] Send email alert when invoice overcharge > configurable threshold
- [ ] Send weekly forecast digest email
- [ ] Add in-app notification bell in the Nav

### Phase 5 — POS Integration (Week 5–6)
- [ ] Build Square or Toast webhook receiver
- [ ] Pull daily sales volume per dish
- [ ] Weight dish profitability analysis by sales volume

### Phase 6 — Multi-tenant SaaS (Week 6–8)
- [ ] Add `Restaurant` model — each user belongs to a restaurant
- [ ] Scope all data queries by `restaurantId`
- [ ] Add subscription billing with Stripe
- [ ] Add admin dashboard for MisiMarket operator

---

## Database Schema Templates

Create `prisma/schema.prisma` with the following:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Restaurant {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  users     User[]
  ingredients Ingredient[]
  dishes    Dish[]
  invoices  Invoice[]
  forecasts Forecast[]
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  name         String?
  passwordHash String
  role         Role       @default(OWNER)
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  restaurantId String
  createdAt    DateTime   @default(now())
}

enum Role {
  OWNER
  MANAGER
  VIEWER
}

model Ingredient {
  id           String          @id @default(cuid())
  name         String
  category     String
  restaurant   Restaurant      @relation(fields: [restaurantId], references: [id])
  restaurantId String
  suppliers    SupplierPrice[]
  createdAt    DateTime        @default(now())
}

model SupplierPrice {
  id           String     @id @default(cuid())
  supplier     String
  type         String     // "national" | "local"
  price        Float
  unit         Float
  unitType     String     // "kg" | "lb" | "oz" | "case" | "each"
  pricePerOz   Float
  inStock      Boolean    @default(true)
  lastUpdated  DateTime   @default(now())
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
  ingredientId String
}

model Dish {
  id           String          @id @default(cuid())
  name         String
  menuPrice    Float
  restaurant   Restaurant      @relation(fields: [restaurantId], references: [id])
  restaurantId String
  ingredients  DishIngredient[]
  createdAt    DateTime        @default(now())
}

model DishIngredient {
  id           String @id @default(cuid())
  name         String
  quantityOz   Float
  ingredientId String
  dish         Dish   @relation(fields: [dishId], references: [id])
  dishId       String
}

model Invoice {
  id           String        @id @default(cuid())
  supplier     String
  uploadedAt   DateTime      @default(now())
  restaurant   Restaurant    @relation(fields: [restaurantId], references: [id])
  restaurantId String
  lineItems    InvoiceItem[]
  totalOvercharge Float      @default(0)
}

model InvoiceItem {
  id            String  @id @default(cuid())
  item          String
  previousPrice Float
  currentPrice  Float
  quantity      Float
  unit          String
  diff          Float
  invoice       Invoice @relation(fields: [invoiceId], references: [id])
  invoiceId     String
}

model Forecast {
  id                     String     @id @default(cuid())
  ingredient             String
  expectedRisePct        Float
  reason                 String
  recommendedStockMonths Int
  urgency                Urgency
  restaurant             Restaurant @relation(fields: [restaurantId], references: [id])
  restaurantId           String
  createdAt              DateTime   @default(now())
}

enum Urgency {
  LOW
  MEDIUM
  HIGH
}
```

---

## API Route Templates

### `app/api/ingredients/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ingredients = await prisma.ingredient.findMany({
    where: { restaurantId: session.user.restaurantId },
    include: { suppliers: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(ingredients);
}
```

### `app/api/scan-invoice/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // TODO: Upload file to storage (Supabase Storage / S3)
  // const fileUrl = await uploadToStorage(file);

  // TODO: Send to OCR service
  // const lineItems = await callGoogleDocumentAI(fileUrl);

  // For now, return mock data:
  const lineItems = [
    { item: "Basmati Rice 50lb", previousPrice: 42.0, currentPrice: 44.5, quantity: 2, unit: "bag", diff: 2.5 },
  ];

  const totalOvercharge = lineItems
    .filter((i) => i.diff > 0)
    .reduce((s, i) => s + i.diff * i.quantity, 0);

  const invoice = await prisma.invoice.create({
    data: {
      supplier: "Sysco",
      restaurantId: session.user.restaurantId,
      totalOvercharge,
      lineItems: { create: lineItems },
    },
    include: { lineItems: true },
  });

  return NextResponse.json(invoice);
}
```

### `app/lib/prisma.ts`
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Authentication Template

### `app/lib/auth.ts`
```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { restaurant: true },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          restaurantId: user.restaurantId,
          restaurantName: user.restaurant.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.restaurantId = user.restaurantId;
        token.restaurantName = user.restaurantName;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.restaurantId = token.restaurantId;
      session.user.restaurantName = token.restaurantName;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
```

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this to git):

```env
# Database (get from Supabase or Neon dashboard)
DATABASE_URL="postgresql://user:password@host:5432/misimarket"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google Document AI (for invoice OCR)
GOOGLE_CLOUD_PROJECT_ID=""
GOOGLE_CLOUD_PROCESSOR_ID=""
GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"

# File Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# Email (Resend)
RESEND_API_KEY=""
ALERT_FROM_EMAIL="alerts@misimarket.com"

# Stripe (for billing)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

Add `.env.local` and `service-account.json` to `.gitignore`.

---

## Deployment

### Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Set build command: `npm run build`
5. Set output directory: `.next`
6. Every push to `main` auto-deploys

### Database Migration on Deploy
```bash
# Run once after connecting DATABASE_URL:
npx prisma migrate deploy
npx prisma db seed   # optional: seed with your restaurant's real data
```

---

## Getting Started (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local
# Fill in your values

# 3. Run database migrations (after setting up DB)
npx prisma migrate dev --name init

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## License

Private — All rights reserved. MisiMarket, 2026.
price comparison

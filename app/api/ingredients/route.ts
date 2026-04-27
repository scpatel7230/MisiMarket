// =============================================================================
// FILE: app/api/ingredients/route.ts
// PURPOSE:
//   The data source for the Shop-Hop (price comparison) page.
//   Returns all ingredients and their supplier prices for the logged-in
//   restaurant. Also allows updating a supplier price when you manually
//   enter a new price from a quote or invoice.
//
// ENDPOINTS:
//   GET  /api/ingredients
//     — Returns full ingredient catalogue with all suppliers.
//     — Suppliers are sorted cheapest first (by pricePerOz).
//     — Scoped to the logged-in restaurant (no cross-tenant data leakage).
//
//   PATCH /api/ingredients
//     — Updates a specific supplier's price or stock status.
//     — Body: { supplierId: string, price?: number, inStock?: boolean }
//     — Use this when a supplier sends you a new price quote.
//
// TO ACTIVATE:
//   Step 1: Complete the Prisma + auth setup (see app/lib/prisma.ts and auth.ts)
//   Step 2: In app/price-comparison/page.tsx, replace the static import of
//           INGREDIENTS from data.ts with a fetch("GET", "/api/ingredients")
//           call inside a useEffect (or switch to a Server Component).
//   Step 3: Auth is already wired — if no session, returns 401.
//
// FUTURE ENHANCEMENTS:
//   — POST /api/ingredients: add a new ingredient to the catalogue
//   — DELETE /api/ingredients/[id]: remove an ingredient
//   — Connect to Sysco/GFS supplier APIs to auto-update prices daily
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurantId = (session.user as any).restaurantId as string;

  const ingredients = await prisma.ingredient.findMany({
    where: { restaurantId },
    include: { suppliers: { orderBy: { pricePerOz: "asc" } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(ingredients);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { supplierId, price, inStock } = body as {
    supplierId: string;
    price?: number;
    inStock?: boolean;
  };

  if (!supplierId) {
    return NextResponse.json({ error: "supplierId required" }, { status: 400 });
  }

  const updated = await prisma.supplierPrice.update({
    where: { id: supplierId },
    data: {
      ...(price !== undefined && { price, pricePerOz: price }),
      ...(inStock !== undefined && { inStock }),
      lastUpdated: new Date(),
    },
  });

  return NextResponse.json(updated);
}

// =============================================================================
// FILE: app/api/dishes/route.ts
// PURPOSE:
//   Provides live dish profitability data for the Biryani Guard feature.
//   Fetches each dish from the DB and calculates the ingredient cost in
//   real time using the cheapest available supplier price — so if a supplier
//   price changes, the margin automatically updates without any manual work.
//
// ENDPOINTS:
//   GET  /api/dishes
//     — Returns all dishes for the restaurant.
//     — Each dish includes: ingredients with costs, total ingredientCost,
//       and calculated margin percentage.
//     — Margin = ((menuPrice - ingredientCost) / menuPrice) * 100
//     — The cheapest supplier per ingredient is used for the cost calculation.
//
//   PATCH /api/dishes
//     — Body: { dishId: string, menuPrice: number }
//     — Updates the menu price for a dish.
//     — Use this when you adjust a menu item's price based on the
//       suggested price shown in the Biryani Guard page.
//
// TO ACTIVATE:
//   Step 1: Complete Prisma + auth setup
//   Step 2: In app/dish-guard/page.tsx, replace the static DISHES import
//           with a useEffect that fetches GET /api/dishes
//   Step 3: Wire the menu price input's onChange to call PATCH /api/dishes
//           with a debounce (wait ~500ms after the user stops typing)
//
// FUTURE — POS Integration:
//   Add a "dailySales" field to the Dish model and pull it from Square/Toast
//   webhooks. Multiply margin by daily sales volume to show which dishes
//   are actually driving profit vs. which just look good on paper.
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

  const dishes = await prisma.dish.findMany({
    where: { restaurantId },
    include: {
      ingredients: {
        include: {
          ingredient: {
            include: {
              suppliers: { orderBy: { pricePerOz: "asc" }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate ingredient cost and margin for each dish
  const withMargins = dishes.map((dish) => {
    const ingredientCost = dish.ingredients.reduce((total, di) => {
      const cheapestPricePerOz = di.ingredient.suppliers[0]?.pricePerOz ?? 0;
      return total + cheapestPricePerOz * di.quantityOz;
    }, 0);

    const margin =
      dish.menuPrice > 0
        ? ((dish.menuPrice - ingredientCost) / dish.menuPrice) * 100
        : 0;

    return { ...dish, ingredientCost, margin };
  });

  return NextResponse.json(withMargins);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { dishId, menuPrice } = body as { dishId: string; menuPrice: number };

  if (!dishId || menuPrice === undefined) {
    return NextResponse.json({ error: "dishId and menuPrice required" }, { status: 400 });
  }

  const updated = await prisma.dish.update({
    where: { id: dishId },
    data: { menuPrice },
  });

  return NextResponse.json(updated);
}

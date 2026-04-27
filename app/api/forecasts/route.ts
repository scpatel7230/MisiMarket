// =============================================================================
// FILE: app/api/forecasts/route.ts
// PURPOSE:
//   Serves ingredient price spike forecasts for the Predictive Stocking page.
//   Forecasts tell the owner: "buy extra X now before the price goes up."
//
// ENDPOINTS:
//   GET  /api/forecasts
//     — Returns forecasts sorted by urgency (HIGH first) then by expected
//       rise percentage. Only returns forecasts for the logged-in restaurant.
//
//   POST /api/forecasts
//     — Creates a new forecast entry. Restricted to OWNER and MANAGER roles.
//     — Body: { ingredient, expectedRisePct, reason, recommendedStockMonths, urgency }
//     — Currently used for manual entry. Future: replaced by a cron job.
//
// TO ACTIVATE:
//   Step 1: Complete Prisma + auth setup
//   Step 2: In app/forecasts/page.tsx, replace the static FORECASTS import
//           with a useEffect that fetches GET /api/forecasts
//
// TO AUTOMATE FORECASTS (Phase 4+):
//   Option A — Commodity price API:
//     Sign up for a commodity data feed (e.g. USDA Agricultural Prices API — free,
//     or Bloomberg/Refinitiv for premium data). Create a cron route at
//     app/api/cron/generate-forecasts/route.ts that runs weekly, fetches
//     current commodity prices, compares to 6-week moving average, and
//     auto-creates Forecast records for any ingredient trending up >5%.
//
//   Option B — LLM-generated forecasts:
//     npm install openai
//     Call GPT-4 with a system prompt that gives it the last 8 weeks of
//     price history and asks it to return structured JSON forecasts.
//     This is easier to set up but less precise than real market data.
//
//   On Vercel, add to vercel.json:
//     { "crons": [{ "path": "/api/cron/generate-forecasts", "schedule": "0 8 * * 1" }] }
//     (runs every Monday at 8am UTC)
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

  const forecasts = await prisma.forecast.findMany({
    where: { restaurantId },
    orderBy: [
      { urgency: "desc" },
      { expectedRisePct: "desc" },
    ],
  });

  return NextResponse.json(forecasts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as string;
  if (role !== "OWNER" && role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const restaurantId = (session.user as any).restaurantId as string;
  const body = await req.json();

  const forecast = await prisma.forecast.create({
    data: {
      ingredient: body.ingredient,
      expectedRisePct: body.expectedRisePct,
      reason: body.reason,
      recommendedStockMonths: body.recommendedStockMonths,
      urgency: body.urgency,
      restaurantId,
    },
  });

  return NextResponse.json(forecast, { status: 201 });
}

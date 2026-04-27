// =============================================================================
// FILE: app/api/invoices/route.ts
// PURPOSE:
//   Stores and retrieves invoice scan history for the restaurant.
//   This is the data layer behind the Price Creep Detector feature.
//   Also triggers email alerts to the owner when an overcharge is detected.
//
// ENDPOINTS:
//   GET  /api/invoices
//     — Returns the 50 most recent invoices with all line items.
//     — Used to populate invoice history (future feature: invoice history page).
//
//   POST /api/invoices
//     — Body: { supplier: string, lineItems: [...] }
//     — Calculates the diff (currentPrice - previousPrice) for each item.
//     — Saves the invoice + all line items to the database.
//     — If total overcharge > $10 (configurable at top of file), automatically
//       sends an alert email to the restaurant owner via app/lib/email.ts.
//
// NOTE: For file-based invoice scanning (OCR), use POST /api/scan-invoice instead.
//       This route is for cases where line items are already extracted (e.g. from
//       a POS integration or manual entry).
//
// TO ACTIVATE:
//   Step 1: Complete Prisma + auth setup
//   Step 2: Complete email setup (app/lib/email.ts + RESEND_API_KEY in .env.local)
//   Step 3: In app/invoice-scanner/page.tsx, replace the mock setScanned(true)
//           with a real fetch("POST", "/api/invoices", { body: lineItems })
//   Step 4: Adjust OVERCHARGE_ALERT_THRESHOLD at the top of this file if needed
//
// SECURITY:
//   — All endpoints require a valid session (returns 401 if not logged in).
//   — All data is scoped to session.user.restaurantId (no cross-tenant access).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { sendOverchargeAlert } from "@/app/lib/email";

const OVERCHARGE_ALERT_THRESHOLD = 10; // USD — send email if overcharge exceeds this

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurantId = (session.user as any).restaurantId as string;

  const invoices = await prisma.invoice.findMany({
    where: { restaurantId },
    include: { lineItems: true },
    orderBy: { uploadedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurantId = (session.user as any).restaurantId as string;
  const body = await req.json();

  const { supplier, lineItems } = body as {
    supplier: string;
    lineItems: {
      item: string;
      previousPrice: number;
      currentPrice: number;
      quantity: number;
      unit: string;
    }[];
  };

  if (!supplier || !lineItems?.length) {
    return NextResponse.json({ error: "supplier and lineItems required" }, { status: 400 });
  }

  const itemsWithDiff = lineItems.map((i) => ({
    ...i,
    diff: i.currentPrice - i.previousPrice,
  }));

  const totalOvercharge = itemsWithDiff
    .filter((i) => i.diff > 0)
    .reduce((s, i) => s + i.diff * i.quantity, 0);

  const invoice = await prisma.invoice.create({
    data: {
      supplier,
      restaurantId,
      totalOvercharge,
      lineItems: { create: itemsWithDiff },
    },
    include: { lineItems: true },
  });

  // Send email alert if overcharge crosses threshold
  if (totalOvercharge > OVERCHARGE_ALERT_THRESHOLD) {
    const user = await prisma.user.findFirst({
      where: { restaurantId, role: "OWNER" },
      include: { restaurant: true },
    });
    if (user) {
      await sendOverchargeAlert({
        to: user.email,
        restaurantName: user.restaurant.name,
        supplier,
        totalOvercharge,
        items: itemsWithDiff,
      }).catch(console.error); // non-blocking
    }
  }

  return NextResponse.json(invoice, { status: 201 });
}

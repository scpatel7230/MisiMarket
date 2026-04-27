// =============================================================================
// FILE: app/api/scan-invoice/route.ts
// PURPOSE:
//   The full end-to-end invoice scanning pipeline. This is the most complex
//   route in the app — it handles file upload, OCR, price comparison, and
//   database persistence in a single request.
//
// PIPELINE (in order):
//   1. Authenticate: reject if no session
//   2. Validate file: check it's a PDF/image and under 10 MB
//   3. Upload to Supabase Storage (app/lib/storage.ts) — saves the file permanently
//   4. Run OCR via Google Document AI (app/lib/ocr.ts) — extracts line items
//   5. Enrich with previous prices: for each extracted item, look up the last
//      time this item appeared on an invoice to calculate the price change
//   6. Calculate totalOvercharge across all flagged items
//   7. Save the Invoice + all InvoiceItems to the database
//   8. Return the saved invoice (UI updates with results)
//
// TO ACTIVATE (all 3 services must be set up):
//   Step 1 — Storage (Supabase):
//           See app/lib/storage.ts for full instructions
//           npm install @supabase/supabase-js
//           Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
//
//   Step 2 — OCR (Google Document AI):
//           See app/lib/ocr.ts for full instructions
//           npm install @google-cloud/documentai
//           Set GOOGLE_CLOUD_PROJECT_ID + GOOGLE_CLOUD_PROCESSOR_ID
//           Save google-service-account.json to project root
//
//   Step 3 — Wire the frontend:
//           In app/invoice-scanner/page.tsx, find the simulateScan() function
//           Replace it with a real FormData fetch() to this endpoint:
//             const fd = new FormData();
//             fd.append("file", selectedFile);
//             fd.append("supplier", supplierName);
//             const res = await fetch("/api/scan-invoice", { method: "POST", body: fd });
//             const invoice = await res.json();
//             setItems(invoice.lineItems);
//
// SECURITY:
//   — File type is validated server-side (not just by file extension).
//   — File size is capped at 10 MB.
//   — All data is scoped to the logged-in restaurant only.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { uploadInvoiceFile } from "@/app/lib/storage";
import { extractInvoiceLineItems } from "@/app/lib/ocr";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurantId = (session.user as any).restaurantId as string;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const supplier = formData.get("supplier") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Upload a PDF or image." }, { status: 415 });
  }

  // Validate file size (max 10 MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 413 });
  }

  // 1. Upload to storage
  const fileUrl = await uploadInvoiceFile(file, restaurantId);

  // 2. Run OCR
  const rawItems = await extractInvoiceLineItems(fileUrl);

  // 3. Enrich with previous prices from DB
  const enrichedItems = await Promise.all(
    rawItems.map(async (item) => {
      // Find the most recent invoice with the same item name for this restaurant
      const previous = await prisma.invoiceItem.findFirst({
        where: {
          item: { contains: item.item, mode: "insensitive" },
          invoice: { restaurantId },
        },
        orderBy: { invoice: { uploadedAt: "desc" } },
      });

      const previousPrice = previous?.currentPrice ?? item.currentPrice;
      const diff = item.currentPrice - previousPrice;
      return { ...item, previousPrice, diff };
    })
  );

  const totalOvercharge = enrichedItems
    .filter((i) => i.diff > 0)
    .reduce((s, i) => s + i.diff * i.quantity, 0);

  // 4. Persist invoice + items
  const invoice = await prisma.invoice.create({
    data: {
      supplier: supplier ?? "Unknown Supplier",
      fileUrl,
      restaurantId,
      totalOvercharge,
      lineItems: { create: enrichedItems },
    },
    include: { lineItems: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}

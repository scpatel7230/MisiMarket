// =============================================================================
// FILE: app/lib/email.ts
// PURPOSE:
//   Sends automated emails to restaurant owners using Resend (resend.com).
//   Currently handles two email types:
//     1. Overcharge alert — fires when a scanned invoice has price increases
//        exceeding the threshold set in app/api/invoices/route.ts ($10 default)
//     2. Weekly forecast digest — summary of upcoming ingredient price spikes
//        (you'll need to set up a cron job to call this on a schedule)
//
// HOW IT WORKS:
//   The Resend SDK sends emails via their API. You define the recipient,
//   subject, and body — they handle delivery, bounce tracking, etc.
//   Emails are triggered server-side from API routes, never from the browser.
//
// TO ACTIVATE:
//   Step 1: Sign up at resend.com (free tier: 3,000 emails/month)
//   Step 2: Add and verify your sending domain in the Resend dashboard
//           (or use their onboarding address for testing)
//   Step 3: Create an API key in the Resend dashboard
//   Step 4: Install the package:
//           npm install resend
//   Step 5: Set in .env.local:
//           RESEND_API_KEY=re_xxxxxxxxxxxx
//           ALERT_FROM_EMAIL=alerts@yourdomain.com
//
// TO ADD A WEEKLY CRON JOB (send forecast digest every Monday):
//   - On Vercel: add a vercel.json with a cron config that hits
//     a new route /api/cron/weekly-digest
//   - That route fetches all restaurants, loops through owners,
//     and calls sendWeeklyForecastDigest() for each one
//
// TO CUSTOMISE:
//   Replace the plain text email bodies with HTML using Resend's
//   React Email integration: npm install @react-email/components
// =============================================================================

import { Resend } from "resend";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.ALERT_FROM_EMAIL ?? "alerts@misimarket.com";

// ── Invoice overcharge alert ──────────────────────────────────
export async function sendOverchargeAlert({
  to,
  restaurantName,
  supplier,
  totalOvercharge,
  items,
}: {
  to: string;
  restaurantName: string;
  supplier: string;
  totalOvercharge: number;
  items: { item: string; diff: number; quantity: number }[];
}) {
  const itemRows = items
    .filter((i) => i.diff > 0)
    .map((i) => `• ${i.item}: +$${(i.diff * i.quantity).toFixed(2)}`)
    .join("\n");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Invoice Alert — ${supplier} overcharged $${totalOvercharge.toFixed(2)}`,
    text: `
MisiMarket Price Alert — ${restaurantName}

Your latest invoice from ${supplier} contains price increases totalling $${totalOvercharge.toFixed(2)}.

Items flagged:
${itemRows}

Log in to MisiMarket to review the full invoice and take action.
    `.trim(),
  });
}

// ── Weekly forecast digest ────────────────────────────────────
export async function sendWeeklyForecastDigest({
  to,
  restaurantName,
  forecasts,
}: {
  to: string;
  restaurantName: string;
  forecasts: { ingredient: string; expectedRisePct: number; urgency: string }[];
}) {
  const lines = forecasts
    .map((f) => `• ${f.ingredient} — expected +${f.expectedRisePct}% [${f.urgency.toUpperCase()}]`)
    .join("\n");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `📈 MisiMarket Weekly Forecast — ${restaurantName}`,
    text: `
Weekly Price Forecast — ${restaurantName}

${lines}

Log in to MisiMarket to see full details and stock-up recommendations.
    `.trim(),
  });
}

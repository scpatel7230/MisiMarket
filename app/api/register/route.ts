// =============================================================================
// FILE: app/api/register/route.ts
// PURPOSE:
//   Handles new restaurant sign-ups. Called by the registration form at
//   /register (app/(auth)/register/page.tsx).
//   Creates both the Restaurant record AND the first User (owner) in one step.
//
// WHAT IT DOES:
//   1. Validates the submitted fields (name, email, password)
//   2. Checks the password is at least 8 characters
//   3. Checks no account already exists with that email (prevents duplicates)
//   4. Hashes the password with bcrypt (12 rounds) — plain text is NEVER stored
//   5. Generates a URL-safe slug from the restaurant name (e.g. "Mama's Kitchen"
//      becomes "mamas-kitchen") — used for future multi-tenant URL routing
//   6. Creates the Restaurant + User in the database in one transaction
//   7. Returns the new restaurantId so the frontend can auto-sign-in
//
// TO ACTIVATE:
//   Step 1: Install dependencies:
//           npm install bcryptjs
//           npm install -D @types/bcryptjs
//   Step 2: Make sure the Prisma schema is migrated (Restaurant + User tables exist)
//   Step 3: In app/(auth)/register/page.tsx, uncomment the real fetch() call
//           in the handleSubmit function (replace the placeholder simulation)
//
// SECURITY NOTES:
//   — Passwords are hashed with bcrypt (cost factor 12) before storage.
//   — Email uniqueness is enforced at both DB level (unique index) and here.
//   — No sensitive data is returned in the response.
//   — Rate limiting should be added before going to production to prevent
//     account enumeration attacks. Consider adding: npm install @upstash/ratelimit
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { restaurantName, name, email, password } = body as {
    restaurantName: string;
    name: string;
    email: string;
    password: string;
  };

  if (!restaurantName || !email || !password) {
    return NextResponse.json(
      { error: "restaurantName, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Create a URL-safe slug from the restaurant name
  const slug = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  // Ensure slug is unique
  const existingSlug = await prisma.restaurant.findUnique({ where: { slug } });
  const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

  const restaurant = await prisma.restaurant.create({
    data: {
      name: restaurantName,
      slug: finalSlug,
      users: {
        create: {
          email,
          name: name || email,
          passwordHash,
          role: "OWNER",
        },
      },
    },
  });

  return NextResponse.json({ restaurantId: restaurant.id }, { status: 201 });
}

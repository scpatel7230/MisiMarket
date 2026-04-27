// =============================================================================
// FILE: app/lib/prisma.ts
// PURPOSE:
//   Creates and exports a single shared Prisma database client instance.
//   Every API route imports `prisma` from this file to query the database.
//
// WHY A SINGLETON:
//   Next.js dev mode hot-reloads modules on every file save. Without this
//   pattern, each reload would create a new DB connection until you hit the
//   connection pool limit and the app crashes. The globalThis trick stores
//   the instance outside the module cache so it survives reloads.
//
// TO ACTIVATE:
//   Step 1: Install Prisma:
//           npm install prisma @prisma/client
//   Step 2: Set DATABASE_URL in .env.local
//   Step 3: Run: npx prisma generate
//           (this generates the PrismaClient class from your schema)
//
// HOW TO USE IN AN API ROUTE:
//   import { prisma } from "@/app/lib/prisma";
//   const ingredients = await prisma.ingredient.findMany({ ... });
//
// NO FURTHER CHANGES NEEDED TO THIS FILE — it works as-is.
// =============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

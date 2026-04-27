// =============================================================================
// FILE: prisma/seed.ts
// PURPOSE:
//   Populates the database with starter/demo data so the app works immediately
//   after setup, without needing to manually enter everything through the UI.
//   Think of it as a "factory reset" for your database.
//
// WHAT IT CREATES:
//   - 1 demo restaurant ("Demo Restaurant")
//   - 1 owner user:  email: owner@demo.com  |  password: password123
//   - 2 ingredients (Basmati Rice, Chicken Thighs) with multiple supplier prices
//   - 1 dish (Chicken Biryani) linking those ingredients
//
// TO ACTIVATE:
//   Step 1: Install ts-node (needed to run TypeScript directly):
//           npm install -D ts-node
//   Step 2: Add this block to your package.json:
//           "prisma": {
//             "seed": "ts-node prisma/seed.ts"
//           }
//   Step 3: Make sure your DB is migrated first:
//           npx prisma migrate dev --name init
//   Step 4: Run the seed:
//           npx prisma db seed
//
// TO CUSTOMISE:
//   Replace the demo data below with your restaurant's real name, your real
//   email, and your actual suppliers + prices. You can add as many ingredients
//   and dishes as you need by copying the pattern shown.
//
// WARNING:
//   Running this multiple times is safe — upsert is used for the restaurant
//   and user, so it won't create duplicates. However the ingredient/dish
//   creates are NOT idempotent — delete those rows in Prisma Studio first
//   if you want to re-seed them cleanly.
// =============================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Create restaurant ─────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-restaurant" },
    update: {},
    create: {
      name: "Demo Restaurant",
      slug: "demo-restaurant",
    },
  });

  // ── 2. Create owner user ─────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);
  await prisma.user.upsert({
    where: { email: "owner@demo.com" },
    update: {},
    create: {
      email: "owner@demo.com",
      name: "Restaurant Owner",
      passwordHash,
      role: "OWNER",
      restaurantId: restaurant.id,
    },
  });

  // ── 3. Seed ingredients ──────────────────────────────────────
  const basmati = await prisma.ingredient.create({
    data: {
      name: "Basmati Rice",
      category: "Grain",
      restaurantId: restaurant.id,
      suppliers: {
        create: [
          { supplier: "Sysco", type: "national", price: 42.0, unit: 50, unitType: "lb", pricePerOz: 42 / (50 * 16), inStock: true },
          { supplier: "Raja Indian Wholesale", type: "local", price: 35.0, unit: 20, unitType: "kg", pricePerOz: 35 / (20 * 35.274), inStock: true },
          { supplier: "GFS", type: "national", price: 44.5, unit: 50, unitType: "lb", pricePerOz: 44.5 / (50 * 16), inStock: false },
        ],
      },
    },
  });

  const chicken = await prisma.ingredient.create({
    data: {
      name: "Chicken Thighs",
      category: "Protein",
      restaurantId: restaurant.id,
      suppliers: {
        create: [
          { supplier: "Sysco", type: "national", price: 68.0, unit: 40, unitType: "lb", pricePerOz: 68 / (40 * 16), inStock: true },
          { supplier: "Local Farms Co.", type: "local", price: 4.2, unit: 1, unitType: "lb", pricePerOz: 4.2 / 16, inStock: true },
        ],
      },
    },
  });

  // ── 4. Seed a dish ───────────────────────────────────────────
  await prisma.dish.create({
    data: {
      name: "Chicken Biryani",
      menuPrice: 18.99,
      restaurantId: restaurant.id,
      ingredients: {
        create: [
          { name: "Basmati Rice", quantityOz: 6, ingredientId: basmati.id },
          { name: "Chicken Thighs", quantityOz: 8, ingredientId: chicken.id },
        ],
      },
    },
  });

  console.log("✅ Seed complete — login with owner@demo.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

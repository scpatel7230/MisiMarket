// ============================================================
// MisiMarket – Central Data & Types
// Replace these mock values with real API/DB calls later.
// ============================================================

export type UnitType = "kg" | "lb" | "oz" | "case" | "each";

export interface SupplierPrice {
  supplier: string;
  type: "national" | "local";
  price: number; // in USD
  unit: number;
  unitType: UnitType;
  pricePerOz: number; // normalised
  lastUpdated: string;
  inStock: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  suppliers: SupplierPrice[];
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  supplier: string;
}

export interface InvoiceLineItem {
  item: string;
  previousPrice: number;
  currentPrice: number;
  quantity: number;
  unit: string;
  diff: number; // currentPrice - previousPrice
}

export interface DishIngredient {
  ingredientId: string;
  name: string;
  quantityOz: number;
}

export interface Dish {
  id: string;
  name: string;
  menuPrice: number;
  ingredients: DishIngredient[];
}

export interface SpikeForecast {
  ingredient: string;
  expectedRisePct: number;
  reason: string;
  recommendedStockMonths: number;
  urgency: "low" | "medium" | "high";
}

export interface SubstituteSuggestion {
  original: string;
  substitute: string;
  originalPricePerOz: number;
  substitutePricePerOz: number;
  savingsPct: number;
  qualityNote: string;
}

// ─── Mock ingredient catalogue ────────────────────────────────
export const INGREDIENTS: Ingredient[] = [
  {
    id: "basmati",
    name: "Basmati Rice",
    category: "Grain",
    suppliers: [
      { supplier: "Sysco", type: "national", price: 42.0, unit: 50, unitType: "lb", pricePerOz: 42 / (50 * 16), lastUpdated: "2026-04-24", inStock: true },
      { supplier: "Raja Indian Wholesale", type: "local", price: 35.0, unit: 20, unitType: "kg", pricePerOz: 35 / (20 * 35.274), lastUpdated: "2026-04-25", inStock: true },
      { supplier: "GFS", type: "national", price: 44.5, unit: 50, unitType: "lb", pricePerOz: 44.5 / (50 * 16), lastUpdated: "2026-04-22", inStock: false },
    ],
  },
  {
    id: "chicken",
    name: "Chicken (Halal, Bone-in)",
    category: "Protein",
    suppliers: [
      { supplier: "Sysco", type: "national", price: 58.0, unit: 40, unitType: "lb", pricePerOz: 58 / (40 * 16), lastUpdated: "2026-04-25", inStock: true },
      { supplier: "Crescent Foods Local", type: "local", price: 50.0, unit: 40, unitType: "lb", pricePerOz: 50 / (40 * 16), lastUpdated: "2026-04-26", inStock: true },
    ],
  },
  {
    id: "onion",
    name: "Onions",
    category: "Vegetable",
    suppliers: [
      { supplier: "Sysco", type: "national", price: 22.0, unit: 50, unitType: "lb", pricePerOz: 22 / (50 * 16), lastUpdated: "2026-04-24", inStock: true },
      { supplier: "Patel Brothers Wholesale", type: "local", price: 17.0, unit: 50, unitType: "lb", pricePerOz: 17 / (50 * 16), lastUpdated: "2026-04-26", inStock: true },
    ],
  },
  {
    id: "ghee",
    name: "Ghee (Clarified Butter)",
    category: "Fat/Oil",
    suppliers: [
      { supplier: "Sysco", type: "national", price: 28.0, unit: 7, unitType: "lb", pricePerOz: 28 / (7 * 16), lastUpdated: "2026-04-20", inStock: true },
      { supplier: "Nanak Wholesale", type: "local", price: 24.0, unit: 7, unitType: "lb", pricePerOz: 24 / (7 * 16), lastUpdated: "2026-04-25", inStock: true },
    ],
  },
  {
    id: "turmeric",
    name: "Turmeric Powder",
    category: "Spice",
    suppliers: [
      { supplier: "Sysco", type: "national", price: 12.0, unit: 5, unitType: "lb", pricePerOz: 12 / (5 * 16), lastUpdated: "2026-04-18", inStock: true },
      { supplier: "Swad Spice Wholesale", type: "local", price: 9.5, unit: 5, unitType: "lb", pricePerOz: 9.5 / (5 * 16), lastUpdated: "2026-04-24", inStock: true },
    ],
  },
  {
    id: "chickpeas",
    name: "Chickpeas (Chana)",
    category: "Legume",
    suppliers: [
      { supplier: "Sysco", type: "national", price: 30.0, unit: 50, unitType: "lb", pricePerOz: 30 / (50 * 16), lastUpdated: "2026-04-22", inStock: true },
      { supplier: "Swad Spice Wholesale", type: "local", price: 24.0, unit: 50, unitType: "lb", pricePerOz: 24 / (50 * 16), lastUpdated: "2026-04-25", inStock: true },
    ],
  },
];

// ─── Mock price history (last 8 weeks) ────────────────────────
export const PRICE_HISTORY: Record<string, PriceHistoryEntry[]> = {
  ghee: [
    { date: "2026-03-01", price: 22.0, supplier: "Nanak Wholesale" },
    { date: "2026-03-08", price: 22.5, supplier: "Nanak Wholesale" },
    { date: "2026-03-15", price: 22.5, supplier: "Nanak Wholesale" },
    { date: "2026-03-22", price: 23.0, supplier: "Nanak Wholesale" },
    { date: "2026-03-29", price: 23.0, supplier: "Nanak Wholesale" },
    { date: "2026-04-05", price: 23.5, supplier: "Nanak Wholesale" },
    { date: "2026-04-12", price: 24.0, supplier: "Nanak Wholesale" },
    { date: "2026-04-25", price: 24.0, supplier: "Nanak Wholesale" },
  ],
  chicken: [
    { date: "2026-03-01", price: 46.0, supplier: "Crescent Foods Local" },
    { date: "2026-03-08", price: 46.0, supplier: "Crescent Foods Local" },
    { date: "2026-03-15", price: 47.0, supplier: "Crescent Foods Local" },
    { date: "2026-03-22", price: 47.5, supplier: "Crescent Foods Local" },
    { date: "2026-03-29", price: 48.0, supplier: "Crescent Foods Local" },
    { date: "2026-04-05", price: 49.0, supplier: "Crescent Foods Local" },
    { date: "2026-04-12", price: 50.0, supplier: "Crescent Foods Local" },
    { date: "2026-04-25", price: 50.0, supplier: "Crescent Foods Local" },
  ],
};

// ─── Mock last invoice scan result ────────────────────────────
export const LAST_INVOICE_SCAN: InvoiceLineItem[] = [
  { item: "Basmati Rice 50lb", previousPrice: 38.0, currentPrice: 42.0, quantity: 10, unit: "bag", diff: 4.0 },
  { item: "Ghee 7lb", previousPrice: 22.0, currentPrice: 24.0, quantity: 5, unit: "jar", diff: 2.0 },
  { item: "Turmeric 5lb", previousPrice: 9.5, currentPrice: 9.5, quantity: 3, unit: "bag", diff: 0 },
  { item: "Chicken 40lb", previousPrice: 50.0, currentPrice: 50.0, quantity: 8, unit: "case", diff: 0 },
  { item: "Onions 50lb", previousPrice: 19.0, currentPrice: 22.0, quantity: 4, unit: "bag", diff: 3.0 },
];

// ─── Dishes ───────────────────────────────────────────────────
export const DISHES: Dish[] = [
  {
    id: "biryani",
    name: "Chicken Biryani",
    menuPrice: 18.99,
    ingredients: [
      { ingredientId: "basmati", name: "Basmati Rice", quantityOz: 8 },
      { ingredientId: "chicken", name: "Chicken", quantityOz: 10 },
      { ingredientId: "onion", name: "Onions", quantityOz: 3 },
      { ingredientId: "ghee", name: "Ghee", quantityOz: 1 },
      { ingredientId: "turmeric", name: "Turmeric", quantityOz: 0.2 },
    ],
  },
  {
    id: "chana_masala",
    name: "Chana Masala",
    menuPrice: 14.99,
    ingredients: [
      { ingredientId: "chickpeas", name: "Chickpeas", quantityOz: 10 },
      { ingredientId: "onion", name: "Onions", quantityOz: 4 },
      { ingredientId: "ghee", name: "Ghee", quantityOz: 0.5 },
      { ingredientId: "turmeric", name: "Turmeric", quantityOz: 0.1 },
    ],
  },
];

// ─── Forecasts ────────────────────────────────────────────────
export const FORECASTS: SpikeForecast[] = [
  {
    ingredient: "Turmeric Powder",
    expectedRisePct: 15,
    reason: "Supply chain disruptions in India affecting 2026 harvest",
    recommendedStockMonths: 4,
    urgency: "high",
  },
  {
    ingredient: "Basmati Rice",
    expectedRisePct: 8,
    reason: "Increased export demand from Middle East region",
    recommendedStockMonths: 2,
    urgency: "medium",
  },
  {
    ingredient: "Ghee",
    expectedRisePct: 5,
    reason: "Seasonal dairy price increase expected in summer",
    recommendedStockMonths: 1,
    urgency: "low",
  },
];

// ─── Substitute suggestions ───────────────────────────────────
export const SUBSTITUTES: SubstituteSuggestion[] = [
  {
    original: "Branded Chickpeas (Swad)",
    substitute: "Generic White Chickpeas (GFS)",
    originalPricePerOz: 24 / (50 * 16),
    substitutePricePerOz: 18 / (50 * 16),
    savingsPct: 25,
    qualityNote: "Same protein content, similar texture. Suitable for Chana Masala.",
  },
  {
    original: "Sysco Vegetable Oil (35lb)",
    substitute: "Local Indian Sunflower Oil (35lb)",
    originalPricePerOz: 32 / (35 * 16),
    substitutePricePerOz: 25 / (35 * 16),
    savingsPct: 22,
    qualityNote: "Higher smoke point, comparable flavour profile.",
  },
];

// ─── Helper: cheapest supplier for an ingredient ──────────────
export function getCheapestSupplier(ingredient: Ingredient): SupplierPrice {
  return ingredient.suppliers
    .filter((s) => s.inStock)
    .sort((a, b) => a.pricePerOz - b.pricePerOz)[0];
}

// ─── Helper: dish cost using cheapest available prices ────────
export function calcDishCost(dish: Dish): number {
  return dish.ingredients.reduce((total, ing) => {
    const ingredient = INGREDIENTS.find((i) => i.id === ing.ingredientId);
    if (!ingredient) return total;
    const cheapest = getCheapestSupplier(ingredient);
    return total + cheapest.pricePerOz * ing.quantityOz;
  }, 0);
}

// ─── Helper: format price ─────────────────────────────────────
export function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

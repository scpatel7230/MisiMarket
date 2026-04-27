"use client";
import { useState } from "react";
import { DISHES, INGREDIENTS, getCheapestSupplier, fmt, type Dish } from "../lib/data";

const TARGET_MARGIN = 30; // %

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function DishGuardPage() {
  const allCosts = DISHES.map((dish) => {
    const cost = dish.ingredients.reduce((t, ing) => {
      const ingredient = INGREDIENTS.find((i) => i.id === ing.ingredientId);
      if (!ingredient) return t;
      const cheapest = getCheapestSupplier(ingredient);
      return t + cheapest.pricePerOz * ing.quantityOz;
    }, 0);
    const marginPct = ((dish.menuPrice - cost) / dish.menuPrice) * 100;
    return marginPct;
  });
  const avgMargin = allCosts.reduce((s, m) => s + m, 0) / allCosts.length;
  const warningCount = allCosts.filter((m) => m < TARGET_MARGIN).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 mb-1.5 uppercase">
            Profitability
          </p>
          <h1 className="text-[1.65rem] font-bold tracking-tight text-slate-900 leading-tight">
            Dish Guard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ingredient cost vs menu price. Simulates any menu price change instantly.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="card px-4 py-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5">Avg Margin</div>
            <div className={`text-xl font-bold ${avgMargin < TARGET_MARGIN ? "text-red-600" : "text-emerald-600"}`}>
              {avgMargin.toFixed(1)}%
            </div>
          </div>
          <div className="card px-4 py-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5">Warnings</div>
            <div className={`text-xl font-bold ${warningCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {warningCount}
            </div>
          </div>
        </div>
      </div>

      {/* Dish cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {DISHES.map((dish, i) => (
          <DishCard key={dish.id} dish={dish} index={i} />
        ))}
      </div>

      {/* Template notice */}
      <div className="card p-5 border-l-[3px] border-l-amber-400">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
            <ShieldIcon />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-[14px] mb-1">Adding Your Own Dishes</h3>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Add dishes to <code className="bg-slate-100 text-slate-700 px-1 rounded text-[11px]">app/lib/data.ts</code> in the <code className="bg-slate-100 text-slate-700 px-1 rounded text-[11px]">DISHES</code> array,
              or connect a database (Supabase / PlanetScale) and expose a <code className="bg-slate-100 text-slate-700 px-1 rounded text-[11px]">/api/dishes</code> route.
              Build an &quot;Add Dish&quot; form that POSTs ingredients with oz quantities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DishCard({ dish, index }: { dish: Dish; index: number }) {
  const [menuPrice, setMenuPrice] = useState(dish.menuPrice);

  const ingredientCosts = dish.ingredients.map((ing) => {
    const ingredient = INGREDIENTS.find((i) => i.id === ing.ingredientId);
    const cheapest = ingredient ? getCheapestSupplier(ingredient) : null;
    const cost = cheapest ? cheapest.pricePerOz * ing.quantityOz : 0;
    return { ...ing, cost, cheapest };
  });

  const totalCost = ingredientCosts.reduce((s, i) => s + i.cost, 0);
  const margin = menuPrice - totalCost;
  const marginPct = menuPrice > 0 ? (margin / menuPrice) * 100 : 0;
  const warn = marginPct < TARGET_MARGIN;
  const suggestedPrice = totalCost / (1 - TARGET_MARGIN / 100);
  const priceIncrease = suggestedPrice - menuPrice;

  return (
    <div className={`card overflow-hidden animate-in delay-${index + 1}`}>
      {/* Card header */}
      <div className={`px-6 py-5 border-b ${warn ? "border-red-100 bg-red-50/40" : "border-emerald-100/50 bg-emerald-50/30"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-[16px] text-slate-900">{dish.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                  warn ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {marginPct.toFixed(1)}% margin
              </span>
              {warn && (
                <span className="text-[12px] text-red-600">
                  â€” {(TARGET_MARGIN - marginPct).toFixed(1)}% below target
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mb-1.5">Menu Price</div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium">$</span>
              <input
                type="number"
                value={menuPrice}
                step="0.50"
                min={0}
                onChange={(e) => setMenuPrice(parseFloat(e.target.value) || 0)}
                className={`bg-white border rounded-lg px-2 py-1.5 text-sm font-bold w-20 text-right focus:outline-none focus:ring-2 transition ${
                  warn
                    ? "border-red-200 text-red-700 focus:ring-red-300"
                    : "border-slate-200 text-slate-900 focus:ring-orange-300"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Margin progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
            <span>0%</span>
            <span className="font-semibold">{TARGET_MARGIN}% target</span>
            <span>100%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(Math.max(marginPct, 0), 100)}%`,
                backgroundColor: warn ? "#ef4444" : "#10b981",
              }}
            />
          </div>
        </div>

        {warn && (
          <div className="mt-3 flex items-start gap-2.5 bg-red-100/60 border border-red-200 rounded-xl px-4 py-2.5 text-red-800 text-[12px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>
              Raise menu price by{" "}
              <strong>{fmt(priceIncrease)}</strong> to <strong>{fmt(suggestedPrice)}</strong> to restore {TARGET_MARGIN}% margin.
            </span>
          </div>
        )}
      </div>

      {/* Ingredient breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase bg-slate-50/60 border-b border-slate-100">
              <th className="px-6 py-3 text-left">Ingredient</th>
              <th className="px-4 py-3 text-right">Qty (oz)</th>
              <th className="px-4 py-3 text-right">Best Price/oz</th>
              <th className="px-4 py-3 text-right">Supplier</th>
              <th className="px-4 py-3 text-right">Line Cost</th>
            </tr>
          </thead>
          <tbody>
            {ingredientCosts.map((ing) => (
              <tr
                key={ing.ingredientId}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-6 py-3 font-medium text-slate-800">{ing.name}</td>
                <td className="px-4 py-3 text-right text-slate-500 text-[13px]">{ing.quantityOz}</td>
                <td className="px-4 py-3 text-right text-slate-600 text-[13px]">
                  {ing.cheapest ? fmt(ing.cheapest.pricePerOz) : "â€”"}
                </td>
                <td className="px-4 py-3 text-right text-[11px] text-slate-400">
                  {ing.cheapest?.supplier ?? "â€”"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">{fmt(ing.cost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td colSpan={4} className="px-6 py-3 text-right text-[12px] font-semibold text-slate-600">
                Total Ingredient Cost
              </td>
              <td className="px-4 py-3 text-right text-[15px] font-bold text-orange-600">{fmt(totalCost)}</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={4} className="px-6 py-2.5 text-right text-[12px] text-slate-500">
                Gross Margin ({marginPct.toFixed(1)}%)
              </td>
              <td className={`px-4 py-2.5 text-right font-bold text-[13px] ${warn ? "text-red-600" : "text-emerald-600"}`}>
                {fmt(margin)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="px-6 py-2.5 bg-blue-50/50 border-t border-blue-100/60 text-[11px] text-blue-600 font-medium">
        All quantities normalised to oz â€” kg, lb, and case pack sizes handled automatically
      </div>
    </div>
  );
}


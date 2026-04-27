"use client";
import { useState } from "react";
import { INGREDIENTS, getCheapestSupplier, fmt, type Ingredient, type SupplierPrice } from "../lib/data";

const CATEGORIES = ["All", ...Array.from(new Set(INGREDIENTS.map((i) => i.category)))];

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function PriceComparisonPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = INGREDIENTS.filter((ing) => {
    const matchSearch = ing.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || ing.category === category;
    return matchSearch && matchCat;
  });

  const totalSavingsAvailable = INGREDIENTS.reduce((sum, ing) => {
    const inStock = ing.suppliers.filter((s) => s.inStock);
    if (inStock.length < 2) return sum;
    const best = [...inStock].sort((a, b) => a.pricePerOz - b.pricePerOz)[0];
    const worst = [...inStock].sort((a, b) => b.pricePerOz - a.pricePerOz)[0];
    return sum + ((worst.pricePerOz - best.pricePerOz) / worst.pricePerOz) * 100;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 mb-1.5 uppercase">
            Price Intelligence
          </p>
          <h1 className="text-[1.65rem] font-bold tracking-tight text-slate-900 leading-tight">
            Supplier Comparison
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            All prices normalised to cost-per-ounce. The true winner is always visible.
          </p>
        </div>
        <div className="card px-4 py-3 text-right shrink-0">
          <div className="text-[11px] text-slate-400 mb-0.5 font-medium">Avg savings available</div>
          <div className="text-lg font-bold text-emerald-600">
            {(totalSavingsAvailable / INGREDIENTS.length).toFixed(0)}% per item
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search ingredientâ€¦"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 w-56 shadow-sm transition"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
                category === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-slate-400 ml-auto">
          {filtered.length} ingredient{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((ing, i) => (
          <IngredientCard key={ing.id} ingredient={ing} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-16 text-center">
            <div className="text-slate-300 text-4xl mb-3">âˆ…</div>
            <p className="text-slate-500 font-medium">No ingredients match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PriceBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-slate-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function IngredientCard({ ingredient, index }: { ingredient: Ingredient; index: number }) {
  const cheapest = getCheapestSupplier(ingredient);
  const sorted = [...ingredient.suppliers].sort((a, b) => a.pricePerOz - b.pricePerOz);
  const maxPrice = Math.max(...sorted.map((s) => s.pricePerOz));
  const worstInStock = [...ingredient.suppliers].filter((s) => s.inStock).sort((a, b) => b.pricePerOz - a.pricePerOz)[0];
  const savePct =
    worstInStock && cheapest !== worstInStock
      ? Math.round(((worstInStock.pricePerOz - cheapest.pricePerOz) / worstInStock.pricePerOz) * 100)
      : 0;

  return (
    <div className={`card overflow-hidden animate-in delay-${Math.min(index + 1, 4)}`}>
      {/* Card header */}
      <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[12px] font-bold text-white"
            style={{ backgroundColor: "#0d1117" }}
          >
            {ingredient.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-slate-900">{ingredient.name}</span>
            <span className="ml-2 text-[11px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {ingredient.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savePct > 0 && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Save up to {savePct}% vs market
            </span>
          )}
          <div className="text-[13px] text-slate-600">
            Best:{" "}
            <span className="font-bold text-slate-900">{cheapest.supplier}</span>{" "}
            <span className="text-emerald-600 font-semibold">{fmt(cheapest.pricePerOz)}/oz</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase bg-white border-b border-slate-100">
              <th className="px-6 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-left">Network</th>
              <th className="px-4 py-3 text-right">Pack</th>
              <th className="px-4 py-3 text-right">Pack Price</th>
              <th className="px-4 py-3 text-right">Per oz</th>
              <th className="px-4 py-3 text-left w-28">Relative</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-center">Stock</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s: SupplierPrice, i) => {
              const isBest = s === cheapest;
              return (
                <tr
                  key={s.supplier}
                  className={`border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/60 ${
                    isBest ? "bg-emerald-50/40" : ""
                  }`}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      {isBest && (
                        <span className="text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                          BEST
                        </span>
                      )}
                      <span className={`font-medium ${isBest ? "text-slate-900" : "text-slate-700"}`}>
                        {s.supplier}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        s.type === "local"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {s.type === "local" ? "Local" : "National"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-600 text-[13px]">
                    {s.unit} {s.unitType}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                    {fmt(s.price)}
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-bold text-[15px] ${
                      isBest ? "text-emerald-600" : "text-slate-700"
                    }`}
                  >
                    {fmt(s.pricePerOz)}
                  </td>
                  <td className="px-4 py-3.5">
                    <PriceBar value={s.pricePerOz} max={maxPrice} />
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-slate-400">{s.lastUpdated}</td>
                  <td className="px-4 py-3.5 text-center">
                    {s.inStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        In Stock
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">Out of Stock</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}



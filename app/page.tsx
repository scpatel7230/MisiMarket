import Link from "next/link";
import {
  INGREDIENTS,
  LAST_INVOICE_SCAN,
  DISHES,
  FORECASTS,
  getCheapestSupplier,
  calcDishCost,
  fmt,
} from "./lib/data";

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function TrendUp() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export default function Home() {
  const totalOvercharges = LAST_INVOICE_SCAN.filter((l) => l.diff > 0);
  const totalOverchargeAmount = totalOvercharges.reduce((s, l) => s + l.diff * l.quantity, 0);
  const highUrgencyForecasts = FORECASTS.filter((f) => f.urgency === "high");
  const dishWarnings = DISHES.filter((dish) => {
    const cost = calcDishCost(dish);
    return ((dish.menuPrice - cost) / dish.menuPrice) * 100 < 30;
  });

  const stats = [
    {
      label: "OVERCHARGES FOUND",
      value: fmt(totalOverchargeAmount),
      sub: `${totalOvercharges.length} items on latest invoice`,
      href: "/invoice-scanner",
      accentColor: "#ef4444",
      badge: "Action needed",
      badgeClass: "text-red-600 bg-red-50",
    },
    {
      label: "HIGH-RISK FORECASTS",
      value: `${highUrgencyForecasts.length}`,
      sub: "Ingredient price spikes incoming",
      href: "/forecasts",
      accentColor: "#f59e0b",
      badge: "Stock up now",
      badgeClass: "text-amber-700 bg-amber-50",
    },
    {
      label: "MARGIN WARNINGS",
      value: `${dishWarnings.length}`,
      sub: "Dishes below 30% target",
      href: "/dish-guard",
      accentColor: "#f97316",
      badge: "Review prices",
      badgeClass: "text-orange-700 bg-orange-50",
    },
    {
      label: "INGREDIENTS TRACKED",
      value: `${INGREDIENTS.length}`,
      sub: "Across national & local suppliers",
      href: "/price-comparison",
      accentColor: "#10b981",
      badge: "All current",
      badgeClass: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 mb-1.5 uppercase">
            Operations Center
          </p>
          <h1 className="text-[1.65rem] font-bold tracking-tight text-slate-900 leading-tight">
            Restaurant Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Price intelligence across all suppliers â€” April 26, 2026
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-[11px] text-slate-500 shadow-sm">
          <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 live-dot shrink-0" />
          Data live & current
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className={`card p-5 block hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] transition-all duration-200 animate-in delay-${i + 1}`}
          >
            <div
              className="h-[3px] w-10 rounded-full mb-5"
              style={{ backgroundColor: s.accentColor }}
            />
            <div className="stat-value mb-2">{s.value}</div>
            <div
              className="text-[10px] font-bold tracking-[0.1em] mb-1"
              style={{ color: s.accentColor }}
            >
              {s.label}
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">{s.sub}</div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.badgeClass}`}>
                {s.badge}
              </span>
              <span className="text-slate-300 group-hover:text-slate-500">
                <ChevronRight />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Best prices â€” 3 cols */}
        <div className="lg:col-span-3 card overflow-hidden animate-in delay-2">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 text-[15px]">Best Prices Today</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Cheapest available per ingredient</p>
            </div>
            <Link
              href="/price-comparison"
              className="flex items-center gap-1 text-[12px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              View all <ChevronRight />
            </Link>
          </div>
          <div>
            {INGREDIENTS.map((ing, i) => {
              const cheapest = getCheapestSupplier(ing);
              const worst = [...ing.suppliers].filter((s) => s.inStock).sort((a, b) => b.pricePerOz - a.pricePerOz)[0];
              const savePct =
                worst && cheapest !== worst
                  ? Math.round(((worst.pricePerOz - cheapest.pricePerOz) / worst.pricePerOz) * 100)
                  : 0;

              const avatarColors = ["#10b981", "#10b981", "#64748b", "#64748b", "#64748b", "#64748b"];

              return (
                <div
                  key={ing.id}
                  className={`px-6 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${i > 0 ? "border-t border-slate-50" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: avatarColors[i] ?? "#64748b" }}
                    >
                      {ing.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{ing.name}</div>
                      <div className="text-[11px] text-slate-400">{ing.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] text-slate-400 hidden sm:block truncate max-w-[120px]">
                      {cheapest.supplier}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {fmt(cheapest.pricePerOz)}
                      <span className="text-slate-400 font-normal text-[11px]">/oz</span>
                    </span>
                    {savePct > 0 && (
                      <span className="hidden sm:flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <TrendUp /> {savePct}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dish margins â€” 2 cols */}
        <div className="lg:col-span-2 card overflow-hidden animate-in delay-3">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 text-[15px]">Dish Margins</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Target: 30% minimum</p>
            </div>
            <Link
              href="/dish-guard"
              className="flex items-center gap-1 text-[12px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Manage <ChevronRight />
            </Link>
          </div>
          <div className="px-6 py-2">
            {DISHES.map((dish, i) => {
              const cost = calcDishCost(dish);
              const marginPct = ((dish.menuPrice - cost) / dish.menuPrice) * 100;
              const warn = marginPct < 30;
              return (
                <div
                  key={dish.id}
                  className={`py-4 ${i > 0 ? "border-t border-slate-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{dish.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Cost {fmt(cost)} Â· Menu {fmt(dish.menuPrice)}
                      </div>
                    </div>
                    <span
                      className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${
                        warn ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {marginPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(marginPct, 100)}%`,
                        backgroundColor: warn ? "#ef4444" : "#10b981",
                      }}
                    />
                  </div>
                  {warn && (
                    <p className="text-[11px] text-red-500 mt-1.5 font-medium">
                      Below target â€” consider raising menu price
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick action */}
          <div className="mx-6 mb-5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-600 mb-0.5">Latest Invoice Alert</p>
            <p className="text-[11px] text-slate-500">
              <span className="text-red-600 font-bold">{fmt(totalOverchargeAmount)}</span> overcharged on{" "}
              {totalOvercharges.length} items vs last order.{" "}
              <Link href="/invoice-scanner" className="text-orange-600 hover:underline font-medium">
                Review now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



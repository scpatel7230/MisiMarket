import { FORECASTS, SUBSTITUTES, fmt, type SpikeForecast, type SubstituteSuggestion } from "../lib/data";

const URGENCY_CONFIG: Record<SpikeForecast["urgency"], { bar: string; badge: string; label: string; dot: string }> = {
  high:   { bar: "#ef4444", badge: "bg-red-50 text-red-700 border-red-200",    label: "High Risk",   dot: "bg-red-500"    },
  medium: { bar: "#f59e0b", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium Risk", dot: "bg-amber-500" },
  low:    { bar: "#10b981", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Low Risk", dot: "bg-emerald-500" },
};

export default function ForecastsPage() {
  const totalPotentialRisk = FORECASTS.reduce((s, f) => s + f.expectedRisePct, 0);
  const highCount = FORECASTS.filter((f) => f.urgency === "high").length;
  const totalSavings = SUBSTITUTES.reduce((s, sub) => s + sub.savingsPct, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-slate-400 mb-1.5 uppercase">
            Market Intelligence
          </p>
          <h1 className="text-[1.65rem] font-bold tracking-tight text-slate-900 leading-tight">
            Forecasts & Substitutes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            2026 supply chain signals and cost-saving swap recommendations.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="card px-4 py-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5">High Risk Items</div>
            <div className="text-xl font-bold text-red-600">{highCount}</div>
          </div>
          <div className="card px-4 py-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5">Avg Savings Available</div>
            <div className="text-xl font-bold text-emerald-600">
              {(totalSavings / SUBSTITUTES.length).toFixed(0)}%
            </div>
          </div>
          <div className="card px-4 py-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium mb-0.5">Total Risk Exposure</div>
            <div className="text-xl font-bold text-amber-600">+{totalPotentialRisk}%</div>
          </div>
        </div>
      </div>

      {/* Forecasts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-slate-900">Price Spike Forecasts</h2>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {FORECASTS.length} active signals
          </span>
        </div>
        <div className="space-y-3">
          {FORECASTS.map((f, i) => (
            <ForecastCard key={f.ingredient} forecast={f} index={i} />
          ))}
        </div>

        {/* Integration note */}
        <div className="mt-4 card p-5 border-l-[3px] border-l-amber-400">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 6s1-1 4-1 5 2 8 2 4-1 4-1V22s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="1" y1="1" x2="1" y2="22"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-[13px] mb-1">Connecting Live Market Data</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                These are curated static forecasts. Power them live with the{" "}
                <strong className="text-slate-700">USDA AMS Market News API</strong> or{" "}
                <strong className="text-slate-700">World Bank Commodity API</strong> via a weekly cron job at{" "}
                <code className="bg-slate-100 text-slate-700 px-1 rounded text-[11px]">app/api/refresh-forecasts/route.ts</code>.
                Add an AI layer (OpenAI) to summarise signals in plain English.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Substitutes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-slate-900">Cheaper Substitute Suggestions</h2>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {SUBSTITUTES.length} swaps available
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SUBSTITUTES.map((s, i) => (
            <SubstituteCard key={s.original} sub={s} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ForecastCard({ forecast: f, index }: { forecast: SpikeForecast; index: number }) {
  const cfg = URGENCY_CONFIG[f.urgency];
  return (
    <div
      className={`card overflow-hidden animate-in delay-${Math.min(index + 1, 4)}`}
      style={{ borderLeft: `3px solid ${cfg.bar}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-slate-900 text-[15px]">{f.ingredient}</span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1 align-middle`} />
                {cfg.label}
              </span>
            </div>
            <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{f.reason}</p>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-[2rem] font-bold leading-none tracking-tight"
              style={{ color: cfg.bar }}
            >
              +{f.expectedRisePct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">expected rise</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-slate-700">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            <span>
              <strong>Recommended:</strong> Stock{" "}
              <strong className="text-slate-900">{f.recommendedStockMonths} month{f.recommendedStockMonths > 1 ? "s" : ""}</strong>{" "}
              of supply now to lock in current prices
            </span>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white shrink-0 ml-3"
            style={{ backgroundColor: cfg.bar }}
          >
            Buy Now
          </span>
        </div>
      </div>
    </div>
  );
}

function SubstituteCard({ sub: s, index }: { sub: SubstituteSuggestion; index: number }) {
  const saving = s.originalPricePerOz - s.substitutePricePerOz;
  return (
    <div className={`card p-5 animate-in delay-${Math.min(index + 1, 4)}`}>
      <div className="flex items-stretch gap-3">
        {/* Current */}
        <div className="flex-1 bg-slate-50 rounded-xl p-4">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Current</p>
          <p className="font-semibold text-slate-800 text-[13px] leading-snug">{s.original}</p>
          <p className="text-lg font-bold text-slate-700 mt-2">{fmt(s.originalPricePerOz)}<span className="text-[11px] font-normal text-slate-400">/oz</span></p>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center shrink-0">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">swap</span>
          </div>
        </div>

        {/* Substitute */}
        <div className="flex-1 bg-emerald-50 border border-emerald-200/60 rounded-xl p-4">
          <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase mb-2">Cheaper Swap</p>
          <p className="font-semibold text-emerald-900 text-[13px] leading-snug">{s.substitute}</p>
          <p className="text-lg font-bold text-emerald-700 mt-2">{fmt(s.substitutePricePerOz)}<span className="text-[11px] font-normal text-emerald-500">/oz</span></p>
        </div>

        {/* Savings badge */}
        <div className="shrink-0 flex flex-col items-center justify-center bg-emerald-600 rounded-xl px-4 py-3 text-white min-w-[72px]">
          <div className="text-[1.4rem] font-black leading-none">{s.savingsPct}%</div>
          <div className="text-[10px] font-semibold mt-0.5 opacity-80">cheaper</div>
          <div className="text-[11px] font-bold mt-1">{fmt(saving)}/oz</div>
        </div>
      </div>
      <p className="text-[12px] text-slate-500 mt-3.5 bg-slate-50 rounded-lg px-3 py-2.5 leading-relaxed">
        {s.qualityNote}
      </p>
    </div>
  );
}


const URGENCY_STYLES: Record<SpikeForecast["urgency"], string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const URGENCY_LABEL: Record<SpikeForecast["urgency"], string> = {
  high: "ðŸ”´ High",
  medium: "ðŸŸ¡ Medium",
  low: "ðŸŸ¢ Low",
};


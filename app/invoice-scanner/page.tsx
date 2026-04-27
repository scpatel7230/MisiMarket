"use client";
import { useState } from "react";
import { LAST_INVOICE_SCAN, PRICE_HISTORY, fmt, type InvoiceLineItem } from "../lib/data";

// â”€â”€ OCR INTEGRATION TEMPLATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Real scanning requires: Google Document AI / AWS Textract / Azure Form Recognizer
// Flow: upload file â†’ POST /api/scan-invoice â†’ OCR extracts line items
//       â†’ compare vs stored prices â†’ return diff array
// The data below simulates a completed scan result.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin text-orange-500" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function InvoiceScannerPage() {
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(true); // show results by default so demo is immediate
  const [items] = useState<InvoiceLineItem[]>(LAST_INVOICE_SCAN);

  function simulateScan() {
    setScanned(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setScanned(true);
    }, 2000);
  }

  const overcharges = items.filter((i) => i.diff > 0);
  const totalExtraSpend = overcharges.reduce((s, i) => s + i.diff * i.quantity, 0);
  const okItems = items.filter((i) => i.diff === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-slate-400 mb-1.5 uppercase">
          Invoice Analysis
        </p>
        <h1 className="text-[1.65rem] font-bold tracking-tight text-slate-900 leading-tight">
          Price Creep Detector
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload any supplier invoice â€” we read it and flag every price increase vs your last order.
        </p>
      </div>

      {/* Upload zone */}
      <div className="card overflow-hidden">
        <div className="p-8">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-orange-300 hover:bg-orange-50/30 transition-all duration-200 relative group">
            {loading && (
              <div className="absolute inset-0 rounded-xl bg-white/80 flex flex-col items-center justify-center gap-3 z-10">
                <div className="relative w-full overflow-hidden h-0.5 mb-1">
                  <div className="scan-line" />
                </div>
                <Spinner />
                <p className="text-sm font-medium text-slate-600">Reading invoiceâ€¦</p>
                <p className="text-xs text-slate-400">Comparing prices against your records</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-3">
              <UploadIcon />
              <div>
                <p className="text-slate-700 font-semibold text-[15px]">
                  Drop your invoice PDF or image here
                </p>
                <p className="text-slate-400 text-sm mt-0.5">Supports PDF, JPG, PNG Â· Max 10 MB</p>
              </div>
              <div className="flex gap-3 mt-2">
                <label className="cursor-pointer bg-slate-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Choose File
                  {/* TODO: Connect OCR API route here */}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled />
                </label>
                <button
                  onClick={simulateScan}
                  disabled={loading}
                  className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 shadow-sm"
                >
                  {loading ? "Scanningâ€¦" : "Run Demo Scan"}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>OCR integration is a template placeholder. Connect Google Document AI or AWS Textract to enable live invoice parsing.</span>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {scanned && (
        <div className="grid grid-cols-3 gap-4 animate-in">
          <div className={`card px-5 py-4 border-l-[3px] ${overcharges.length > 0 ? "border-l-red-500" : "border-l-emerald-500"}`}>
            <div className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Total Overcharge</div>
            <div className={`text-2xl font-bold ${overcharges.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {fmt(totalExtraSpend)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">on {overcharges.length} flagged items</div>
          </div>
          <div className="card px-5 py-4 border-l-[3px] border-l-red-500">
            <div className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Items Flagged</div>
            <div className="text-2xl font-bold text-red-600">{overcharges.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">price increases found</div>
          </div>
          <div className="card px-5 py-4 border-l-[3px] border-l-emerald-500">
            <div className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Items OK</div>
            <div className="text-2xl font-bold text-emerald-600">{okItems.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">no change from last order</div>
          </div>
        </div>
      )}

      {/* Alert banner */}
      {scanned && overcharges.length > 0 && (
        <div className="flex items-start gap-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4 animate-in">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-800 text-[15px]">
              Price creep detected on {overcharges.length} item{overcharges.length > 1 ? "s" : ""}
            </p>
            <p className="text-red-700 text-sm mt-0.5">
              You were overcharged <strong>{fmt(totalExtraSpend)}</strong> compared to your previous order.
              Call your salesman today and request a credit note.
            </p>
          </div>
        </div>
      )}

      {/* Results table */}
      {scanned && (
        <div className="card overflow-hidden animate-in delay-1">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 text-[15px]">Invoice Line Items</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Compared against your previous order prices</p>
            </div>
            <span className="text-[11px] text-slate-400">{items.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Previous</th>
                  <th className="px-4 py-3 text-right">Current</th>
                  <th className="px-4 py-3 text-right">Unit Diff</th>
                  <th className="px-4 py-3 text-right">Total Extra</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const extra = item.diff * item.quantity;
                  const flagged = item.diff > 0;
                  return (
                    <tr
                      key={i}
                      className={`border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/60 ${
                        flagged ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className={`font-medium ${flagged ? "text-slate-900" : "text-slate-700"}`}>
                          {item.item}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-500 text-[13px]">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-500 text-[13px]">
                        {fmt(item.previousPrice)}
                      </td>
                      <td className={`px-4 py-4 text-right font-semibold text-[13px] ${flagged ? "text-red-700" : "text-slate-700"}`}>
                        {fmt(item.currentPrice)}
                      </td>
                      <td className={`px-4 py-4 text-right font-bold ${flagged ? "text-red-600" : "text-slate-300"}`}>
                        {flagged ? `+${fmt(item.diff)}` : "â€”"}
                      </td>
                      <td className={`px-4 py-4 text-right font-bold ${extra > 0 ? "text-red-600" : "text-slate-300"}`}>
                        {extra > 0 ? `+${fmt(extra)}` : "â€”"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {flagged ? (
                          <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                            Overcharged
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            No Change
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={5} className="px-6 py-3.5 text-right text-sm font-semibold text-slate-600">
                    Total overcharge this invoice
                  </td>
                  <td className="px-4 py-3.5 text-right text-[16px] font-bold text-red-600">
                    {fmt(totalExtraSpend)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Price trend charts */}
      {scanned && (
        <div className="card p-6 animate-in delay-2">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900 text-[15px]">Price Trends â€” Last 8 Weeks</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Visual trend bars â€” integrate Recharts or Chart.js for interactive charts
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {Object.entries(PRICE_HISTORY).map(([key, history]) => {
              const min = Math.min(...history.map((x) => x.price));
              const max = Math.max(...history.map((x) => x.price));
              const range = max - min || 1;
              const trend = history[history.length - 1].price - history[0].price;

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-800 capitalize">{key}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend > 0 ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"}`}>
                      {trend > 0 ? "+" : ""}{fmt(trend)} trend
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-14">
                    {history.map((h, i) => {
                      const heightPct = ((h.price - min) / range) * 65 + 35;
                      const isLatest = i === history.length - 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${h.date}: ${fmt(h.price)}`}>
                          <div
                            className={`w-full rounded-t-[3px] transition-all ${isLatest ? "bg-orange-400" : "bg-slate-200"}`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-300 mt-1.5">
                    <span>{history[0].date}</span>
                    <span>{history[history.length - 1].date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

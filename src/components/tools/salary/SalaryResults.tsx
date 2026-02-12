"use client";

import type { TSalaryResult, ToolResult } from "@/types";

interface SalaryResultsProps {
  result: ToolResult | null;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function SalaryResults({ result }: SalaryResultsProps) {
  const data = result as TSalaryResult | null;

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  const { market_range, candidate_position } = data;
  const range = market_range ?? { p25: 0, p50: 0, p75: 0, p90: 0 };
  const pos = candidate_position ?? 50;

  return (
    <div className="space-y-6">
      {market_range && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Market Range</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>25th</span>
              <span>50th</span>
              <span>75th</span>
              <span>90th</span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div
                  className="bg-green-200"
                  style={{ width: "25%" }}
                />
                <div
                  className="bg-green-400"
                  style={{ width: "25%" }}
                />
                <div
                  className="bg-green-500"
                  style={{ width: "25%" }}
                />
                <div
                  className="bg-green-600"
                  style={{ width: "25%" }}
                />
              </div>
              <div
                className="absolute top-0 bottom-0 w-1 bg-gray-900 rounded-full"
                style={{ left: `${Math.min(100, Math.max(0, pos))}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-900">
              <span>{formatCurrency(range.p25)}</span>
              <span>{formatCurrency(range.p50)}</span>
              <span>{formatCurrency(range.p75)}</span>
              <span>{formatCurrency(range.p90)}</span>
            </div>
          </div>
        </div>
      )}

      {data.counter_offer_scripts && data.counter_offer_scripts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Counter-Offer Scripts</h3>
          <div className="space-y-4">
            {data.counter_offer_scripts.map((s, i) => (
              <div key={i} className="p-4 bg-green-50 rounded-xl">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">{s.scenario}</p>
                <p className="text-sm text-gray-800 italic">&ldquo;{s.script}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.negotiation_tactics && data.negotiation_tactics.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Negotiation Tactics</h3>
          <div className="space-y-4">
            {data.negotiation_tactics.map((t, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">{t.tactic}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-[10px] font-semibold text-green-700 uppercase mb-0.5">Do</p>
                    <p className="text-green-800">{t.do_this}</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <p className="text-[10px] font-semibold text-red-700 uppercase mb-0.5">Don&apos;t</p>
                    <p className="text-red-800">{t.dont_do}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

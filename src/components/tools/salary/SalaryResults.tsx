"use client";

import { Shield, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { ReportFlow } from "@/components/shared/ReportStructure";
import type { TSalaryResult, ToolResult } from "@/types";

interface SalaryResultsProps {
  result: ToolResult | null;
}

function formatCurrency(n: number, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(n);
}

export function SalaryResults({ result }: SalaryResultsProps) {
  const data = result as TSalaryResult | null;

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const { market_range, candidate_position } = data;
  const range = market_range ?? { p25: 0, p50: 0, p75: 0, p90: 0 };
  const pos = candidate_position ?? 50;
  const currency = data.currency || "USD";
  const leverage = data.leverage_assessment?.overall_leverage || "moderate";
  const summaryText =
    leverage === "strong"
      ? "You have strong leverage for this negotiation. Lead with evidence and anchor confidently."
      : leverage === "limited"
        ? "Your leverage is currently limited. Prioritize timing and total compensation components."
        : "You have moderate leverage. Use structured scripts and market evidence to improve outcomes.";

  const leverageColors: Record<string, string> = {
    strong: "bg-green-50 text-green-700 border-green-200",
    moderate: "bg-amber-50 text-amber-700 border-amber-200",
    limited: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <ReportFlow
      summary={
        <div className="surface-card-hero p-4">
          <p className="text-sm font-medium text-gray-900">{summaryText}</p>
        </div>
      }
      evidence={
        <>

          {/* Market Range */}
          {market_range && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Market Range</h3>
          {data.posted_salary_range && (
            <div className="mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800">
              Job posting range: <strong>{data.posted_salary_range}</strong>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>25th</span>
              <span>50th</span>
              <span>75th</span>
              <span>90th</span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="bg-green-200" style={{ width: "25%" }} />
                <div className="bg-green-400" style={{ width: "25%" }} />
                <div className="bg-green-500" style={{ width: "25%" }} />
                <div className="bg-green-600" style={{ width: "25%" }} />
              </div>
              <div
                className="absolute top-0 bottom-0 w-1 bg-gray-900 rounded-full"
                style={{ left: `${Math.min(100, Math.max(0, pos))}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-900">
              <span>{formatCurrency(range.p25, currency)}</span>
              <span>{formatCurrency(range.p50, currency)}</span>
              <span>{formatCurrency(range.p75, currency)}</span>
              <span>{formatCurrency(range.p90, currency)}</span>
            </div>
          </div>
          {market_range.data_caveat && (
            <p className="text-xs text-gray-400 mt-3 italic">{market_range.data_caveat}</p>
          )}
            </div>
          )}

      {/* Leverage Assessment */}
          {data.leverage_assessment && (
            <div className={`rounded-2xl border p-4 sm:p-5 ${leverageColors[data.leverage_assessment.overall_leverage || "moderate"] || leverageColors.moderate}`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Leverage Assessment: <span className="capitalize">{data.leverage_assessment.overall_leverage}</span>
          </h3>
          {data.leverage_assessment.factors && data.leverage_assessment.factors.length > 0 && (
            <div className="space-y-2 mb-3">
              {data.leverage_assessment.factors.map((f, i) => {
                const strengthIcons: Record<string, string> = { strong: "●", moderate: "◐", weak: "○" };
                return (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 mt-0.5">{strengthIcons[f.strength || "moderate"]}</span>
                    <div>
                      <span className="font-medium">{f.factor}</span>
                      {f.explanation && <span className="text-gray-600"> — {f.explanation}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {data.leverage_assessment.recommendation && (
            <p className="text-sm font-medium">{data.leverage_assessment.recommendation}</p>
          )}
            </div>
          )}

      {/* Counter-Offer Scripts */}
          {data.counter_offer_scripts && data.counter_offer_scripts.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Counter-Offer Scripts</h3>
          <div className="space-y-4">
            {data.counter_offer_scripts.map((s, i) => (
              <div key={i} className="p-4 bg-green-50 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-green-700 uppercase">{s.scenario}</p>
                <p className="text-sm text-gray-800 italic">&ldquo;{s.script}&rdquo;</p>
                {s.tone_guidance && (
                  <p className="text-xs text-gray-500">Tone: {s.tone_guidance}</p>
                )}
                {s.if_they_push_back && (
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase mb-0.5">If They Push Back</p>
                    <p className="text-xs text-amber-800">{s.if_they_push_back}</p>
                  </div>
                )}
                {s.walk_away_signal && (
                  <p className="text-xs text-red-600 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    Walk away: {s.walk_away_signal}
                  </p>
                )}
              </div>
            ))}
          </div>
            </div>
          )}

      {/* Negotiation Tactics */}
          {data.negotiation_tactics && data.negotiation_tactics.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Negotiation Tactics</h3>
          <div className="space-y-4">
            {data.negotiation_tactics.map((t, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">{t.tactic}</p>
                {t.when_to_use && <p className="text-xs text-gray-500">{t.when_to_use}</p>}
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
                {t.example && (
                  <p className="text-xs text-gray-500 italic">Example: {t.example}</p>
                )}
              </div>
            ))}
          </div>
            </div>
          )}

      {/* Beyond Base Salary */}
          {data.beyond_base_salary && data.beyond_base_salary.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Beyond Base Salary</h3>
          <div className="space-y-4">
            {data.beyond_base_salary.map((item, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                <p className="text-sm font-medium text-gray-900 capitalize">{item.component.replace(/_/g, " ")}</p>
                {item.typical_range && (
                  <p className="text-xs text-gray-500">Typical range: {item.typical_range}</p>
                )}
                {item.negotiation_script && (
                  <p className="text-xs text-gray-700 italic">&ldquo;{item.negotiation_script}&rdquo;</p>
                )}
                {item.when_to_push && (
                  <p className="text-xs text-blue-600">{item.when_to_push}</p>
                )}
              </div>
            ))}
          </div>
            </div>
          )}
        </>
      }
      nextStep={
        data.timing_strategy ? (
          <div className="report-section">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Timing Strategy
            </h3>
            <div className="space-y-2">
              {data.timing_strategy.when_to_discuss_salary && (
                <p className="text-sm text-gray-700">When: {data.timing_strategy.when_to_discuss_salary}</p>
              )}
              {data.timing_strategy.who_brings_it_up_first && (
                <p className="text-sm text-gray-700">Who goes first: {data.timing_strategy.who_brings_it_up_first}</p>
              )}
              {data.timing_strategy.anchoring_strategy && (
                <p className="text-sm text-gray-700">Anchoring: {data.timing_strategy.anchoring_strategy}</p>
              )}
            </div>
          </div>
        ) : null
      }
    />
  );
}

"use client";

import { Ring } from "@/components/shared/Ring";
import { AlertTriangle, Shield, ArrowRight, Lightbulb, DollarSign } from "lucide-react";
import type { TDisplacementResult, ToolResult } from "@/types";

interface DisplacementResultsProps {
  result: ToolResult | null;
}

export function DisplacementResults({ result }: DisplacementResultsProps) {
  const data = result as TDisplacementResult | null;

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.
      </div>
    );
  }

  const riskColors: Record<string, string> = {
    minimal: "bg-green-50 text-green-700",
    low: "bg-green-50 text-green-700",
    moderate: "bg-amber-50 text-amber-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <Ring score={data.score} size="lg" label="AI Risk" />
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${riskColors[data.risk_level] || riskColors.moderate}`}>
            {data.risk_level.toUpperCase()} RISK
          </span>
          <span className="text-xs text-gray-400">Timeline: {data.timeline}</span>
        </div>
        {data.headline && (
          <p className="text-sm text-gray-700 mt-3 max-w-md mx-auto">{data.headline}</p>
        )}
      </div>

      {/* Tasks at risk */}
      {data.tasks_at_risk && data.tasks_at_risk.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Tasks at Risk
          </h3>
          <div className="space-y-4">
            {data.tasks_at_risk.map((task, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{task.task}</p>
                    {task.ai_tool && <p className="text-xs text-gray-400">Threatened by: {task.ai_tool}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {task.time_spent_pct != null && (
                      <span className="text-[10px] text-gray-400">{task.time_spent_pct}% of day</span>
                    )}
                    <div className="w-20 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${task.risk_pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-red-600 w-8 text-right">{task.risk_pct}%</span>
                  </div>
                </div>
                {task.augmentation_tip && (
                  <div className="flex items-start gap-2 ml-1 p-2 bg-blue-50 rounded-lg">
                    <Lightbulb className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">{task.augmentation_tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe tasks */}
      {data.safe_tasks && data.safe_tasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Tasks That Are Safe
          </h3>
          <div className="space-y-3">
            {data.safe_tasks.map((task, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{task.task}</p>
                    {task.why_safe && <p className="text-xs text-gray-400">{task.why_safe}</p>}
                  </div>
                  <span className="text-xs font-bold text-green-600 ml-4">{task.risk_pct}%</span>
                </div>
                {task.monetization_potential && (
                  <p className="text-xs text-emerald-700 mt-1 ml-1 flex items-start gap-1.5">
                    <DollarSign className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    {task.monetization_potential}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {data.recommendations.map((rec, i) => {
              const isObj = typeof rec === "object";
              const text = isObj ? rec.action : rec;
              const typeColors: Record<string, string> = {
                upskill: "bg-blue-50 text-blue-700",
                augment: "bg-purple-50 text-purple-700",
                pivot: "bg-amber-50 text-amber-700",
                monetize: "bg-emerald-50 text-emerald-700",
              };
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{text}</p>
                    {isObj && (
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {rec.type && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[rec.type] || "bg-gray-100 text-gray-600"}`}>
                            {rec.type}
                          </span>
                        )}
                        {rec.resource && <span className="text-xs text-gray-500">{rec.resource}</span>}
                        {rec.time_investment && <span className="text-xs text-gray-400">• {rec.time_investment}</span>}
                      </div>
                    )}
                    {isObj && rec.expected_impact && (
                      <p className="text-xs text-gray-500 mt-0.5">{rec.expected_impact}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Industry benchmark */}
      {data.industry_benchmark && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500">
            Industry average: <strong className="text-gray-900">{data.industry_benchmark.average_score}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Your percentile: <strong className="text-gray-900">{data.industry_benchmark.percentile}th</strong>
          </p>
          {data.industry_benchmark.trend && (
            <p className="text-xs text-gray-400 mt-1">
              Trend: <span className={
                data.industry_benchmark.trend === "improving" ? "text-green-600" :
                data.industry_benchmark.trend === "worsening" ? "text-red-600" : "text-gray-600"
              }>{data.industry_benchmark.trend}</span>
            </p>
          )}
        </div>
      )}

      {/* Entrepreneurship opportunities (Track B) */}
      {data.entrepreneurship_opportunities && data.entrepreneurship_opportunities.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
          <h3 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Income Opportunities
          </h3>
          <div className="space-y-4">
            {data.entrepreneurship_opportunities.map((opp, i) => (
              <div key={i} className="bg-white/70 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900">{opp.opportunity}</p>
                {opp.why_you && <p className="text-xs text-gray-600 mt-1">{opp.why_you}</p>}
                <div className="flex items-center gap-4 mt-2">
                  {opp.income_potential && (
                    <span className="text-xs font-semibold text-emerald-700">{opp.income_potential}</span>
                  )}
                  {opp.first_step && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      {opp.first_step}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

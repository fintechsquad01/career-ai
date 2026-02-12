"use client";

import { Ring } from "@/components/shared/Ring";
import { AlertTriangle, Shield, ArrowRight } from "lucide-react";
import type { TDisplacementResult, ToolResult } from "@/types";

interface DisplacementResultsProps {
  result: ToolResult | null;
}

export function DisplacementResults({ result }: DisplacementResultsProps) {
  const data = result as TDisplacementResult | null;

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  const riskColors: Record<string, string> = {
    low: "bg-green-50 text-green-700",
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
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${riskColors[data.risk_level] || riskColors.medium}`}>
            {data.risk_level.toUpperCase()} RISK
          </span>
          <span className="text-xs text-gray-400">Timeline: {data.timeline}</span>
        </div>
      </div>

      {/* Tasks at risk */}
      {data.tasks_at_risk && data.tasks_at_risk.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Tasks at Risk
          </h3>
          <div className="space-y-3">
            {data.tasks_at_risk.map((task, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{task.task}</p>
                  {task.ai_tool && <p className="text-xs text-gray-400">Replaced by: {task.ai_tool}</p>}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-20 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${task.risk_pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-red-600 w-8 text-right">{task.risk_pct}%</span>
                </div>
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
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{task.task}</p>
                  {task.why_safe && <p className="text-xs text-gray-400">{task.why_safe}</p>}
                </div>
                <span className="text-xs font-bold text-green-600 ml-4">{task.risk_pct}%</span>
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
            {data.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry benchmark */}
      {data.industry_benchmark && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500">Industry average: <strong className="text-gray-900">{data.industry_benchmark.average_score}</strong></p>
          <p className="text-xs text-gray-500 mt-1">Your percentile: <strong className="text-gray-900">{data.industry_benchmark.percentile}th</strong></p>
        </div>
      )}
    </div>
  );
}

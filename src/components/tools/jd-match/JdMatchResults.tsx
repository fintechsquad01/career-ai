"use client";

import { Ring } from "@/components/shared/Ring";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { TJdMatchResult, ToolResult } from "@/types";

interface JdMatchResultsProps {
  result: ToolResult | null;
}

export function JdMatchResults({ result }: JdMatchResultsProps) {
  const data = result as TJdMatchResult | null;

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <Ring score={data.fit_score} size="lg" label="Fit Score" />
      </div>

      {data.requirements && data.requirements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Requirements Match</h3>
          <div className="space-y-3">
            {data.requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-3">
                {req.match === true ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : req.match === "partial" ? (
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{req.skill}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      req.priority === "req" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {req.priority === "req" ? "Required" : "Preferred"}
                    </span>
                  </div>
                  {req.evidence && <p className="text-xs text-gray-500 mt-0.5">{req.evidence}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.advantages && data.advantages.length > 0 && (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
          <h3 className="font-semibold text-green-900 mb-3">Your Advantages</h3>
          <ul className="space-y-2">
            {data.advantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {adv}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.critical_gaps && data.critical_gaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Critical Gaps</h3>
          <div className="space-y-3">
            {data.critical_gaps.map((gap, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{gap.gap}</p>
                  {gap.fix_time && <p className="text-xs text-gray-500">Estimated fix: {gap.fix_time}</p>}
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  gap.severity === "dealbreaker" ? "bg-red-50 text-red-700" :
                  gap.severity === "significant" ? "bg-amber-50 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {gap.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

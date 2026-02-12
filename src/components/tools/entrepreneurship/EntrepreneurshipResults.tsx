"use client";

import { Ring } from "@/components/shared/Ring";
import type { TEntrepreneurshipResult, ToolResult } from "@/types";

interface EntrepreneurshipResultsProps {
  result: ToolResult | null;
}

export function EntrepreneurshipResults({ result }: EntrepreneurshipResultsProps) {
  const data = result as TEntrepreneurshipResult | null;

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <Ring score={data.founder_market_fit} size="lg" label="Founder-Market Fit" />
      </div>

      {data.business_models && data.business_models.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Business Model Cards</h3>
          <div className="space-y-4">
            {data.business_models.map((bm, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{bm.model}</span>
                  <Ring score={bm.match_score} size="sm" showLabel={false} />
                </div>
                <p className="text-sm text-gray-600 mb-3">{bm.description}</p>
                {bm.first_steps?.length > 0 && (
                  <ul className="space-y-1">
                    {bm.first_steps.map((step, j) => (
                      <li key={j} className="text-xs text-gray-500 flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.risk_assessment && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Risk Assessment</h3>
          <p className="text-sm text-gray-700 mb-4">Tolerance: {data.risk_assessment.tolerance}</p>
          {data.risk_assessment.key_risks?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-red-600 uppercase mb-2">Key Risks</p>
              <ul className="space-y-1">
                {data.risk_assessment.key_risks.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700">• {r}</li>
                ))}
              </ul>
            </div>
          )}
          {data.risk_assessment.mitigations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase mb-2">Mitigations</p>
              <ul className="space-y-1">
                {data.risk_assessment.mitigations.map((m, i) => (
                  <li key={i} className="text-sm text-gray-700">• {m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {data.competitive_landscape && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Competitive Landscape</h3>
          <p className="text-sm text-gray-700">{data.competitive_landscape}</p>
        </div>
      )}

      {data.recommended_first_steps && data.recommended_first_steps.length > 0 && (
        <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
          <h3 className="font-semibold text-orange-900 mb-3">Recommended First Steps</h3>
          <ul className="space-y-2">
            {data.recommended_first_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-orange-800">
                <span className="font-bold">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

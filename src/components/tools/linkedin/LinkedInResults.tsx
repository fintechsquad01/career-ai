"use client";

import { Ring } from "@/components/shared/Ring";
import type { TLinkedInResult, ToolResult } from "@/types";

interface LinkedInResultsProps {
  result: ToolResult | null;
}

export function LinkedInResults({ result }: LinkedInResultsProps) {
  const data = result as TLinkedInResult | null;

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      {data.profile_strength_score != null && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <Ring score={data.profile_strength_score} size="md" label="Profile Strength" />
        </div>
      )}

      {data.headlines && data.headlines.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Headline Options</h3>
          <div className="space-y-4">
            {data.headlines.map((h, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-2">{h.text}</p>
                {h.search_keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {h.search_keywords.map((kw, j) => (
                      <span key={j} className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.about_section && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">About Section</h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{data.about_section}</p>
        </div>
      )}

      {data.keywords && data.keywords.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Keywords to Include</h3>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 bg-sky-50 text-sky-700 text-sm font-medium rounded-lg">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.experience_improvements && data.experience_improvements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Experience Improvements</h3>
          <div className="space-y-4">
            {data.experience_improvements.map((exp, i) => (
              <div key={i} className="space-y-2">
                <div className="text-xs text-gray-500">Current</div>
                <p className="text-sm text-gray-600 line-through">{exp.current}</p>
                <div className="text-xs text-gray-500">Improved</div>
                <p className="text-sm text-gray-900">{exp.improved}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

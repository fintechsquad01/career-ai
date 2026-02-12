"use client";

import { ExternalLink } from "lucide-react";
import type { TSkillsGapResult, ToolResult } from "@/types";

interface SkillsGapResultsProps {
  result: ToolResult | null;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "critical":
      return "bg-red-50 text-red-700";
    case "high":
      return "bg-amber-50 text-amber-700";
    case "medium":
      return "bg-blue-50 text-blue-700";
    case "low":
      return "bg-gray-100 text-gray-600";
    case "strength":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function SkillsGapResults({ result }: SkillsGapResultsProps) {
  const data = result as TSkillsGapResult | null;

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      {data.dataset_note && (
        <p className="text-xs text-gray-500 italic">{data.dataset_note}</p>
      )}

      {data.gaps && data.gaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Skills Ranked by Gap</h3>
          <div className="space-y-4">
            {data.gaps.map((gap, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{gap.skill}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(gap.priority)}`}>
                    {gap.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>You: {gap.current_level}/10</span>
                  <span>Required: {gap.required_level}/10</span>
                  {gap.time_to_close && <span>• {gap.time_to_close}</span>}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}
                  />
                </div>
                {gap.course && (
                  <a
                    href={gap.course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium min-h-[44px]"
                  >
                    {gap.course.name} ({gap.course.provider} — {gap.course.price})
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.learning_path && data.learning_path.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Learning Path</h3>
          <div className="space-y-4">
            {data.learning_path.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-20 text-xs font-semibold text-indigo-600">
                  {step.month_range}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.focus}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{step.actions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Calendar, Target, Users, BookOpen } from "lucide-react";
import type { TRoadmapResult, ToolResult } from "@/types";

interface RoadmapResultsProps {
  result: ToolResult | null;
}

function getPriorityBadge(priority: string) {
  const styles = {
    critical: "bg-red-50 text-red-700",
    high: "bg-amber-50 text-amber-700",
    medium: "bg-blue-50 text-blue-700",
    low: "bg-gray-100 text-gray-600",
  };
  return styles[priority as keyof typeof styles] ?? "bg-gray-100 text-gray-600";
}

export function RoadmapResults({ result }: RoadmapResultsProps) {
  const data = result as TRoadmapResult | null;

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      {data.milestones && data.milestones.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-4">
            {data.milestones.map((m, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-700">{m.month}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{m.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadge(m.priority)}`}>
                      {m.priority}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {m.actions.map((action, j) => (
                      <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-teal-500">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.networking_goals && data.networking_goals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            Networking Goals
          </h3>
          <ul className="space-y-2">
            {data.networking_goals.map((goal, i) => (
              <li key={i} className="text-sm text-gray-700">{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {data.application_targets && data.application_targets.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-600" />
            Application Targets
          </h3>
          <ul className="space-y-2">
            {data.application_targets.map((target, i) => (
              <li key={i} className="text-sm text-gray-700">{target}</li>
            ))}
          </ul>
        </div>
      )}

      {data.skill_development && data.skill_development.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Skill Development
          </h3>
          <ul className="space-y-2">
            {data.skill_development.map((skill, i) => (
              <li key={i} className="text-sm text-gray-700">{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

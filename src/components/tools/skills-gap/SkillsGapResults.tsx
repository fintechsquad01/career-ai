"use client";

import { CheckCircle, Lightbulb, AlertCircle } from "lucide-react";
import { ReportFlow } from "@/components/shared/ReportStructure";
import { CourseCard } from "@/components/shared/CourseCard";
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
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  // Support both old and new learning path fields
  const learningRoadmap = data.learning_roadmap || data.learning_path;

  return (
    <ReportFlow
      summary={
        <>
          {data.headline && (
            <div className="surface-card-hero p-4">
              <p className="text-sm text-blue-900 font-medium">{data.headline}</p>
            </div>
          )}
          {/* Transferable Skills (strengths first) */}
          {data.transferable_skills && data.transferable_skills.length > 0 && (
            <div className="surface-card-hero p-6">
          <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Your Transferable Strengths
          </h3>
          <div className="space-y-3">
            {data.transferable_skills.map((ts, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">{ts.skill}</p>
                  {ts.how_it_transfers && (
                    <p className="text-xs text-green-700 mt-0.5">{ts.how_it_transfers}</p>
                  )}
                </div>
                {ts.strength_level != null && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16 bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${ts.strength_level}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-green-700 w-8 text-right">{ts.strength_level}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
            </div>
          )}
        </>
      }
      evidence={
        <>
          {/* Gaps */}
          {data.gaps && data.gaps.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Skills Ranked by Gap</h3>
          <div className="space-y-5">
            {data.gaps.map((gap, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{gap.skill}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(gap.priority)}`}>
                    {gap.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>You: {gap.current_level}/100</span>
                  <span>Required: {gap.required_level}/100</span>
                  {gap.time_to_close && <span>• {gap.time_to_close}</span>}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (gap.current_level / gap.required_level) * 100)}%` }}
                  />
                </div>

                {/* Hiring manager perspective */}
                {gap.hiring_manager_perspective && (
                  <p className="text-xs text-gray-500 italic">{gap.hiring_manager_perspective}</p>
                )}

                {/* Quick win */}
                {gap.learning_path?.quick_win && (
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Quick win: {gap.learning_path.quick_win}</p>
                  </div>
                )}

                {/* Courses (new nested learning_path format — with affiliate links) */}
                {gap.learning_path?.courses && gap.learning_path.courses.length > 0 && (
                  <div className="space-y-1.5 ml-1">
                    {gap.learning_path.courses.map((c, j) => (
                      <CourseCard
                        key={j}
                        name={c.name}
                        provider={c.provider}
                        price={c.price}
                        duration={c.duration}
                        certificate={c.certificate}
                        urlHint={c.url_hint}
                        toolId="skills_gap"
                      />
                    ))}
                  </div>
                )}

                {/* Legacy course format — with affiliate link */}
                {!gap.learning_path?.courses && gap.course && (
                  <CourseCard
                    name={gap.course.name}
                    provider={gap.course.provider}
                    price={gap.course.price}
                    urlHint={gap.course.url}
                    toolId="skills_gap"
                  />
                )}

                {/* Portfolio project */}
                {gap.learning_path?.portfolio_project && (
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <p className="text-[10px] font-semibold text-indigo-700 uppercase mb-0.5">Portfolio Project</p>
                    <p className="text-xs text-gray-700">{gap.learning_path.portfolio_project.project}</p>
                    {gap.learning_path.portfolio_project.demonstrates && (
                      <p className="text-xs text-gray-500 mt-0.5">Demonstrates: {gap.learning_path.portfolio_project.demonstrates}</p>
                    )}
                    {gap.learning_path.portfolio_project.time_estimate && (
                      <p className="text-xs text-gray-400 mt-0.5">{gap.learning_path.portfolio_project.time_estimate}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
            </div>
          )}

          {/* Learning Roadmap */}
          {learningRoadmap && learningRoadmap.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Learning Roadmap</h3>
          <div className="space-y-4">
            {learningRoadmap.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-20 text-xs font-semibold text-indigo-600">
                  {step.month_range}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{step.focus}</p>
                  {typeof step.actions === "string" ? (
                    <p className="text-sm text-gray-600 mt-0.5">{step.actions}</p>
                  ) : Array.isArray(step.actions) ? (
                    <ul className="mt-0.5 space-y-0.5">
                      {step.actions.map((a, j) => (
                        <li key={j} className="text-sm text-gray-600">• {a}</li>
                      ))}
                    </ul>
                  ) : null}
                  {step.milestone && (
                    <p className="text-xs text-indigo-600 mt-1">Milestone: {step.milestone}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
            </div>
          )}
        </>
      }
      nextStep={
        <>
          {data.total_investment && (
            <div className="surface-card-soft p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Total Investment</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {data.total_investment.time && (
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-semibold text-gray-900">{data.total_investment.time}</p>
                  </div>
                )}
                {data.total_investment.cost && (
                  <div>
                    <p className="text-xs text-gray-500">Paid Courses</p>
                    <p className="text-sm font-semibold text-gray-900">{data.total_investment.cost}</p>
                  </div>
                )}
                {data.total_investment.free_alternative_cost && (
                  <div>
                    <p className="text-xs text-gray-500">Free Alternative</p>
                    <p className="text-sm font-semibold text-green-700">{data.total_investment.free_alternative_cost}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {data.dataset_note && (
            <div className="report-section">
              <p className="text-xs text-gray-500 italic">{data.dataset_note}</p>
            </div>
          )}
        </>
      }
    />
  );
}

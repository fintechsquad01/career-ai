"use client";

import { Calendar, Target, Users, BookOpen, AlertTriangle, AlertCircle } from "lucide-react";
import type { TRoadmapResult, ToolResult } from "@/types";

interface RoadmapResultsProps {
  result: ToolResult | null;
}

function getPriorityBadge(priority: string) {
  const styles: Record<string, string> = {
    critical: "bg-red-50 text-red-700",
    high: "bg-amber-50 text-amber-700",
    medium: "bg-blue-50 text-blue-700",
    low: "bg-gray-100 text-gray-600",
  };
  return styles[priority] ?? "bg-gray-100 text-gray-600";
}

function getTrackBadge(track?: string) {
  if (!track) return null;
  const styles: Record<string, { cls: string; label: string }> = {
    job_hunt: { cls: "bg-blue-50 text-blue-700", label: "Job Hunt" },
    income_build: { cls: "bg-emerald-50 text-emerald-700", label: "Income" },
    both: { cls: "bg-purple-50 text-purple-700", label: "Both" },
  };
  const s = styles[track];
  if (!s) return null;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

export function RoadmapResults({ result }: RoadmapResultsProps) {
  const data = result as TRoadmapResult | null;

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  // Resolve networking list from new or old format
  const networkingList: Array<{ who: string; where?: string; outreach_script?: string; goal?: string }> =
    data.networking_plan || (data.networking_goals?.map(g => ({ who: g })) ?? []);
  // Resolve skill development
  const skills = data.skill_development ?? [];

  return (
    <div className="report-shell">
      {/* Headline */}
      {data.headline && (
        <div className="surface-card-hero p-4">
          <p className="text-sm text-teal-900 font-medium">{data.headline}</p>
        </div>
      )}

      {/* Timeline */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-5">
            {data.milestones.map((m, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-700 whitespace-nowrap">{m.month}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{m.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadge(m.priority)}`}>
                      {m.priority}
                    </span>
                    {getTrackBadge(m.track)}
                  </div>
                  <ul className="space-y-1">
                    {m.actions.map((action, j) => {
                      const isObj = typeof action === "object";
                      const text = isObj ? action.action : action;
                      return (
                        <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-teal-500">•</span>
                          <div>
                            {text}
                            {isObj && action.deadline && (
                              <span className="text-xs text-gray-400 ml-2">by {action.deadline}</span>
                            )}
                            {isObj && action.time_required && (
                              <span className="text-xs text-gray-400 ml-1">({action.time_required})</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {m.success_criterion && (
                    <p className="text-xs text-green-700 flex items-start gap-1.5">
                      <Target className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {m.success_criterion}
                    </p>
                  )}
                  {m.if_stuck && (
                    <p className="text-xs text-amber-700 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      If stuck: {m.if_stuck}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Networking Plan */}
      {networkingList.length > 0 && (
        <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            Networking Plan
          </h3>
          <div className="space-y-3">
            {networkingList.map((item, i) => {
              const isObj = typeof item === "object" && "who" in item;
              if (!isObj) return <p key={i} className="text-sm text-gray-700">{String(item)}</p>;
              return (
                <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                  <p className="text-sm font-medium text-gray-900">{item.who}</p>
                  {item.where && <p className="text-xs text-gray-500">Where: {item.where}</p>}
                  {item.goal && <p className="text-xs text-gray-500">Goal: {item.goal}</p>}
                  {item.outreach_script && (
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Outreach Script</p>
                      <p className="text-xs text-gray-700 italic">{item.outreach_script}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Application Strategy */}
      {data.application_strategy && (
        <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-600" />
            Application Strategy
          </h3>
          <div className="space-y-2">
            {data.application_strategy.applications_per_week != null && (
              <p className="text-sm text-gray-700">
                Target: <strong>{data.application_strategy.applications_per_week}</strong> applications/week
              </p>
            )}
            {data.application_strategy.quality_over_quantity && (
              <p className="text-xs text-gray-500">{data.application_strategy.quality_over_quantity}</p>
            )}
            {data.application_strategy.target_companies && data.application_strategy.target_companies.length > 0 && (
              <ul className="space-y-1 mt-2">
                {data.application_strategy.target_companies.map((tc, i) => (
                  <li key={i} className="text-sm text-gray-700">• {tc}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Application Targets (legacy) */}
      {!data.application_strategy && data.application_targets && data.application_targets.length > 0 && (
        <div className="report-section">
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

      {/* Skill Development */}
      {skills.length > 0 && (
        <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Skill Development
          </h3>
          <ul className="space-y-2">
            {skills.map((skill, i) => {
              const isObj = typeof skill === "object";
              return (
                <li key={i} className="text-sm text-gray-700">
                  {isObj ? (
                    <div>
                      <span className="font-medium">{skill.skill}</span>
                      {skill.how && <span className="text-gray-500"> — {skill.how}</span>}
                      {skill.timeline && <span className="text-xs text-gray-400 ml-2">{skill.timeline}</span>}
                    </div>
                  ) : (
                    skill
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}


      {/* Risk Mitigation */}
      {data.risk_mitigation && (
        <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3">Risk Mitigation</h3>
          <div className="space-y-2">
            {data.risk_mitigation.biggest_risk && (
              <p className="text-sm text-red-700">Risk: {data.risk_mitigation.biggest_risk}</p>
            )}
            {data.risk_mitigation.mitigation && (
              <p className="text-sm text-gray-700">Mitigation: {data.risk_mitigation.mitigation}</p>
            )}
            {data.risk_mitigation.plan_b && (
              <p className="text-sm text-amber-700">Plan B: {data.risk_mitigation.plan_b}</p>
            )}
          </div>
        </div>
      )}

      {/* Total Investment */}
      {data.total_investment && (
        <div className="surface-card-soft p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Total Investment</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {data.total_investment.time_per_week && (
              <div>
                <p className="text-xs text-gray-500">Time/Week</p>
                <p className="text-sm font-semibold text-gray-900">{data.total_investment.time_per_week}</p>
              </div>
            )}
            {data.total_investment.financial_cost && (
              <div>
                <p className="text-xs text-gray-500">Cost</p>
                <p className="text-sm font-semibold text-gray-900">{data.total_investment.financial_cost}</p>
              </div>
            )}
            {data.total_investment.expected_roi && (
              <div>
                <p className="text-xs text-gray-500">Expected ROI</p>
                <p className="text-sm font-semibold text-green-700">{data.total_investment.expected_roi}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

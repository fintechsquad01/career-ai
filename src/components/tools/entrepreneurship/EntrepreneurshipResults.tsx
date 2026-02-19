"use client";

import { Ring } from "@/components/shared/Ring";
import { ReportFlow } from "@/components/shared/ReportStructure";
import { Lightbulb, Calendar, AlertTriangle, AlertCircle, Briefcase, DollarSign } from "lucide-react";
import { ToolCard } from "@/components/shared/CourseCard";
import type { TEntrepreneurshipResult, ToolResult } from "@/types";

interface EntrepreneurshipResultsProps {
  result: ToolResult | null;
}

export function EntrepreneurshipResults({ result }: EntrepreneurshipResultsProps) {
  const data = result as TEntrepreneurshipResult | null;

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  return (
    <ReportFlow
      summary={
        <>
          {/* Score hero */}
          <div className="report-section text-center">
        <Ring score={data.founder_market_fit} size="lg" label="Founder-Market Fit" />
        {data.headline && (
          <p className="text-sm text-gray-700 mt-3 max-w-md mx-auto">{data.headline}</p>
        )}
          </div>

          {/* Unfair Advantages */}
          {data.unfair_advantages && data.unfair_advantages.length > 0 && (
            <div className="surface-card-hero p-6">
          <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            Your Unfair Advantages
          </h3>
          <div className="space-y-3">
            {data.unfair_advantages.map((ua, i) => (
              <div key={i} className="bg-white/70 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900">{ua.advantage}</p>
                {ua.why_it_matters && <p className="text-xs text-purple-700 mt-1">{ua.why_it_matters}</p>}
                {ua.monetization && (
                  <p className="text-xs text-emerald-700 mt-1 flex items-start gap-1">
                    <DollarSign className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    {ua.monetization}
                  </p>
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

          {/* Psychological Fit */}
          {data.psychological_fit && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Psychological Fit</h3>
          <div className="space-y-3">
            {data.psychological_fit.risk_profile && (
              <p className="text-sm text-gray-700">
                Risk profile: <strong className="capitalize">{data.psychological_fit.risk_profile}</strong>
              </p>
            )}
            {data.psychological_fit.strengths && data.psychological_fit.strengths.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase mb-1">Strengths</p>
                <ul className="space-y-1">
                  {data.psychological_fit.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-700">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.psychological_fit.watch_outs && data.psychological_fit.watch_outs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Watch Outs</p>
                <ul className="space-y-1">
                  {data.psychological_fit.watch_outs.map((w, i) => (
                    <li key={i} className="text-sm text-gray-700">• {w}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.psychological_fit.recommendation && (
              <p className="text-sm text-gray-600 italic">{data.psychological_fit.recommendation}</p>
            )}
          </div>
            </div>
          )}

      {/* Business Models */}
          {data.business_models && data.business_models.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Business Model Cards</h3>
          <div className="space-y-4">
            {data.business_models.map((bm, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{bm.model}</span>
                  <Ring score={bm.match_score} size="sm" showLabel={false} />
                </div>
                <p className="text-sm text-gray-600">{bm.description}</p>
                {bm.why_this_fits && <p className="text-xs text-purple-700">{bm.why_this_fits}</p>}

                {/* Income projections */}
                {(bm.month_1_income || bm.month_6_income || bm.month_12_income) && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {bm.month_1_income && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500">Month 1</p>
                        <p className="text-xs font-semibold text-gray-900">{bm.month_1_income}</p>
                      </div>
                    )}
                    {bm.month_6_income && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500">Month 6</p>
                        <p className="text-xs font-semibold text-gray-900">{bm.month_6_income}</p>
                      </div>
                    )}
                    {bm.month_12_income && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-[10px] text-gray-500">Month 12</p>
                        <p className="text-xs font-semibold text-emerald-700">{bm.month_12_income}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Details */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {bm.startup_cost && <span>Cost: {bm.startup_cost}</span>}
                  {bm.time_to_first_revenue && <span>Revenue in: {bm.time_to_first_revenue}</span>}
                  {bm.runs_alongside_job_hunt != null && (
                    <span className={bm.runs_alongside_job_hunt ? "text-green-600" : "text-amber-600"}>
                      {bm.runs_alongside_job_hunt ? "Works alongside job hunt" : "Needs dedicated time"}
                    </span>
                  )}
                </div>

                {/* First steps */}
                {bm.first_steps?.length > 0 && (
                  <ul className="space-y-1">
                    {bm.first_steps.map((step, j) => {
                      const isObj = typeof step === "object";
                      const text = isObj ? step.step : step;
                      return (
                        <li key={j} className="text-xs text-gray-500 flex items-start gap-2">
                          <span className="text-orange-500">•</span>
                          <div>
                            {text}
                            {isObj && step.this_week && (
                              <span className="text-[10px] font-bold text-orange-600 ml-1">THIS WEEK</span>
                            )}
                            {isObj && step.cost && <span className="text-gray-400 ml-1">({step.cost})</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Tools needed — with affiliate links */}
                {bm.tools_needed && bm.tools_needed.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bm.tools_needed.map((tool, j) => (
                      <ToolCard
                        key={j}
                        tool={tool.tool}
                        cost={tool.cost}
                        whatFor={tool.what_for}
                        toolId="entrepreneurship"
                      />
                    ))}
                  </div>
                )}

                {bm.scalability && (
                  <p className="text-xs text-gray-500">Scalability: {bm.scalability}</p>
                )}
              </div>
            ))}
          </div>
            </div>
          )}

      {/* 90-Day Launch Plan */}
          {data.ninety_day_launch_plan && (
            <div className="surface-card-hero p-6">
          <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            90-Day Launch Plan
          </h3>
          <div className="space-y-3">
            {data.ninety_day_launch_plan.week_1_2 && (
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Week 1-2</p>
                <p className="text-sm text-gray-700">{data.ninety_day_launch_plan.week_1_2.focus}</p>
                {data.ninety_day_launch_plan.week_1_2.deliverable && (
                  <p className="text-xs text-gray-500 mt-0.5">Deliverable: {data.ninety_day_launch_plan.week_1_2.deliverable}</p>
                )}
                {data.ninety_day_launch_plan.week_1_2.income_target && (
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{data.ninety_day_launch_plan.week_1_2.income_target}</p>
                )}
              </div>
            )}
            {data.ninety_day_launch_plan.week_3_4 && (
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Week 3-4</p>
                <p className="text-sm text-gray-700">{data.ninety_day_launch_plan.week_3_4.focus}</p>
                {data.ninety_day_launch_plan.week_3_4.deliverable && (
                  <p className="text-xs text-gray-500 mt-0.5">Deliverable: {data.ninety_day_launch_plan.week_3_4.deliverable}</p>
                )}
                {data.ninety_day_launch_plan.week_3_4.income_target && (
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{data.ninety_day_launch_plan.week_3_4.income_target}</p>
                )}
              </div>
            )}
            {data.ninety_day_launch_plan.month_2 && (
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Month 2</p>
                <p className="text-sm text-gray-700">{data.ninety_day_launch_plan.month_2.focus}</p>
                {data.ninety_day_launch_plan.month_2.deliverable && (
                  <p className="text-xs text-gray-500 mt-0.5">Deliverable: {data.ninety_day_launch_plan.month_2.deliverable}</p>
                )}
                {data.ninety_day_launch_plan.month_2.income_target && (
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{data.ninety_day_launch_plan.month_2.income_target}</p>
                )}
              </div>
            )}
            {data.ninety_day_launch_plan.month_3 && (
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Month 3</p>
                <p className="text-sm text-gray-700">{data.ninety_day_launch_plan.month_3.focus}</p>
                {data.ninety_day_launch_plan.month_3.deliverable && (
                  <p className="text-xs text-gray-500 mt-0.5">Deliverable: {data.ninety_day_launch_plan.month_3.deliverable}</p>
                )}
                {data.ninety_day_launch_plan.month_3.income_target && (
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{data.ninety_day_launch_plan.month_3.income_target}</p>
                )}
              </div>
            )}
          </div>
            </div>
          )}

      {/* Risk Assessment */}
          {data.risk_assessment && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Risk Assessment
          </h3>
          {data.risk_assessment.tolerance && (
            <p className="text-sm text-gray-700 mb-3">Tolerance: {data.risk_assessment.tolerance}</p>
          )}
          <div className="space-y-3">
            {data.risk_assessment.biggest_risk && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-xs font-semibold text-red-700 uppercase mb-0.5">Biggest Risk</p>
                <p className="text-sm text-red-800">{data.risk_assessment.biggest_risk}</p>
              </div>
            )}
            {data.risk_assessment.mitigation && (
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs font-semibold text-green-700 uppercase mb-0.5">Mitigation</p>
                <p className="text-sm text-green-800">{data.risk_assessment.mitigation}</p>
              </div>
            )}
            {data.risk_assessment.exit_plan && (
              <div className="p-3 bg-amber-50 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-0.5">Exit Plan</p>
                <p className="text-sm text-amber-800">{data.risk_assessment.exit_plan}</p>
              </div>
            )}
            {/* Legacy key_risks format */}
            {data.risk_assessment.key_risks && data.risk_assessment.key_risks.length > 0 && !data.risk_assessment.biggest_risk && (
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase mb-2">Key Risks</p>
                <ul className="space-y-1">
                  {data.risk_assessment.key_risks.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700">• {r}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.risk_assessment.mitigations && data.risk_assessment.mitigations.length > 0 && !data.risk_assessment.mitigation && (
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
            </div>
          )}

      {/* Job Hunt Synergy */}
      {data.job_hunt_synergy && (
        <div className="surface-card-hero p-5">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            How This Helps Your Job Hunt
          </h3>
          <p className="text-sm text-gray-700">{data.job_hunt_synergy}</p>
        </div>
      )}

      {/* Legacy: competitive landscape & first steps */}
          {data.competitive_landscape && !data.unfair_advantages && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3">Competitive Landscape</h3>
          <p className="text-sm text-gray-700">{data.competitive_landscape}</p>
            </div>
          )}

          {data.recommended_first_steps && data.recommended_first_steps.length > 0 && !data.ninety_day_launch_plan && (
            <div className="surface-card-hero p-6">
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
        </>
      }
      nextStep={
        data.job_hunt_synergy ? (
          <div className="surface-card-hero p-5">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              How This Helps Your Job Hunt
            </h3>
            <p className="text-sm text-gray-700">{data.job_hunt_synergy}</p>
          </div>
        ) : null
      }
    />
  );
}

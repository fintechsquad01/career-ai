"use client";

import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { ReportFlow } from "@/components/shared/ReportStructure";
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Target } from "lucide-react";
import type { TJdMatchResult, ToolResult } from "@/types";

interface JdMatchResultsProps {
  result: ToolResult | null;
}

export function JdMatchResults({ result }: JdMatchResultsProps) {
  const data = result as TJdMatchResult | null;

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const priorityLabel = (p: string) => {
    if (p === "req" || p === "required") return { label: "Required", cls: "bg-red-50 text-red-600" };
    if (p === "implied") return { label: "Implied", cls: "bg-purple-50 text-purple-600" };
    return { label: "Preferred", cls: "bg-gray-100 text-gray-500" };
  };

  return (
    <ReportFlow
      summary={
        <div className="report-section text-center celebrate">
        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{data.headline || ''}</p>
        <Ring score={data.fit_score} size="lg" label="Fit Score" />
        </div>
      }
      evidence={
        <>

          {/* Requirements Match */}
          {data.requirements && data.requirements.length > 0 && (
            <div className="report-section">
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
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${priorityLabel(req.priority).cls}`}>
                      {priorityLabel(req.priority).label}
                    </span>
                  </div>
                  {req.evidence && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">&ldquo;{req.evidence}&rdquo;</p>
                  )}
                  {req.recruiter_note && (
                    <p className="text-xs text-gray-400 mt-0.5">{req.recruiter_note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
            </div>
          )}

      {/* Advantages */}
          {data.advantages && data.advantages.length > 0 && (
            <div className="surface-card-hero p-6">
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

      {/* Critical Gaps */}
          {data.critical_gaps && data.critical_gaps.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Critical Gaps</h3>
          <div className="space-y-4">
            {data.critical_gaps.map((gap, i) => {
              const severityColors: Record<string, string> = {
                dealbreaker: "bg-red-50 text-red-700",
                significant: "bg-amber-50 text-amber-700",
                minor: "bg-gray-100 text-gray-600",
                learnable_on_job: "bg-blue-50 text-blue-600",
              };
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{gap.gap}</p>
                      {gap.fix_time && <p className="text-xs text-gray-500">Estimated fix: {gap.fix_time}</p>}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColors[gap.severity] || "bg-gray-100 text-gray-600"}`}>
                      {gap.severity.replace(/_/g, " ")}
                    </span>
                  </div>
                  {gap.recruiter_perspective && (
                    <p className="text-xs text-gray-500 italic">{gap.recruiter_perspective}</p>
                  )}
                  {gap.fix_action && (
                    <p className="text-xs text-blue-700">
                      Fix: {gap.fix_action}
                      {gap.fix_resource && <span className="text-gray-500"> — {gap.fix_resource}</span>}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
            </div>
          )}

      {/* Hidden Requirements */}
          {data.hidden_requirements && data.hidden_requirements.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            Hidden Requirements
          </h3>
          <div className="space-y-3">
            {data.hidden_requirements.map((hr, i) => (
              <div key={i} className="flex items-start gap-3">
                {hr.candidate_has_it ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-900">{hr.requirement}</p>
                  {hr.why_implied && <p className="text-xs text-gray-400">{hr.why_implied}</p>}
                </div>
              </div>
            ))}
          </div>
            </div>
          )}

      {/* Application Strategy */}
          {data.application_strategy && (
            <div className="surface-card-hero p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Application Strategy
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                data.application_strategy.should_apply ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {data.application_strategy.should_apply ? "Recommended to apply" : "Consider preparing first"}
              </span>
            </div>
            {data.application_strategy.positioning_statement && (
              <div>
                <p className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Positioning Statement</p>
                <p className="text-sm text-gray-800 italic">{data.application_strategy.positioning_statement}</p>
              </div>
            )}
            {data.application_strategy.resume_tweaks && data.application_strategy.resume_tweaks.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Resume Tweaks Before Applying</p>
                <ul className="space-y-1">
                  {data.application_strategy.resume_tweaks.map((tweak, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {tweak}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.application_strategy.referral_advice && (
              <p className="text-xs text-gray-600">{data.application_strategy.referral_advice}</p>
            )}
          </div>
            </div>
          )}


      {/* Applicant Pool */}
          {data.applicant_pool_estimate && (
            <div className="surface-card-soft p-5 text-center">
          <p className="text-xs text-gray-500">
            Estimated applicants: <strong className="text-gray-900">~{data.applicant_pool_estimate.likely_applicants}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Your estimated rank: <strong className="text-gray-900">Top {data.applicant_pool_estimate.candidate_percentile}%</strong>
          </p>
          {data.applicant_pool_estimate.reasoning && (
            <p className="text-xs text-gray-400 mt-1">{data.applicant_pool_estimate.reasoning}</p>
          )}
            </div>
          )}
        </>
      }
      nextStep={
        data.critical_gaps && data.critical_gaps.length > 0 ? (
          <div className="surface-card-hero p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Address these gaps before you apply</p>
              <p className="text-xs text-gray-500">Resume Optimizer maps each gap to targeted resume updates.</p>
            </div>
            <Link href="/tools/resume" className="text-sm font-semibold text-violet-700 hover:text-violet-900 whitespace-nowrap">Optimize Resume →</Link>
          </div>
        ) : null
      }
    />
  );
}

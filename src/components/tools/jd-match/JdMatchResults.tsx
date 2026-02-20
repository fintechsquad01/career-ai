"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { ReportFlow } from "@/components/shared/ReportStructure";
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Target } from "lucide-react";
import type { TJdMatchResult, ToolResult } from "@/types";
import { track } from "@/lib/analytics";

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
    if (p === "implied") return { label: "Implied", cls: "bg-indigo-50 text-indigo-600" };
    return { label: "Preferred", cls: "bg-gray-100 text-gray-500" };
  };

  const verdictBand = useMemo(() => {
    if (data.result_meta?.verdict_band) return data.result_meta.verdict_band;
    if (data.verdict_band) return data.verdict_band;
    if (data.fit_score <= 30) return "low";
    if (data.fit_score <= 55) return "mid";
    if (data.fit_score <= 80) return "high";
    return "top_match";
  }, [data.fit_score, data.verdict_band]);

  const evidenceCoverage = useMemo(() => {
    if (data.result_meta?.evidence_coverage) return data.result_meta.evidence_coverage;
    if (data.evidence_coverage) return data.evidence_coverage;
    const reqs = Array.isArray(data.requirements) ? data.requirements : [];
    const required = reqs.filter((r) => r.priority === "req" || r.priority === "required");
    const source = required.length > 0 ? required : reqs;
    const total = source.length;
    const matched = source.filter((r) => r.match === true || r.match === "partial").length;
    return { matched_required: matched, total_required: total };
  }, [data.evidence_coverage, data.requirements]);

  const confidenceLevel = useMemo(() => {
    if (data.result_meta?.confidence_level) return data.result_meta.confidence_level;
    if (data.confidence_level) return data.confidence_level;
    const total = evidenceCoverage.total_required || 0;
    if (total < 2) return "low";
    const ratio = total > 0 ? evidenceCoverage.matched_required / total : 0;
    if (ratio >= 0.75) return "high";
    if (ratio >= 0.4) return "medium";
    return "low";
  }, [data.confidence_level, evidenceCoverage]);

  const topGaps = (data.critical_gaps || []).slice(0, 3);
  const primaryActions = ((data.application_strategy?.resume_tweaks || []).filter(Boolean) as string[]).slice(0, 3);

  useEffect(() => {
    const ratio = evidenceCoverage.total_required > 0
      ? evidenceCoverage.matched_required / evidenceCoverage.total_required
      : 0;
    track("result_verdict_viewed", {
      tool_id: "jd_match",
      fit_score: data.fit_score,
      verdict_band: verdictBand,
      confidence_level: confidenceLevel,
      evidence_coverage_ratio: Number(ratio.toFixed(2)),
    });
  }, [confidenceLevel, data.fit_score, evidenceCoverage, verdictBand]);

  return (
    <ReportFlow
      summary={
        <div className="report-section celebrate space-y-4">
          <div className="text-center">
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-3">{data.headline || ""}</p>
            <Ring score={data.fit_score} size="md" label="Fit Score" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs">
            <div className="surface-card-soft p-3">
              <p className="text-gray-500 uppercase tracking-wide text-[10px] mb-1">Verdict</p>
              <p className="font-semibold text-gray-900 capitalize">{verdictBand.replace("_", " ")}</p>
            </div>
            <div className="surface-card-soft p-3">
              <p className="text-gray-500 uppercase tracking-wide text-[10px] mb-1">Confidence</p>
              <p className="font-semibold text-gray-900 capitalize">{confidenceLevel}</p>
            </div>
            <div className="surface-card-soft p-3">
              <p className="text-gray-500 uppercase tracking-wide text-[10px] mb-1">Evidence coverage</p>
              <p className="font-semibold text-gray-900">
                {evidenceCoverage.matched_required}/{evidenceCoverage.total_required || 0} required
              </p>
            </div>
          </div>
        </div>
      }
      evidence={
        <>
          {/* Decision-first action plan */}
          <div className="surface-card-hero p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Action plan</h3>
            <ul className="space-y-1.5">
              {(primaryActions.length > 0
                ? primaryActions
                : [
                    "Run Resume Optimizer to close the highest-priority requirement gaps.",
                    "Update role-specific achievements before applying.",
                    "Re-run JD Match after updates to validate progress.",
                  ]
              ).map((step, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top gaps compact cards */}
          {topGaps.length > 0 && (
            <div className="report-section">
              <h3 className="font-semibold text-gray-900 mb-3">Top gaps to close</h3>
              <div className="space-y-3">
                {topGaps.map((gap, i) => {
                  const severityColors: Record<string, string> = {
                    dealbreaker: "bg-red-50 text-red-700",
                    significant: "bg-amber-50 text-amber-700",
                    minor: "bg-gray-100 text-gray-600",
                    learnable_on_job: "bg-blue-50 text-blue-600",
                  };
                  return (
                    <div key={i} className="surface-card-soft p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-gray-900">{gap.gap}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${severityColors[gap.severity] || "bg-gray-100 text-gray-600"}`}>
                          {gap.severity.replace(/_/g, " ")}
                        </span>
                      </div>
                      {gap.fix_action && (
                        <p className="text-xs text-blue-700 mt-1">Next: {gap.fix_action}</p>
                      )}
                      {gap.fix_time && (
                        <p className="text-xs text-gray-500 mt-1">Effort: {gap.fix_time}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed evidence */}
          <details className="report-section">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900">Why this verdict (details)</summary>
            <div className="mt-3 space-y-6">
              {data.requirements && data.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements Match</h4>
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

              {data.advantages && data.advantages.length > 0 && (
                <div className="surface-card-hero p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Your Advantages</h4>
                  <ul className="space-y-1.5">
                    {data.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.hidden_requirements && data.hidden_requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    Hidden Requirements
                  </h4>
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

              {data.application_strategy && (
                <div className="surface-card-hero p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Application Strategy
                  </h4>
                  <div className="space-y-2">
                    <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${
                      data.application_strategy.should_apply ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {data.application_strategy.should_apply ? "Recommended to apply" : "Consider preparing first"}
                    </span>
                    {data.application_strategy.positioning_statement && (
                      <p className="text-sm text-gray-800 italic">{data.application_strategy.positioning_statement}</p>
                    )}
                    {data.application_strategy.referral_advice && (
                      <p className="text-xs text-gray-600">{data.application_strategy.referral_advice}</p>
                    )}
                  </div>
                </div>
              )}

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
              {data.critical_gaps && data.critical_gaps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">All critical gaps</h4>
                  <div className="space-y-3">
                    {data.critical_gaps.map((gap, i) => (
                      <div key={i} className="text-xs text-gray-600">
                        <p className="font-semibold text-gray-900">{gap.gap}</p>
                        {gap.recruiter_perspective && <p className="italic mt-1">{gap.recruiter_perspective}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        </>
      }
      nextStep={
        data.critical_gaps && data.critical_gaps.length > 0 ? (
          <div className="surface-card-hero p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-900">Start here now: address these gaps before you apply</p>
              <p className="text-xs text-gray-500">Resume Optimizer maps each gap to targeted resume updates.</p>
              <p className="text-xs text-gray-600 mt-1">Effort: 15 tokens · ~45-60 sec</p>
            </div>
            <Link
              href="/tools/resume"
              className="inline-flex items-center justify-center w-full sm:w-auto text-sm font-semibold text-blue-700 hover:text-blue-900"
              onClick={() =>
                track("jd_primary_next_action_clicked", {
                  tool_id: "jd_match",
                  next_tool_id: "resume",
                  fit_score: data.fit_score,
                  verdict_band: verdictBand,
                })
              }
            >
              Optimize Resume →
            </Link>
          </div>
        ) : null
      }
    />
  );
}

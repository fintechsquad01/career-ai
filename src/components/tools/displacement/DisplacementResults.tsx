"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Ring } from "@/components/shared/Ring";
import { ReportFlow } from "@/components/shared/ReportStructure";
import { AlertTriangle, Shield, Lightbulb, DollarSign, Twitter, Linkedin } from "lucide-react";
import type { TDisplacementResult, ToolResult } from "@/types";

interface DisplacementResultsProps {
  result: ToolResult | null;
}

export function DisplacementResults({ result }: DisplacementResultsProps) {
  const data = result as TDisplacementResult | null;

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const riskColors: Record<string, string> = {
    minimal: "bg-green-50 text-green-700",
    low: "bg-green-50 text-green-700",
    moderate: "bg-amber-50 text-amber-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
    critical: "bg-red-100 text-red-800",
  };

  const verdictBand = useMemo(() => {
    if (data.result_meta?.verdict_band) return data.result_meta.verdict_band;
    if (data.score <= 20) return "low";
    if (data.score <= 45) return "mid";
    if (data.score <= 70) return "high";
    return "top_match";
  }, [data.result_meta?.verdict_band, data.score]);

  const evidenceCoverage = useMemo(() => {
    if (data.result_meta?.evidence_coverage) return data.result_meta.evidence_coverage;
    const checks = [
      typeof data.score === "number",
      !!data.risk_level,
      Array.isArray(data.tasks_at_risk) && data.tasks_at_risk.length > 0,
      Array.isArray(data.recommendations) && data.recommendations.length > 0,
    ];
    return {
      matched_required: checks.filter(Boolean).length,
      total_required: checks.length,
    };
  }, [data.result_meta?.evidence_coverage, data.recommendations, data.risk_level, data.score, data.tasks_at_risk]);

  const confidenceLevel = useMemo(() => {
    if (data.result_meta?.confidence_level) return data.result_meta.confidence_level;
    const ratio = evidenceCoverage.total_required > 0
      ? evidenceCoverage.matched_required / evidenceCoverage.total_required
      : 0;
    if (ratio >= 0.75) return "high";
    if (ratio >= 0.4) return "medium";
    return "low";
  }, [data.result_meta?.confidence_level, evidenceCoverage]);

  return (
    <ReportFlow
      summary={
        <div className="report-section text-center celebrate">
        <p className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{data.headline || ''}</p>
        <Ring score={data.score} size="lg" label="AI Risk" />
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${riskColors[data.risk_level] || riskColors.moderate}`}>
            {data.risk_level.toUpperCase()} RISK
          </span>
          <span className="text-xs text-gray-400">Timeline: {data.timeline}</span>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs">
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
              {evidenceCoverage.matched_required}/{evidenceCoverage.total_required} required
            </p>
          </div>
        </div>
        </div>
      }
      evidence={
        <>

          {/* Tasks at risk — lead with augmentation tips (empowering, not scary) */}
          {data.tasks_at_risk && data.tasks_at_risk.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            How to Use AI to Your Advantage
          </h3>
          <p className="text-xs text-gray-500 mb-4">Each task at risk has an AI augmentation strategy — use these tools to become more productive, not replaced.</p>
          <div className="space-y-4">
            {data.tasks_at_risk.map((task, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Augmentation tip — primary callout */}
                {task.augmentation_tip && (
                  <div className="bg-blue-50 p-3 border-b border-blue-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900 font-medium">{task.augmentation_tip}</p>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{task.task}</p>
                      {task.ai_tool && <p className="text-xs text-gray-400">AI tool: {task.ai_tool}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {task.time_spent_pct != null && (
                        <span className="text-[10px] text-gray-400">{task.time_spent_pct}% of day</span>
                      )}
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${task.risk_pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-blue-600 w-8 text-right">{task.risk_pct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </div>
          )}

      {/* Safe tasks */}
          {data.safe_tasks && data.safe_tasks.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Tasks That Are Safe
          </h3>
          <div className="space-y-3">
            {data.safe_tasks.map((task, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{task.task}</p>
                    {task.why_safe && <p className="text-xs text-gray-400">{task.why_safe}</p>}
                  </div>
                  <span className="text-xs font-bold text-green-600 ml-4">{task.risk_pct}%</span>
                </div>
                {task.monetization_potential && (
                  <p className="text-xs text-emerald-700 mt-1 ml-1 flex items-start gap-1.5">
                    <DollarSign className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    {task.monetization_potential}
                  </p>
                )}
              </div>
            ))}
          </div>
            </div>
          )}

      {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Priority Actions</h3>
          <div className="space-y-3">
            {data.recommendations.map((rec, i) => {
              const isObj = typeof rec === "object";
              const text = isObj ? rec.action : rec;
              const typeColors: Record<string, string> = {
                upskill: "bg-blue-50 text-blue-700",
                augment: "bg-indigo-50 text-indigo-700",
                pivot: "bg-amber-50 text-amber-700",
                monetize: "bg-emerald-50 text-emerald-700",
              };
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{text}</p>
                    {isObj && (
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {rec.type && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[rec.type] || "bg-gray-100 text-gray-600"}`}>
                            {rec.type}
                          </span>
                        )}
                        {rec.resource && <span className="text-xs text-gray-500">{rec.resource}</span>}
                        {rec.time_investment && <span className="text-xs text-gray-400">• {rec.time_investment}</span>}
                      </div>
                    )}
                    {isObj && rec.expected_impact && (
                      <p className="text-xs text-gray-500 mt-0.5">{rec.expected_impact}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          )}

      {/* Industry benchmark */}
          {data.industry_benchmark && (
            <div className="surface-card-soft p-5 text-center">
          <p className="text-xs text-gray-500">
            Industry average: <strong className="text-gray-900">{data.industry_benchmark.average_score}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Your percentile: <strong className="text-gray-900">{data.industry_benchmark.percentile}th</strong>
          </p>
          {data.industry_benchmark.trend && (
            <p className="text-xs text-gray-400 mt-1">
              Trend: <span className={
                data.industry_benchmark.trend === "improving" ? "text-green-600" :
                data.industry_benchmark.trend === "worsening" ? "text-red-600" : "text-gray-600"
              }>{data.industry_benchmark.trend}</span>
            </p>
          )}
            </div>
          )}

      {/* Income Opportunities — Track B */}
          {data.entrepreneurship_opportunities && Array.isArray(data.entrepreneurship_opportunities) && data.entrepreneurship_opportunities.length > 0 && (
            <div className="report-section space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            Income Opportunities
          </h3>
          <div className="grid gap-3">
            {data.entrepreneurship_opportunities.map((opp, i) => (
              <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">{opp.opportunity}</p>
                {opp.why_you && <p className="text-xs text-gray-600">{opp.why_you}</p>}
                <div className="flex items-center justify-between text-xs">
                  {opp.income_potential && (
                    <span className="text-green-700 font-medium">{opp.income_potential}</span>
                  )}
                  {opp.first_step && (
                    <span className="text-gray-500">First step: {opp.first_step}</span>
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
        <div className="surface-card-hero p-5 text-center">
        <p className="text-sm font-semibold text-gray-900 mb-1">Start here now: run Job Match Score on your target role</p>
        <p className="text-xs text-gray-500 mb-4">
          Turn this risk signal into a role-specific action plan with requirement gaps and fixes.
        </p>
        <p className="text-xs text-gray-600 mb-4">Effort: 5 tokens · ~30 sec</p>
        <Link
          href="/tools/jd_match"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[44px]"
        >
          Run Job Match Score
        </Link>
        </div>
      }
      actions={
        <div className="report-section">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">Other actions</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My AI displacement risk score is ${data.score}/100. Benchmark your role risk:`)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://aiskillscore.com")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <Twitter className="w-4 h-4" />
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "https://aiskillscore.com")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <Linkedin className="w-4 h-4" />
              Share on LinkedIn
            </a>
          </div>
        </div>
      }
    />
  );
}

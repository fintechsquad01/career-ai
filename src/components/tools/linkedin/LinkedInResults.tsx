"use client";

import { useMemo } from "react";
import { Ring } from "@/components/shared/Ring";
import { ReportFlow } from "@/components/shared/ReportStructure";
import { SourceVerification } from "@/components/shared/SourceVerification";
import { Hash, Users, Sparkles, AlertCircle } from "lucide-react";
import type { TLinkedInResult, ToolResult } from "@/types";

interface LinkedInResultsProps {
  result: ToolResult | null;
}

export function LinkedInResults({ result }: LinkedInResultsProps) {
  const data = result as TLinkedInResult | null;

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const score = data.profile_strength_score ?? 50;
  const verdictBand = useMemo(() => {
    if (data.result_meta?.verdict_band) return data.result_meta.verdict_band;
    if (score <= 30) return "low";
    if (score <= 55) return "mid";
    if (score <= 80) return "high";
    return "top_match";
  }, [data.result_meta?.verdict_band, score]);

  const evidenceCoverage = useMemo(() => {
    if (data.result_meta?.evidence_coverage) return data.result_meta.evidence_coverage;
    const checks = [
      Array.isArray(data.headlines) && data.headlines.length > 0,
      !!data.about_section,
      typeof data.profile_strength_score === "number",
    ];
    return {
      matched_required: checks.filter(Boolean).length,
      total_required: checks.length,
    };
  }, [data.about_section, data.headlines, data.profile_strength_score, data.result_meta?.evidence_coverage]);

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
        <>
          {data.profile_strength_score != null && (
            <div className="report-section text-center">
              <Ring score={data.profile_strength_score} size="md" label="Profile Strength" />
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
          )}

          {/* AI Value Prop */}
          {data.ai_value_prop && (
            <div className="surface-card-hero p-4">
              <p className="text-[10px] font-semibold text-purple-700 uppercase mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                LinkedIn AI Will Summarize You As
              </p>
              <p className="text-sm text-purple-900 italic">&ldquo;{data.ai_value_prop}&rdquo;</p>
            </div>
          )}
        </>
      }
      evidence={
        <>

      {/* Headlines */}
          {data.headlines && data.headlines.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Headline Options</h3>
          <div className="space-y-4">
            {data.headlines.map((h, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-2">{h.text}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {h.optimized_for && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {h.optimized_for.replace(/_/g, " ")}
                    </span>
                  )}
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
              </div>
            ))}
          </div>
            </div>
          )}

      {/* About Section */}
          {data.about_section && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3">About Section</h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{data.about_section}</p>
          {data.about_strategy && (
            <p className="text-xs text-gray-500 mt-3 italic">{data.about_strategy}</p>
          )}
            </div>
          )}

      {/* Keywords */}
          {data.keywords && data.keywords.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3">Keywords to Include</h3>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((kw, i) => {
              const isObj = typeof kw === "object";
              const keyword = isObj ? kw.keyword : kw;
              const placement = isObj ? kw.where_to_place : undefined;
              return (
                <div key={i} className="group relative">
                  <span className="px-3 py-1.5 bg-sky-50 text-sky-700 text-sm font-medium rounded-lg">
                    {keyword}
                  </span>
                  {placement && (
                    <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      Place in: {placement.replace(/_/g, " ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </div>
          )}

      {/* Experience Improvements */}
          {data.experience_improvements && data.experience_improvements.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Experience Improvements</h3>
          <div className="space-y-4">
            {data.experience_improvements.map((exp, i) => (
              <div key={i} className="space-y-2">
                <div className="text-xs text-gray-500">Current</div>
                <p className="text-sm text-gray-600 line-through">{exp.current}</p>
                <div className="text-xs text-gray-500">Improved</div>
                <p className="text-sm text-gray-900">{exp.improved}</p>
                {exp.what_changed && (
                  <p className="text-xs text-gray-400 italic">{exp.what_changed}</p>
                )}
              </div>
            ))}
          </div>
            </div>
          )}

      {/* Source Verification — Experience Improvements */}
          {data.experience_improvements && data.experience_improvements.length > 0 && (
            <SourceVerification
              items={data.experience_improvements.map((exp) => ({
                text: exp.improved.slice(0, 80) + (exp.improved.length > 80 ? "..." : ""),
                verified: true,
                source: exp.what_changed ? `Rewritten: ${exp.what_changed}` : "From resume experience",
              }))}
            />
          )}

      {/* Content Strategy */}
          {data.content_strategy && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-sky-500" />
            Content Strategy
          </h3>
          <div className="space-y-4">
            {data.content_strategy.posting_frequency && (
              <p className="text-sm text-gray-600">
                Recommended frequency: <strong className="text-gray-900">{data.content_strategy.posting_frequency}</strong>
              </p>
            )}

            {data.content_strategy.post_topics && data.content_strategy.post_topics.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Post Ideas</p>
                {data.content_strategy.post_topics.map((t, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{t.topic}</p>
                      {t.format && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
                          {t.format}
                        </span>
                      )}
                    </div>
                    {t.why_this_works && (
                      <p className="text-xs text-gray-500">{t.why_this_works}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.content_strategy.engagement_tactics && data.content_strategy.engagement_tactics.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Engagement Tactics</p>
                <ul className="space-y-1">
                  {data.content_strategy.engagement_tactics.map((t, i) => (
                    <li key={i} className="text-sm text-gray-700">• {t}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.content_strategy.hashtags && data.content_strategy.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.content_strategy.hashtags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    #{tag.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            )}
          </div>
            </div>
          )}


      {/* Network Building */}
          {data.network_building && data.network_building.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" />
            Network Building
          </h3>
          <div className="space-y-4">
            {data.network_building.map((nb, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                <p className="text-sm font-medium text-gray-900">{nb.action}</p>
                {nb.who_to_connect_with && (
                  <p className="text-xs text-gray-500">Who: {nb.who_to_connect_with}</p>
                )}
                {nb.message_template && (
                  <div className="p-2 bg-white rounded-lg border border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Message Template</p>
                    <p className="text-xs text-gray-700 italic">{nb.message_template}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
            </div>
          )}
        </>
      }
      nextStep={
        data.personal_brand_monetization ? (
          <div className="surface-card-soft p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Next Step: turn profile quality into opportunities</p>
            {data.personal_brand_monetization.positioning && (
              <p className="text-sm text-gray-700">{data.personal_brand_monetization.positioning}</p>
            )}
            {data.personal_brand_monetization.first_steps && data.personal_brand_monetization.first_steps.length > 0 && (
              <ul className="space-y-1">
                {data.personal_brand_monetization.first_steps.map((step, i) => (
                  <li key={i} className="text-sm text-gray-600">• {step}</li>
                ))}
              </ul>
            )}
          </div>
        ) : null
      }
    />
  );
}

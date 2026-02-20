"use client";

import { useMemo, useState } from "react";
import { Ring } from "@/components/shared/Ring";
import { ReportFlow } from "@/components/shared/ReportStructure";
import { Copy, Download, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, AlertCircle, ArrowRight, DollarSign } from "lucide-react";
import type { TResumeResult, ToolResult } from "@/types";

interface ResumeResultsProps {
  result: ToolResult | null;
}

export function ResumeResults({ result }: ResumeResultsProps) {
  const data = result as TResumeResult | null;
  const [copied, setCopied] = useState(false);
  // Auto-expand the first 3 sections (the most impactful diffs)
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(
    data?.sections_rewritten
      ? Object.fromEntries(data.sections_rewritten.slice(0, 3).map((_, i) => [i, true]))
      : {},
  );

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.optimized_resume_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const content = [
      "OPTIMIZED RESUME",
      `ATS Score: ${data.score_before} → ${data.score_after} (+${data.score_after - data.score_before})`,
      "",
      data.optimized_resume_text,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSection = (i: number) => {
    setExpandedSections((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const verdictBand = useMemo(() => {
    if (data.result_meta?.verdict_band) return data.result_meta.verdict_band;
    if (data.score_after <= 30) return "low";
    if (data.score_after <= 55) return "mid";
    if (data.score_after <= 80) return "high";
    return "top_match";
  }, [data.result_meta?.verdict_band, data.score_after]);

  const evidenceCoverage = useMemo(() => {
    if (data.result_meta?.evidence_coverage) return data.result_meta.evidence_coverage;
    const checks = [
      typeof data.score_before === "number",
      typeof data.score_after === "number",
      !!data.optimized_resume_text,
    ];
    return {
      matched_required: checks.filter(Boolean).length,
      total_required: checks.length,
    };
  }, [data.optimized_resume_text, data.result_meta?.evidence_coverage, data.score_after, data.score_before]);

  const confidenceLevel = useMemo(() => {
    if (data.result_meta?.confidence_level) return data.result_meta.confidence_level;
    const ratio = evidenceCoverage.total_required > 0
      ? evidenceCoverage.matched_required / evidenceCoverage.total_required
      : 0;
    if (ratio >= 0.75) return "high";
    if (ratio >= 0.4) return "medium";
    return "low";
  }, [data.result_meta?.confidence_level, evidenceCoverage]);

  const primaryNextStep = data.next_steps?.[0] ?? null;

  return (
    <ReportFlow
      summary={
        <>
          {/* Before/After scores */}
          <div className="report-section">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">ATS Score Improvement</h3>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <Ring score={data.score_before} size="md" label="Before" />
          </div>
          <div className="text-2xl text-gray-300">→</div>
          <div className="text-center">
            <Ring score={data.score_after} size="md" label="After" />
          </div>
        </div>
        <p className="text-sm text-green-600 font-medium text-center mt-3">
          +{data.score_after - data.score_before} point improvement
        </p>
        {data.headline && (
          <p className="text-sm text-gray-600 text-center mt-2">{data.headline}</p>
        )}
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

          {/* Voice note */}
          {data.voice_note && (
            <div className="surface-card-hero p-4">
              <p className="text-[10px] font-semibold text-indigo-700 uppercase mb-1">Voice Preservation</p>
              <p className="text-sm text-indigo-900">{data.voice_note}</p>
            </div>
          )}
        </>
      }
      evidence={
        <>
          {/* Keywords added — grouped by section */}
          {data.keywords_added && data.keywords_added.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-1">Keywords Woven In</h3>
          <p className="text-xs text-gray-500 mb-3">{data.keywords_added.length} JD keywords added to your resume</p>
          <div className="flex flex-wrap gap-2">
            {data.keywords_added.map((kw, i) => {
              const isObj = typeof kw === "object";
              const keyword = isObj ? kw.keyword : kw;
              const section = isObj ? kw.where_added : null;
              return (
                <div key={i} className="group relative">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                    + {keyword}
                    {section && (
                      <span className="text-[9px] text-green-500 font-normal">→ {section}</span>
                    )}
                  </span>
                  {isObj && kw.why && (
                    <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 p-2 bg-gray-900 text-white text-xs rounded-lg max-w-[240px] z-10 shadow-lg">
                      {kw.why}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </div>
          )}

          {/* Section rewrites */}
          {data.sections_rewritten && data.sections_rewritten.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-4">Section Rewrites</h3>
          <div className="space-y-3">
            {data.sections_rewritten.map((section, i) => (
              <div key={i} className="surface-card overflow-hidden">
                <button
                  onClick={() => toggleSection(i)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{section.section}</span>
                    {section.jd_alignment && (
                      <span className="text-[10px] text-gray-400 hidden sm:inline">{section.jd_alignment}</span>
                    )}
                  </div>
                  {expandedSections[i] ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedSections[i] && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-[10px] font-semibold text-red-500 uppercase mb-1">Before</p>
                      <p className="text-sm text-red-800 line-through opacity-70">{section.before}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-[10px] font-semibold text-green-500 uppercase mb-1">After</p>
                      <p className="text-sm text-green-800">{section.after}</p>
                    </div>
                    {section.changes && (
                      <p className="text-xs text-gray-500 italic">{section.changes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
            </div>
          )}

          {/* Formatting fixes */}
          {data.formatting_fixes && data.formatting_fixes.length > 0 && (
            <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Formatting Fixes
          </h3>
          <div className="space-y-2">
            {data.formatting_fixes.map((fix, i) => {
              const isObj = typeof fix === "object";
              const impactColors: Record<string, string> = {
                high: "bg-red-50 text-red-700",
                medium: "bg-amber-50 text-amber-700",
                low: "bg-gray-100 text-gray-600",
              };
              return (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <div className="flex-1">
                    <p className="text-gray-700">{isObj ? fix.issue : fix}</p>
                    {isObj && fix.fix && <p className="text-xs text-gray-500 mt-0.5">Fix: {fix.fix}</p>}
                  </div>
                  {isObj && fix.impact && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${impactColors[fix.impact] || ""}`}>
                      {fix.impact}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
            </div>
          )}

          {/* ATS Warnings */}
          {data.ats_warnings && data.ats_warnings.length > 0 && (
            <div className="surface-card-hero p-4">
              <p className="text-[10px] font-semibold text-amber-700 uppercase mb-2">Remaining ATS Warnings</p>
              <ul className="space-y-1">
                {data.ats_warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-800">• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recruiter Perspective */}
          {data.recruiter_perspective && (
            <div className="report-section">
              <h3 className="font-semibold text-gray-900 mb-4">Recruiter Perspective</h3>
              <p className="text-sm text-gray-700">{data.recruiter_perspective}</p>
            </div>
          )}

          {/* Monetizable Skills — Track B */}
          {data.monetizable_skills && Array.isArray(data.monetizable_skills) && data.monetizable_skills.length > 0 && (
            <div className="report-section">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Monetizable Skills
              </h3>
              <p className="text-xs text-gray-500 mb-2">Skills in your resume that could generate freelance or consulting income:</p>
              <div className="flex flex-wrap gap-2">
                {data.monetizable_skills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </>
      }
      actions={
        <div className="report-section">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-3">Output Actions</p>
          <div className="report-cta-row">
            <button
              onClick={handleCopy}
              className="btn-primary sm:w-auto"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Optimized Resume"}
            </button>
            <button
              onClick={handleDownloadPdf}
              className="btn-secondary w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Download TXT
            </button>
          </div>
        </div>
      }
      nextStep={
        data.next_steps && data.next_steps.length > 0 ? (
          <div className="report-section">
          <h3 className="font-semibold text-gray-900 mb-3">Next Step Plan</h3>
          {primaryNextStep && (
            <div className="surface-card-hero p-3.5 mb-3">
              <p className="text-sm font-semibold text-gray-900">Start here now: {primaryNextStep.action}</p>
              <p className="text-xs text-gray-600 mt-1">
                Effort: {primaryNextStep.tool ? `${primaryNextStep.tool} · ~30-45 sec` : "~30-45 sec"}
              </p>
            </div>
          )}
          <div className="space-y-2">
            {data.next_steps.map((ns, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">{ns.action}</span>
                {ns.tool && <span className="text-xs text-blue-600 font-medium">→ {ns.tool}</span>}
              </div>
            ))}
          </div>
          </div>
        ) : null
      }
    />
  );
}

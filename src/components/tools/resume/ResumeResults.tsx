"use client";

import { useState } from "react";
import { Ring } from "@/components/shared/Ring";
import { Copy, Download, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import type { TResumeResult, ToolResult } from "@/types";

interface ResumeResultsProps {
  result: ToolResult | null;
}

export function ResumeResults({ result }: ResumeResultsProps) {
  const data = result as TResumeResult | null;
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.
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

  return (
    <div className="space-y-6">
      {/* Before/After scores */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
      </div>

      {/* Voice note */}
      {data.voice_note && (
        <div className="bg-purple-50 rounded-2xl border border-purple-200 p-4">
          <p className="text-[10px] font-semibold text-purple-700 uppercase mb-1">Voice Preservation</p>
          <p className="text-sm text-purple-900">{data.voice_note}</p>
        </div>
      )}

      {/* Keywords added */}
      {data.keywords_added && data.keywords_added.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Keywords Added</h3>
          <div className="flex flex-wrap gap-2">
            {data.keywords_added.map((kw, i) => {
              const isObj = typeof kw === "object";
              const keyword = isObj ? kw.keyword : kw;
              return (
                <div key={i} className="group relative">
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    + {keyword}
                  </span>
                  {isObj && kw.why && (
                    <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 p-2 bg-gray-900 text-white text-xs rounded-lg max-w-[200px] z-10">
                      {kw.why}
                      {kw.where_added && <span className="block text-gray-400 mt-0.5">Section: {kw.where_added}</span>}
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Section Rewrites</h3>
          <div className="space-y-3">
            {data.sections_rewritten.map((section, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Recruiter Perspective</h3>
          <p className="text-sm text-gray-700">{data.recruiter_perspective}</p>
        </div>
      )}

      {/* Next Steps */}
      {data.next_steps && data.next_steps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
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
      )}

      {/* Monetizable Skills (Track B) */}
      {data.monetizable_skills && data.monetizable_skills.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5">
          <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Monetizable Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.monetizable_skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[48px]"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Optimized Resume"}
        </button>
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
        >
          <Download className="w-4 h-4" />
          TXT
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Ring } from "@/components/shared/Ring";
import { Copy, Download, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import type { TResumeResult, ToolResult } from "@/types";

interface ResumeResultsProps {
  result: ToolResult | null;
}

export function ResumeResults({ result }: ResumeResultsProps) {
  const data = result as TResumeResult | null;
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.optimized_resume_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    // Generate a simple text-based PDF download using a data URI
    const content = [
      "OPTIMIZED RESUME",
      `ATS Score: ${data.score_before} → ${data.score_after} (+${data.score_after - data.score_before})`,
      "",
      "Keywords Added: " + (data.keywords_added?.join(", ") || "None"),
      "",
      ...(data.sections_rewritten?.map((s) => [
        `--- ${s.section} ---`,
        s.after,
        "",
      ]).flat() || []),
      "",
      "Full Optimized Resume:",
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
      </div>

      {/* Keywords added */}
      {data.keywords_added && data.keywords_added.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Keywords Added</h3>
          <div className="flex flex-wrap gap-2">
            {data.keywords_added.map((kw, i) => (
              <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                + {kw}
              </span>
            ))}
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
                  <span className="text-sm font-medium text-gray-900">{section.section}</span>
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
          PDF
        </button>
      </div>
    </div>
  );
}

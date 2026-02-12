"use client";

import { useState } from "react";
import { Copy, Download, CheckCircle, Lightbulb, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import type { TCoverLetterResult, ToolResult } from "@/types";

interface CoverLetterResultsProps {
  result: ToolResult | null;
}

export function CoverLetterResults({ result }: CoverLetterResultsProps) {
  const data = result as TCoverLetterResult | null;
  const [copied, setCopied] = useState(false);

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.letter_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([data.letter_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const keywordCount = data.jd_keywords_used ?? 0;

  return (
    <div className="space-y-6">
      {/* Letter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Cover Letter</h3>
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <span>{data.word_count} words</span>
          <span>•</span>
          <span>{keywordCount} keywords</span>
          <span>•</span>
          <span>{data.resume_achievements_cited} achievements cited</span>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap">{data.letter_text}</p>
        </div>
      </div>

      {/* Opening hook strategy */}
      {data.opening_hook && (
        <div className="bg-purple-50 rounded-2xl border border-purple-200 p-4">
          <p className="text-[10px] font-semibold text-purple-700 uppercase mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Opening Hook Strategy
          </p>
          <p className="text-sm text-purple-900">{data.opening_hook}</p>
        </div>
      )}

      {/* What makes this different */}
      {data.what_makes_this_different && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <p className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Why This Stands Out</p>
          <p className="text-sm text-blue-900">{data.what_makes_this_different}</p>
        </div>
      )}

      {/* Company specifics referenced */}
      {data.company_specifics_referenced && data.company_specifics_referenced.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Company-Specific References</h3>
          <ul className="space-y-1.5">
            {data.company_specifics_referenced.map((ref, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                {ref}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlighted sections */}
      {data.highlighted_sections && data.highlighted_sections.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Key Phrases</h3>
          <div className="space-y-2">
            {data.highlighted_sections.map((hl, i) => {
              const typeColors: Record<string, string> = {
                storytelling: "bg-purple-50 text-purple-700",
                job_specific: "bg-blue-50 text-blue-700",
                keyword_match: "bg-green-50 text-green-700",
                achievement: "bg-amber-50 text-amber-700",
                company_specific: "bg-sky-50 text-sky-700",
              };
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${typeColors[hl.type] || "bg-gray-100 text-gray-600"}`}>
                    {hl.type.replace(/_/g, " ")}
                  </span>
                  <p className="text-sm text-gray-700 italic">&ldquo;{hl.text}&rdquo;</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interview Talking Points (bridges to Interview Prep tool) */}
      {data.interview_talking_points && data.interview_talking_points.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            Interview Prep — Topics They&apos;ll Ask About
          </h3>
          <p className="text-xs text-amber-700 mb-3">Based on your cover letter, prepare for questions about these topics:</p>
          <ul className="space-y-2">
            {data.interview_talking_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[48px]"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[48px]"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}

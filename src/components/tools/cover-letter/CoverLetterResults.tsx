"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Download, CheckCircle, Lightbulb, MessageSquare, Sparkles, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { SourceVerification } from "@/components/shared/SourceVerification";
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

  // Type-safe access to potential_objections from Batch B schema
  const objections = (data as unknown as Record<string, unknown>).potential_objections as
    | Array<{ objection: string; how_to_address: string }>
    | undefined;

  return (
    <div className="space-y-6">
      {/* Primary action buttons — top of results */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-center gap-2"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Letter"}
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

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
        {data.letter_text && (() => {
          const wordCount = data.letter_text.trim().split(/\s+/).length;
          const readTime = Math.ceil(wordCount / 200);
          return <p className="text-xs text-gray-400 mt-2">{wordCount} words · {readTime} min read</p>;
        })()}
      </div>

      {/* Source Verification */}
      {data.highlighted_sections && data.highlighted_sections.length > 0 && (
        <SourceVerification
          items={data.highlighted_sections.map((s) => ({
            text: s.text.slice(0, 80) + (s.text.length > 80 ? "..." : ""),
            verified: s.type === "achievement" || s.type === "job_specific",
            source:
              s.type === "achievement"
                ? "From resume"
                : s.type === "company_specific"
                  ? "Company research"
                  : s.type === "storytelling"
                    ? "Narrative framing"
                    : "Keyword match",
          }))}
        />
      )}

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

      {/* Potential Objections — recruiter coaching from Batch B */}
      {objections && objections.length > 0 && (
        <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
          <h3 className="font-semibold text-orange-900 mb-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            Prepare for These Objections
          </h3>
          <p className="text-xs text-orange-700 mb-4">What the recruiter might flag — and how to address it in the interview.</p>
          <div className="space-y-3">
            {objections.map((obj, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-sm font-medium text-gray-900 mb-1">{obj.objection}</p>
                <p className="text-sm text-gray-600">{obj.how_to_address}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Talking Points + CTA to Interview Prep tool */}
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
          <Link
            href="/tools/interview"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 text-amber-900 text-sm font-semibold rounded-xl hover:bg-amber-200 transition-colors min-h-[44px]"
          >
            Prepare for These Questions
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs font-normal text-amber-700 ml-1">8 tokens</span>
          </Link>
        </div>
      )}
    </div>
  );
}

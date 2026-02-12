"use client";

import { useState } from "react";
import { Copy, Download, CheckCircle } from "lucide-react";
import type { TCoverLetterResult, ToolResult } from "@/types";

interface CoverLetterResultsProps {
  result: ToolResult | null;
}

export function CoverLetterResults({ result }: CoverLetterResultsProps) {
  const data = result as TCoverLetterResult | null;
  const [copied, setCopied] = useState(false);

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
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
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Cover Letter</h3>
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <span>{data.word_count} words</span>
          <span>•</span>
          <span>{keywordCount} keywords used</span>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap">{data.letter_text}</p>
        </div>
      </div>

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

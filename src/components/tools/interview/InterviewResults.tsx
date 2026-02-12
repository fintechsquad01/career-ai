"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import type { TInterviewResult, ToolResult } from "@/types";

interface InterviewResultsProps {
  result: ToolResult | null;
}

export function InterviewResults({ result }: InterviewResultsProps) {
  const data = result as TInterviewResult | null;
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  if (!data) {
    return <div className="text-center py-8 text-gray-500">No results available. Please try again.</div>;
  }

  const toggleCard = (i: number) => {
    setExpandedCards((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="space-y-6">
      {data.company_culture_notes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <h4 className="font-semibold text-amber-900 mb-1">Company Culture Notes</h4>
          <p className="text-sm text-amber-800">{data.company_culture_notes}</p>
        </div>
      )}

      {data.interview_format_prediction && (
        <p className="text-sm text-gray-600">{data.interview_format_prediction}</p>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Practice Questions</h3>
        {data.questions?.map((q, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCard(i)}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 min-h-[44px]"
            >
              <span className="text-sm font-medium text-gray-900 text-left pr-4">{q.question}</span>
              <span className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  q.difficulty === "easy" ? "bg-green-50 text-green-700" :
                  q.difficulty === "medium" ? "bg-amber-50 text-amber-700" :
                  "bg-red-50 text-red-700"
                }`}>
                  {q.difficulty}
                </span>
                {expandedCards[i] ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </span>
            </button>
            {expandedCards[i] && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">STAR Answer</p>
                  <p className="text-sm text-gray-800">{q.suggested_answer}</p>
                </div>
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-amber-700 uppercase mb-0.5">Coaching Tip</p>
                    <p className="text-sm text-amber-900">{q.coaching_tip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

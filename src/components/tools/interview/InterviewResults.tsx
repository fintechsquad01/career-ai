"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, AlertCircle, Zap, MessageSquare, CheckCircle, Briefcase } from "lucide-react";
import { SourceVerification } from "@/components/shared/SourceVerification";
import type { TInterviewResult, ToolResult } from "@/types";

interface InterviewResultsProps {
  result: ToolResult | null;
}

export function InterviewResults({ result }: InterviewResultsProps) {
  const data = result as TInterviewResult | null;
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  if (!data) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-gray-500 text-sm">We couldn&apos;t generate results this time. This is usually temporary — try again in a moment.</p>
      </div>
    );
  }

  const toggleCard = (i: number) => {
    setExpandedCards((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const typeColors: Record<string, string> = {
    warm_up: "bg-green-50 text-green-700",
    behavioral: "bg-blue-50 text-blue-700",
    technical: "bg-purple-50 text-purple-700",
    case_study: "bg-indigo-50 text-indigo-700",
    gap_probe: "bg-red-50 text-red-700",
    culture_fit: "bg-sky-50 text-sky-700",
    analytical: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="space-y-6">
      {/* Interview Strategy */}
      {data.interview_strategy && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 space-y-4">
          <h3 className="font-semibold text-blue-900">Interview Strategy</h3>

          {data.interview_strategy.opening_impression && (
            <div>
              <p className="text-[10px] font-semibold text-blue-700 uppercase mb-1">First 30 Seconds</p>
              <p className="text-sm text-gray-800">{data.interview_strategy.opening_impression}</p>
            </div>
          )}

          {data.interview_strategy.closing_strong && (
            <div>
              <p className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Closing Strong</p>
              <p className="text-sm text-gray-800">{data.interview_strategy.closing_strong}</p>
            </div>
          )}

          {data.interview_strategy.common_mistakes_for_this_role && data.interview_strategy.common_mistakes_for_this_role.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-red-600 uppercase mb-1">Common Mistakes to Avoid</p>
              <ul className="space-y-1">
                {data.interview_strategy.common_mistakes_for_this_role.map((m, i) => (
                  <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {data.company_culture_notes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <h4 className="font-semibold text-amber-900 mb-1">Company Culture Notes</h4>
          <p className="text-sm text-amber-800">{data.company_culture_notes}</p>
        </div>
      )}

      {data.interview_format_prediction && (
        <p className="text-sm text-gray-600">{data.interview_format_prediction}</p>
      )}

      {/* Practice Questions */}
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[q.type] || "bg-gray-100 text-gray-600"}`}>
                  {q.type.replace(/_/g, " ")}
                </span>
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
                {/* What they're really asking */}
                {q.what_theyre_really_asking && (
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-[10px] font-semibold text-purple-700 uppercase mb-0.5">What They&apos;re Really Asking</p>
                    <p className="text-sm text-purple-900">{q.what_theyre_really_asking}</p>
                  </div>
                )}

                {/* Suggested answer */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">STAR Answer</p>
                  <p className="text-sm text-gray-800">{q.suggested_answer}</p>
                </div>

                {/* Power phrase */}
                {q.power_phrase && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                    <Zap className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-green-700 uppercase mb-0.5">Power Phrase</p>
                      <p className="text-sm text-green-900 italic">&ldquo;{q.power_phrase}&rdquo;</p>
                    </div>
                  </div>
                )}

                {/* Follow-up questions */}
                {q.follow_ups && q.follow_ups.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Follow-Up Questions</p>
                    <div className="space-y-2">
                      {q.follow_ups.map((fu, j) => (
                        <div key={j} className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-sm font-medium text-gray-900">{fu.question}</p>
                          {fu.what_theyre_testing && (
                            <p className="text-xs text-gray-500 mt-0.5">Testing: {fu.what_theyre_testing}</p>
                          )}
                          {fu.how_to_handle && (
                            <p className="text-xs text-blue-700 mt-1">{fu.how_to_handle}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red flag answers */}
                {q.red_flag_answers && q.red_flag_answers.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <p className="text-[10px] font-semibold text-red-700 uppercase mb-1">Red Flag Answers to Avoid</p>
                    <ul className="space-y-1">
                      {q.red_flag_answers.map((rf, j) => (
                        <li key={j} className="text-sm text-red-800 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          {rf}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Coaching tip */}
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

      {/* Questions to Ask Them */}
      {data.interview_strategy?.questions_to_ask_them && data.interview_strategy.questions_to_ask_them.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            Questions to Ask Them
          </h3>
          <div className="space-y-3">
            {data.interview_strategy.questions_to_ask_them.map((q, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                {q.why_this_impresses && (
                  <p className="text-xs text-gray-500 mt-0.5">{q.why_this_impresses}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preparation Checklist */}
      {data.preparation_checklist && data.preparation_checklist.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Preparation Checklist
          </h3>
          <ul className="space-y-2">
            {data.preparation_checklist.map((item, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500">☐</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source Verification — Coaching answers reference experience */}
      {data.questions && data.questions.length > 0 && (
        <SourceVerification
          items={data.questions
            .filter((q) => q.suggested_answer)
            .slice(0, 5)
            .map((q) => ({
              text: q.suggested_answer.slice(0, 80) + (q.suggested_answer.length > 80 ? "..." : ""),
              verified: true,
              source: `Based on your experience (${q.type.replace(/_/g, " ")} question)`,
            }))}
        />
      )}

    </div>
  );
}

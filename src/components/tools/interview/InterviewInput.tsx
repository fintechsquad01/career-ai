"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

interface InterviewInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

const INTERVIEW_TYPES = [
  { value: "behavioral_case", label: "Behavioral / Case" },
  { value: "technical", label: "Technical" },
  { value: "culture", label: "Culture" },
  { value: "panel", label: "Panel" },
] as const;

export function InterviewInput({ onSubmit }: InterviewInputProps) {
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);
  const [interviewType, setInterviewType] = useState<string>("behavioral_case");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Interview Prep</h3>
          <p className="text-xs text-gray-500">Practice questions with STAR answers</p>
        </div>
      </div>

      {activeJobTarget && (
        <div className="text-sm text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl">
          Preparing for: <strong>{activeJobTarget.title}</strong>
          {activeJobTarget.company && ` at ${activeJobTarget.company}`}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
        <div className="flex flex-col gap-2">
          {INTERVIEW_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setInterviewType(t.value)}
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left min-h-[44px] transition-colors ${
                interviewType === t.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>10+ questions with follow-up prep</li>
          <li>&ldquo;What they&apos;re really asking&rdquo; insights</li>
          <li>Red flag answers to avoid</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({ interview_type: interviewType })}
        className="btn-primary"
      >
        Generate Questions — 3 tokens
      </button>
    </div>
  );
}

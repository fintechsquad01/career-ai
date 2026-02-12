"use client";

import { useState } from "react";
import { Target } from "lucide-react";

interface JdMatchInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function JdMatchInput({ onSubmit }: JdMatchInputProps) {
  const [jdText, setJdText] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Target className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Job Description</h3>
          <p className="text-xs text-gray-500">Paste the full job description or URL</p>
        </div>
      </div>

      <div>
        <label htmlFor="jdmatch-jd" className="sr-only">Job Description</label>
        <textarea
          id="jdmatch-jd"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here..."
          rows={8}
          aria-label="Paste the full job description or URL"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>Evidence-based match with resume quotes</li>
          <li>Recruiter perspective on each gap</li>
          <li>Cover letter positioning statement</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({ jd_text: jdText })}
        disabled={!jdText.trim()}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Match Against Job — 2 tokens
      </button>
    </div>
  );
}

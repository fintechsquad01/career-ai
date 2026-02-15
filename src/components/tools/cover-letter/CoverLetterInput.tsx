"use client";

import { useState, useEffect } from "react";
import { FileSignature } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

interface CoverLetterInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "conversational", label: "Conversational" },
] as const;

const LENGTHS = [
  { value: "short", label: "Short" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
] as const;

export function CoverLetterInput({ onSubmit }: CoverLetterInputProps) {
  const { activeJobTarget } = useAppStore();
  const [tone, setTone] = useState<string>("professional");
  const [length, setLength] = useState<string>("standard");
  const [jdText, setJdText] = useState(activeJobTarget?.jd_text ?? "");

  useEffect(() => {
    if (activeJobTarget?.jd_text && !jdText.trim()) {
      setJdText(activeJobTarget.jd_text);
    }
  }, [activeJobTarget?.jd_text, jdText]);

  const effectiveJd = jdText.trim() || activeJobTarget?.jd_text?.trim() || "";
  const hasJd = effectiveJd.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <FileSignature className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Cover Letter</h3>
          <p className="text-xs text-gray-500">AI-generated cover letter tailored to the job</p>
        </div>
      </div>

      <div>
        <label htmlFor="coverletter-jd" className="block text-sm font-medium text-gray-700 mb-2">
          Job Description <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">Paste the job posting so we can personalize your letter</p>
        <textarea
          id="coverletter-jd"
          value={jdText || activeJobTarget?.jd_text || ""}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={5}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none min-h-[120px] resize-y"
          aria-label="Job description"
        />
        {!hasJd && (
          <p className="text-xs text-amber-600 mt-1.5">
            A job description is required for a personalized cover letter.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                tone === t.value
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
        <div className="flex flex-wrap gap-2">
          {LENGTHS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLength(l.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                length === l.value
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>Story-driven letter (not a template)</li>
          <li>Company-specific references</li>
          <li>Interview talking points from the letter</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({ tone, length, jd_text: effectiveJd })}
        disabled={!hasJd}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Cover Letter — 3 tokens
      </button>
    </div>
  );
}

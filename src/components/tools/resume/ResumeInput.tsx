"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

interface ResumeInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function ResumeInput({ onSubmit }: ResumeInputProps) {
  const [resumeText, setResumeText] = useState("");
  const [targetJd, setTargetJd] = useState("");
  const [hasSyncedFromProfile, setHasSyncedFromProfile] = useState(false);
  const { activeJobTarget, careerProfile } = useAppStore();

  // Pre-fill from career profile when available (one-time sync)
  useEffect(() => {
    if (careerProfile?.resume_text && !hasSyncedFromProfile) {
      setResumeText(careerProfile.resume_text);
      setHasSyncedFromProfile(true);
    }
  }, [careerProfile?.resume_text, hasSyncedFromProfile]);

  const effectiveResume = resumeText.trim() || careerProfile?.resume_text || "";
  const effectiveTargetJd = targetJd || activeJobTarget?.jd_text || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Optimize Resume</h3>
          <p className="text-xs text-gray-500">AI rewrites for ATS and human reviewers</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Resume Text</label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Job Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={targetJd || activeJobTarget?.jd_text || ""}
          onChange={(e) => setTargetJd(e.target.value)}
          placeholder="Paste the target job description to optimize against..."
          rows={5}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      <button
        onClick={() => onSubmit({ resume_text: effectiveResume, target_jd: effectiveTargetJd })}
        disabled={!effectiveResume.trim()}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Optimize My Resume — 10 tokens
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { ResumeUploadOrPaste } from "@/components/shared/ResumeUploadOrPaste";
import { JdUploadOrPaste } from "@/components/shared/JdUploadOrPaste";

interface ResumeInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function ResumeInput({ onSubmit }: ResumeInputProps) {
  const [resumeText, setResumeText] = useState("");
  const [targetJd, setTargetJd] = useState("");
  const { activeJobTarget, careerProfile } = useAppStore();

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

      <ResumeUploadOrPaste
        value={resumeText}
        onChange={setResumeText}
        profileResumeText={careerProfile?.resume_text}
        profileTitle={careerProfile?.title}
        profileCompany={careerProfile?.company}
        label="Your Resume"
      />

      <JdUploadOrPaste
        value={targetJd}
        onChange={setTargetJd}
        activeJobTarget={activeJobTarget ? { title: activeJobTarget.title, company: activeJobTarget.company, jd_text: activeJobTarget.jd_text } : null}
        label="Target Job Description (optional)"
      />

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>ATS + human-optimized resume</li>
          <li>Your voice preserved (no AI cliches)</li>
          <li>Formatting issues caught and fixed</li>
        </ul>
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

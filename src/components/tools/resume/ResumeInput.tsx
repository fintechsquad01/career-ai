"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { ResumeUploadOrPaste } from "@/components/shared/ResumeUploadOrPaste";
import { JdUploadOrPaste } from "@/components/shared/JdUploadOrPaste";
import { EVENTS, track } from "@/lib/analytics";

interface ResumeInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function ResumeInput({ onSubmit }: ResumeInputProps) {
  const [resumeText, setResumeText] = useState("");
  const [targetJd, setTargetJd] = useState("");
  const [resumeSource, setResumeSource] = useState<"profile" | "variant" | "upload">("profile");
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);
  const careerProfile = useAppStore((s) => s.careerProfile);

  const sourceProfileResume = resumeSource === "profile" ? careerProfile?.resume_text || "" : "";
  const effectiveResume = resumeText.trim() || sourceProfileResume || "";
  const effectiveTargetJd = targetJd || activeJobTarget?.jd_text || "";

  const handleSourceChange = (source: "profile" | "variant" | "upload") => {
    setResumeSource(source);
    if (source !== "upload") {
      // Reset manual text when switching to profile/variant source.
      setResumeText("");
    }
    track(EVENTS.RESUME_INPUT_SOURCE_SELECTED, { source });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Optimize Resume</h3>
          <p className="text-xs text-gray-500">AI rewrites for ATS and human reviewers</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Resume source</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSourceChange("profile")}
            className={`min-h-[36px] px-3 rounded-full text-xs font-medium border transition-colors ${
              resumeSource === "profile" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Use profile resume
          </button>
          <button
            type="button"
            onClick={() => handleSourceChange("variant")}
            className={`min-h-[36px] px-3 rounded-full text-xs font-medium border transition-colors ${
              resumeSource === "variant" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Use saved variant
          </button>
          <button
            type="button"
            onClick={() => handleSourceChange("upload")}
            className={`min-h-[36px] px-3 rounded-full text-xs font-medium border transition-colors ${
              resumeSource === "upload" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Upload new
          </button>
        </div>
      </div>

      <ResumeUploadOrPaste
        value={resumeText}
        onChange={setResumeText}
        profileResumeText={resumeSource === "profile" ? careerProfile?.resume_text : null}
        profileTitle={careerProfile?.title}
        profileCompany={careerProfile?.company}
        label="Your Resume"
        preferredEntry={resumeSource === "variant" ? "textarea" : resumeSource === "upload" ? "dropzone" : "auto"}
        openVariantsOnMount={resumeSource === "variant"}
      />

      <div className="surface-card-soft p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Target context</p>
          <p className="text-xs text-gray-700 truncate">
            {activeJobTarget?.title
              ? `${activeJobTarget.title}${activeJobTarget.company ? ` at ${activeJobTarget.company}` : ""}`
              : "No active target selected (optional)"}
          </p>
        </div>
        <Link
          href="/mission"
          onClick={() => track(EVENTS.RESUME_INPUT_TARGET_SWITCHED, { from: "resume_input" })}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
        >
          Edit target
        </Link>
      </div>

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
        onClick={() => {
          track(EVENTS.RESUME_OPTIMIZE_SUBMITTED, {
            has_target_jd: Boolean(effectiveTargetJd),
            resume_source: resumeSource,
          });
          onSubmit({ resume_text: effectiveResume, target_jd: effectiveTargetJd });
        }}
        disabled={!effectiveResume.trim()}
        className="btn-primary"
      >
        Optimize My Resume — 15 tokens
      </button>
    </div>
  );
}

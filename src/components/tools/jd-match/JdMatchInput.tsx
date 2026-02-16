"use client";

import { useState } from "react";
import { Target, FileText, GitCompare, CheckCircle } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { JdUploadOrPaste } from "@/components/shared/JdUploadOrPaste";
import { ProcessSteps, SocialProof, ResultPreview } from "@/components/shared/ProcessSteps";

interface JdMatchInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

const PROCESS_STEPS = [
  { icon: FileText, label: "Parse JD", detail: "Extract every requirement" },
  { icon: GitCompare, label: "Cross-Match", detail: "Compare with your resume" },
  { icon: CheckCircle, label: "Gap Report", detail: "Actionable fit score" },
] as const;

export function JdMatchInput({ onSubmit }: JdMatchInputProps) {
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);
  const [jdText, setJdText] = useState(activeJobTarget?.jd_text || "");

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

      {/* How it works */}
      <ProcessSteps steps={PROCESS_STEPS as unknown as { icon: typeof FileText; label: string; detail: string }[]} />

      <SocialProof
        stat="75%"
        context="of resumes are rejected before a human sees them — tailoring to the JD changes that"
      />

      <JdUploadOrPaste
        value={jdText}
        onChange={setJdText}
        activeJobTarget={activeJobTarget ? { title: activeJobTarget.title, company: activeJobTarget.company, jd_text: activeJobTarget.jd_text } : null}
        label="Job Description"
      />

      {/* Result preview */}
      <ResultPreview
        title="Sample output"
        items={[
          { label: "Fit Score", value: "78/100", color: "text-green-600" },
          { label: "Gaps Found", value: "3", color: "text-amber-600" },
          { label: "Strengths", value: "7", color: "text-blue-600" },
        ]}
      />

      <div className="text-xs text-gray-400 space-y-1">
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
        className="btn-primary"
      >
        Match Against Job — 5 tokens
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BarChart3, Scan, TrendingUp, BookOpen } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { ProcessSteps, SocialProof, ResultPreview } from "@/components/shared/ProcessSteps";

interface SkillsGapInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

const PROCESS_STEPS = [
  { icon: Scan, label: "Audit Skills", detail: "Map what you have now" },
  { icon: TrendingUp, label: "Market Match", detail: "What employers demand" },
  { icon: BookOpen, label: "Learning Path", detail: "Courses & projects" },
] as const;

export function SkillsGapInput({ onSubmit }: SkillsGapInputProps) {
  const careerProfile = useAppStore((s) => s.careerProfile);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);

  const prefillTargetRole = activeJobTarget?.title || careerProfile?.title || "";
  const targetRoleSource = activeJobTarget?.title ? "job target" : careerProfile?.title ? "profile" : null;

  const [targetRole, setTargetRole] = useState(prefillTargetRole);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Skills Gap Analysis</h3>
          <p className="text-xs text-gray-500">Identify gaps and get a learning path</p>
        </div>
      </div>

      {/* How it works */}
      <ProcessSteps steps={PROCESS_STEPS as unknown as { icon: typeof Scan; label: string; detail: string }[]} />

      <SocialProof
        stat="87%"
        context="of workers say they have or will need new skills for their role — McKinsey Global Survey"
      />

      <div>
        <label htmlFor="skillsgap-target-role" className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
        <input
          id="skillsgap-target-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Data Scientist, UX Designer"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
        />
        {targetRoleSource && (
          <p className="text-xs text-gray-400 mt-1">Pre-filled from your {targetRoleSource}</p>
        )}
      </div>

      {/* Result preview */}
      <ResultPreview
        title="Sample output"
        items={[
          { label: "Gaps Found", value: "5", color: "text-amber-600" },
          { label: "Transferable", value: "8", color: "text-green-600" },
          { label: "Courses", value: "12", color: "text-indigo-600" },
        ]}
      />

      <div className="text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>Transferable skills you may be undervaluing</li>
          <li>Named courses with prices and timelines</li>
          <li>Portfolio projects to prove each skill</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({ target_role: targetRole })}
        disabled={!targetRole.trim()}
        className="btn-primary"
      >
        Analyze Skills — 8 tokens
      </button>
    </div>
  );
}

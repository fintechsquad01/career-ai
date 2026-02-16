"use client";

import { useState } from "react";
import { Linkedin } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

interface LinkedInInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function LinkedInInput({ onSubmit }: LinkedInInputProps) {
  const careerProfile = useAppStore((s) => s.careerProfile);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);

  const prefillTargetRole = activeJobTarget?.title || careerProfile?.title || "";
  const targetRoleSource = activeJobTarget?.title ? "job target" : careerProfile?.title ? "profile" : null;

  const [aboutText, setAboutText] = useState("");
  const [targetRole, setTargetRole] = useState(prefillTargetRole);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
          <Linkedin className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">LinkedIn Optimizer</h3>
          <p className="text-xs text-gray-500">Optimize your profile for recruiters</p>
        </div>
      </div>

      <div>
        <label htmlFor="linkedin-about" className="block text-sm font-medium text-gray-700 mb-1">
          Current About Section <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="linkedin-about"
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          placeholder="Paste your current LinkedIn about section..."
          rows={4}
          aria-label="Current LinkedIn about section"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none min-h-[44px]"
        />
      </div>

      <div>
        <label htmlFor="linkedin-target-role" className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
        <input
          id="linkedin-target-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Product Manager, Senior Engineer"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
        />
        {targetRoleSource && (
          <p className="text-xs text-gray-400 mt-1">Pre-filled from your {targetRoleSource}</p>
        )}
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>AI Hiring Assistant optimized profile</li>
          <li>Content strategy for visibility</li>
          <li>Personal brand monetization plan</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({ about_text: aboutText, target_role: targetRole })}
        disabled={!targetRole.trim()}
        className="btn-primary"
      >
        Optimize LinkedIn — 10 tokens
      </button>
    </div>
  );
}

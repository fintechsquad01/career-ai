"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

interface SkillsGapInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function SkillsGapInput({ onSubmit }: SkillsGapInputProps) {
  const [targetRole, setTargetRole] = useState("");

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Data Scientist, UX Designer"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
        />
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
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
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze Skills — 5 tokens
      </button>
    </div>
  );
}

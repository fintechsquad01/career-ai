"use client";

import { useState } from "react";
import { Map } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

interface RoadmapInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

const TIME_HORIZONS = [
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
] as const;

export function RoadmapInput({ onSubmit }: RoadmapInputProps) {
  const { activeJobTarget } = useAppStore();

  const prefillTargetRole = activeJobTarget?.title || "";

  const [timeHorizon, setTimeHorizon] = useState<string>("12");
  const [targetRole, setTargetRole] = useState(prefillTargetRole);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
          <Map className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Career Roadmap</h3>
          <p className="text-xs text-gray-500">Step-by-step plan to reach your target role</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
        <div className="flex gap-2">
          {TIME_HORIZONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTimeHorizon(t.value)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                timeHorizon === t.value
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="roadmap-target-role" className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
        <input
          id="roadmap-target-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Principal Engineer, VP Product"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
        />
        {activeJobTarget?.title && (
          <p className="text-xs text-gray-400 mt-1">Pre-filled from your job target</p>
        )}
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>Dual-track: job hunt + income building</li>
          <li>Weekly milestones with deadlines</li>
          <li>Backup plans for every step</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({ time_horizon_months: timeHorizon, target_role: targetRole })}
        disabled={!targetRole.trim()}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Roadmap — 8 tokens
      </button>
    </div>
  );
}

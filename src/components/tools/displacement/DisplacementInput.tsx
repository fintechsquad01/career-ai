"use client";

import { ShieldAlert } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

interface DisplacementInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function DisplacementInput({ onSubmit }: DisplacementInputProps) {
  const { careerProfile } = useAppStore();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Displacement Analysis</h3>
          <p className="text-xs text-gray-500">Based on your career profile and industry trends</p>
        </div>
      </div>

      {careerProfile?.title && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
          Analyzing: <strong>{careerProfile.title}</strong>
          {careerProfile.industry && ` in ${careerProfile.industry}`}
          {careerProfile.years_experience && ` · ${careerProfile.years_experience} years`}
        </div>
      )}

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>Task-by-task risk breakdown</li>
          <li>Specific AI tools threatening each task</li>
          <li>Freelance opportunities from your safe skills</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({})}
        disabled={!careerProfile?.title?.trim()}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze My Risk — Free
      </button>
    </div>
  );
}

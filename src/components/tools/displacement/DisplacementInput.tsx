"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { INDUSTRIES } from "@/lib/constants";

interface DisplacementInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function DisplacementInput({ onSubmit }: DisplacementInputProps) {
  const { careerProfile } = useAppStore();
  const [jobTitle, setJobTitle] = useState(careerProfile?.title || "");
  const [industry, setIndustry] = useState(careerProfile?.industry || "");
  const [yearsExperience, setYearsExperience] = useState(
    careerProfile?.years_experience?.toString() || ""
  );

  const canSubmit = jobTitle.trim().length > 0;

  const handleSubmit = () => {
    onSubmit({
      job_title: jobTitle.trim(),
      industry: industry || undefined,
      years_experience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Displacement Analysis</h3>
          <p className="text-xs text-gray-500">Find out which of your daily tasks AI threatens</p>
        </div>
      </div>

      {/* Job Title */}
      <div>
        <label htmlFor="displacement-title" className="block text-sm font-medium text-gray-700 mb-1">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          id="displacement-title"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Software Engineer, Marketing Manager, Data Analyst"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm min-h-[44px]"
        />
      </div>

      {/* Industry */}
      <div>
        <label htmlFor="displacement-industry" className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <select
          id="displacement-industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm min-h-[44px] bg-white"
        >
          <option value="">Select industry (optional)</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Years of Experience */}
      <div>
        <label htmlFor="displacement-years" className="block text-sm font-medium text-gray-700 mb-1">
          Years of Experience
        </label>
        <input
          id="displacement-years"
          type="number"
          min="0"
          max="50"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          placeholder="e.g. 5"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm min-h-[44px]"
        />
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>Task-by-task risk breakdown</li>
          <li>Specific AI tools threatening each task</li>
          <li>Freelance opportunities from your safe skills</li>
        </ul>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze My Risk — Free
      </button>
    </div>
  );
}

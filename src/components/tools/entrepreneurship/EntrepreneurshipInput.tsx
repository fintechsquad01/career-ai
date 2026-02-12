"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";

interface EntrepreneurshipInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

const RISK_TOLERANCES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export function EntrepreneurshipInput({ onSubmit }: EntrepreneurshipInputProps) {
  const [businessIdea, setBusinessIdea] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<string>("medium");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Entrepreneurship Fit</h3>
          <p className="text-xs text-gray-500">Assess founder-market fit and business models</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Idea <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={businessIdea}
          onChange={(e) => setBusinessIdea(e.target.value)}
          placeholder="Describe your business idea or industry you're considering..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none min-h-[44px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
        <div className="flex gap-2">
          {RISK_TOLERANCES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRiskTolerance(r.value)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                riskTolerance === r.value
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit({ business_idea: businessIdea || undefined, risk_tolerance: riskTolerance })}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-colors min-h-[48px]"
      >
        Assess Fit — 8 tokens
      </button>
    </div>
  );
}

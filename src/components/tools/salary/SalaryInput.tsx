"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";

interface SalaryInputProps {
  onSubmit: (inputs: Record<string, unknown>) => void;
}

export function SalaryInput({ onSubmit }: SalaryInputProps) {
  const [currentSalary, setCurrentSalary] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Salary Research</h3>
          <p className="text-xs text-gray-500">Market range and negotiation tactics</p>
        </div>
      </div>

      <div>
        <label htmlFor="salary-current" className="block text-sm font-medium text-gray-700 mb-1">
          Current Salary <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="salary-current"
          type="text"
          value={currentSalary}
          onChange={(e) => setCurrentSalary(e.target.value)}
          placeholder="e.g. 120000"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
        />
      </div>

      <div>
        <label htmlFor="salary-target-role" className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
        <input
          id="salary-target-role"
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Product Manager"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
        />
      </div>

      <div>
        <label htmlFor="salary-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          id="salary-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. San Francisco, Remote"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
        />
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p className="font-medium text-gray-500">What you&apos;ll get:</p>
        <ul className="list-disc pl-4">
          <li>Honest ranges with verification sources</li>
          <li>Leverage-aware negotiation scripts</li>
          <li>Beyond-salary negotiation (equity, remote, PTO)</li>
        </ul>
      </div>

      <button
        onClick={() => onSubmit({ current_salary: currentSalary || undefined, target_role: targetRole, location })}
        disabled={!targetRole.trim() || !location.trim()}
        className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Research Salary — 3 tokens
      </button>
    </div>
  );
}

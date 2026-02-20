"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Crosshair, Plus, ArrowRight, Filter, SlidersHorizontal, Zap,
} from "lucide-react";
import { MissionCard } from "@/components/mission/MissionCard";
import { useBatchMissionResults } from "@/hooks/useMissionResults";
import { useJobTargets } from "@/hooks/useJobTargets";
import { MISSION_ACTIONS } from "@/lib/constants";
import type { JobTarget, JobTargetStatus } from "@/types";

const STATUS_FILTER_OPTIONS: Array<{ value: JobTargetStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

type SortOption = "recent" | "status" | "fit_score";

interface MissionOverviewProps {
  jobTargets: JobTarget[];
  onSelectTarget: (targetId: string) => void;
}

export function MissionOverview({ jobTargets, onSelectTarget }: MissionOverviewProps) {
  const [statusFilter, setStatusFilter] = useState<JobTargetStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJdText, setNewJdText] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [saving, setSaving] = useState(false);

  const { switchTarget, addTarget, refreshTargets } = useJobTargets();

  const targetIds = useMemo(() => jobTargets.map((t) => t.id), [jobTargets]);
  const { resultsByTarget } = useBatchMissionResults(targetIds);

  const updateStatus = async (targetId: string, status: JobTargetStatus) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase
        .from("job_targets")
        .update({ status, status_updated_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", targetId);
      await refreshTargets();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddTarget = async () => {
    if (!newJdText.trim() || !newTitle.trim()) return;
    setSaving(true);
    try {
      const result = await addTarget(newJdText, newTitle.trim(), newCompany.trim() || undefined);
      if (result) {
        setNewJdText("");
        setNewTitle("");
        setNewCompany("");
        setShowAddForm(false);
        await refreshTargets();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTarget = async (targetId: string) => {
    await switchTarget(targetId);
    onSelectTarget(targetId);
  };

  // Filter and sort
  const filteredTargets = useMemo(() => {
    let result = [...jobTargets];

    if (statusFilter !== "all") {
      result = result.filter((t) => (t.status || "saved") === statusFilter);
    }

    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === "status") {
      const statusOrder: Record<string, number> = {
        interviewing: 0, applied: 1, offer: 2, saved: 3, rejected: 4, withdrawn: 5,
      };
      result.sort((a, b) => (statusOrder[a.status || "saved"] ?? 3) - (statusOrder[b.status || "saved"] ?? 3));
    } else if (sortBy === "fit_score") {
      result.sort((a, b) => (b.fit_score ?? 0) - (a.fit_score ?? 0));
    }

    return result;
  }, [jobTargets, statusFilter, sortBy]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crosshair className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Job Missions</h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
              {jobTargets.length}
            </span>
          </div>
          <p className="text-sm text-gray-500">Pick your current target, complete the next action, then move to application-ready.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/quick-apply"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[40px]"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Apply
          </Link>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Job
          </button>
        </div>
      </div>

      {/* Add job form */}
      {showAddForm && (
        <div className="surface-card p-4 space-y-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Job title (required)"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            value={newJdText}
            onChange={(e) => setNewJdText(e.target.value)}
            placeholder="Paste a job description here..."
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="Company (optional override)"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => { setShowAddForm(false); setNewJdText(""); setNewTitle(""); setNewCompany(""); }}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTarget}
              disabled={!newJdText.trim() || !newTitle.trim() || saving}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors min-h-[36px]"
            >
              {saving ? "Creating..." : "Create Mission"}
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <div className="flex gap-1">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                  statusFilter === opt.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-[11px] font-medium text-gray-600 bg-gray-50 border-0 rounded-lg px-2 py-1 cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="status">By Status</option>
            <option value="fit_score">By Fit Score</option>
          </select>
        </div>
      </div>

      {/* Mission cards grid */}
      {filteredTargets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            {statusFilter !== "all"
              ? `No missions with status "${statusFilter}"`
              : "No job missions yet. Add a job to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
          {filteredTargets.map((target) => (
            <MissionCard
              key={target.id}
              target={target}
              toolResults={resultsByTarget[target.id] || {}}
              onSelect={handleSelectTarget}
              onStatusChange={updateStatus}
            />
          ))}

          {/* Add new job card */}
          <button
            onClick={() => setShowAddForm(true)}
            className="surface-card p-5 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[200px] group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
              Add New Job Application
            </span>
          </button>
        </div>
      )}

      {/* Quick Apply CTA banner — mobile */}
      <div className="sm:hidden">
        <Link
          href="/quick-apply"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[48px]"
        >
          <Zap className="w-4 h-4" />
          Quick Apply — Run 3 Tools at Once
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

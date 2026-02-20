"use client";

import { useState } from "react";
import { Briefcase, ChevronDown, ArrowRight } from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { MISSION_ACTIONS } from "@/lib/constants";
import type { JobTarget, JobTargetStatus } from "@/types";
import type { ToolResultSummary } from "@/hooks/useMissionResults";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  saved: { label: "Saved", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  applied: { label: "Applied", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  interviewing: { label: "Interviewing", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  offer: { label: "Offer", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  withdrawn: { label: "Withdrawn", bg: "bg-gray-100", text: "text-gray-400 line-through", dot: "bg-gray-300" },
};

const ALL_STATUSES: JobTargetStatus[] = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
];

interface MissionCardProps {
  target: JobTarget;
  toolResults: Record<string, ToolResultSummary>;
  onSelect: (targetId: string) => void;
  onStatusChange?: (targetId: string, status: JobTargetStatus) => void;
  scoreDelta?: { toolId: string; delta: number } | null;
}

export function MissionCard({
  target,
  toolResults,
  onSelect,
  onStatusChange,
  scoreDelta,
}: MissionCardProps) {
  const [statusOpen, setStatusOpen] = useState(false);

  const missionActions = (target.mission_actions as Record<string, boolean>) || {};
  const completedCount = Object.values(missionActions).filter(Boolean).length;
  const totalCount = MISSION_ACTIONS.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const status = (target.status || "saved") as JobTargetStatus;
  const statusStyle = STATUS_CONFIG[status] || STATUS_CONFIG.saved;

  return (
    <div className="surface-card p-5 hover:shadow-md transition-all duration-200 group relative">
      {/* Status badge + dropdown */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{target.title}</h3>
            <p className="text-xs text-gray-500 truncate">{target.company}</p>
          </div>
        </div>

        {/* Status dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStatusOpen(!statusOpen);
            }}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text} hover:opacity-80 transition-opacity`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
            <ChevronDown className="w-3 h-3" />
          </button>

          {statusOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStatusOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                {ALL_STATUSES.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange?.(target.id, s);
                        setStatusOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                        s === status ? "bg-gray-50" : ""
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Score + progress row */}
      <div className="flex items-center gap-4 mb-3">
        {target.fit_score ? (
          <Ring score={target.fit_score} size="sm" label="Fit" animate={false} />
        ) : (
          <div className="w-[60px] h-[60px] rounded-full bg-gray-50 flex items-center justify-center">
            <span className="text-xs text-gray-400">--</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-1 text-xs text-gray-500">
            <span>{completedCount}/{totalCount} actions</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Score delta indicator */}
          {scoreDelta && scoreDelta.delta !== 0 && (
            <p className={`text-[10px] font-semibold mt-1 ${
              scoreDelta.delta > 0 ? "text-green-600" : "text-red-500"
            }`}>
              {scoreDelta.delta > 0 ? "+" : ""}{scoreDelta.delta} since last run
            </p>
          )}
        </div>
      </div>

      {/* Quick results summary */}
      {Object.keys(toolResults).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {MISSION_ACTIONS.slice(0, 3).map((action) => {
            const result = toolResults[action.toolId];
            if (!result) return null;
            return (
              <span
                key={action.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full"
              >
                {action.title.split(" ")[0]}
                {result.metric_value != null && (
                  <span className="font-bold">{result.metric_value}%</span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* View Mission CTA */}
      <button
        onClick={() => onSelect(target.id)}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 transition-colors min-h-[44px] group-hover:bg-blue-50 group-hover:text-blue-700"
      >
        View Mission
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { TOOLS } from "@/lib/constants";
import type { ToolResultRow } from "@/types";

interface HistoryContentProps {
  results: ToolResultRow[];
}

export function HistoryContent({ results }: HistoryContentProps) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? results : results.filter((r) => r.tool_id === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Result History</h1>
          <p className="text-gray-500 text-sm">{results.length} total results</p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white min-h-[44px]"
        >
          <option value="all">All Tools</option>
          {TOOLS.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No results yet</h2>
          <p className="text-gray-500 text-sm">Run your first tool to see history here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map((r) => {
            const tool = TOOLS.find((t) => t.id === r.tool_id);
            return (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{tool?.title || r.tool_id}</p>
                  <p className="text-xs text-gray-500 truncate">{r.summary || "Analysis complete"}</p>
                  {r.detail && <p className="text-xs text-gray-400 mt-0.5">{r.detail}</p>}
                </div>
                <div className="flex items-center gap-4 ml-4">
                  {r.metric_value != null && (
                    <Ring score={r.metric_value} size="sm" showLabel={false} />
                  )}
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {r.tokens_spent > 0 ? `${r.tokens_spent} tokens` : "Free"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

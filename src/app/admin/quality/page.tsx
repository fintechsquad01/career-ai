"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Loader2,
} from "lucide-react";

interface ToolStat {
  tool_id: string;
  count: number;
  avg_latency: number;
  avg_metric: number;
  avg_prompt_tokens: number;
  avg_completion_tokens: number;
  zero_token_runs: number;
  null_metric_count: number;
  potential_hallucinations: number;
  hallucination_details: { id: string; issue: string; created_at: string }[];
}

interface QualityData {
  period: string;
  generated_at: string;
  summary: {
    total_runs: number;
    creative_tool_runs: number;
    potential_hallucinations: number;
    hallucination_rate: string;
    unique_tools_used: number;
  };
  tool_stats: ToolStat[];
}

const TOOL_LABELS: Record<string, string> = {
  displacement: "AI Displacement",
  jd_match: "JD Match",
  resume: "Resume Optimizer",
  cover_letter: "Cover Letter",
  interview: "Interview Prep",
  linkedin: "LinkedIn Optimizer",
  skills_gap: "Skills Gap",
  roadmap: "Career Roadmap",
  salary: "Salary Negotiation",
  entrepreneurship: "Entrepreneurship",
  headshots: "AI Headshots",
};

const CREATIVE_TOOLS = ["cover_letter", "linkedin", "interview"];

export default function QualityDashboardPage() {
  const [data, setData] = useState<QualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/quality");
      if (!res.ok) {
        if (res.status === 401) {
          setError("Unauthorized. Admin access required.");
        } else {
          const body = await res.json();
          setError(body.error || "Failed to load data");
        }
        return;
      }
      const json: QualityData = await res.json();
      setData(json);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Quality Monitor</h1>
              <p className="text-sm text-gray-500">
                Last 7 days
                {data && (
                  <span>
                    {" "}
                    | Generated{" "}
                    {new Date(data.generated_at).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Loading / Error */}
        {loading && !data && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <SummaryCard
                icon={Activity}
                label="Total Runs"
                value={String(data.summary.total_runs)}
                color="text-blue-400"
              />
              <SummaryCard
                icon={Zap}
                label="Tools Used"
                value={String(data.summary.unique_tools_used)}
                color="text-violet-400"
              />
              <SummaryCard
                icon={AlertTriangle}
                label="Hallucination Rate"
                value={data.summary.hallucination_rate}
                color={
                  parseFloat(data.summary.hallucination_rate) > 5
                    ? "text-red-400"
                    : "text-green-400"
                }
              />
              <SummaryCard
                icon={
                  parseFloat(data.summary.hallucination_rate) > 5
                    ? AlertTriangle
                    : CheckCircle
                }
                label="Creative Runs"
                value={`${data.summary.creative_tool_runs} (${data.summary.potential_hallucinations} flagged)`}
                color={
                  data.summary.potential_hallucinations > 0
                    ? "text-amber-400"
                    : "text-green-400"
                }
              />
            </div>

            {/* Per-Tool Table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Per-Tool Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500">
                      <th className="text-left px-6 py-3 font-medium">Tool</th>
                      <th className="text-right px-4 py-3 font-medium">Runs</th>
                      <th className="text-right px-4 py-3 font-medium">Avg Latency</th>
                      <th className="text-right px-4 py-3 font-medium">Avg Score</th>
                      <th className="text-right px-4 py-3 font-medium">Tokens (in/out)</th>
                      <th className="text-right px-4 py-3 font-medium">Failed</th>
                      <th className="text-right px-6 py-3 font-medium">Hallucinations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tool_stats.map((tool) => (
                      <tr
                        key={tool.tool_id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30"
                      >
                        <td className="px-6 py-3">
                          <span className="font-medium text-gray-200">
                            {TOOL_LABELS[tool.tool_id] || tool.tool_id}
                          </span>
                          {CREATIVE_TOOLS.includes(tool.tool_id) && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-violet-900/50 text-violet-300 rounded-full">
                              creative
                            </span>
                          )}
                        </td>
                        <td className="text-right px-4 py-3 text-gray-300">
                          {tool.count}
                        </td>
                        <td className="text-right px-4 py-3">
                          <span
                            className={
                              tool.avg_latency > 60000
                                ? "text-red-400"
                                : tool.avg_latency > 30000
                                ? "text-amber-400"
                                : "text-green-400"
                            }
                          >
                            {(tool.avg_latency / 1000).toFixed(1)}s
                          </span>
                        </td>
                        <td className="text-right px-4 py-3 text-gray-300">
                          {tool.avg_metric > 0
                            ? tool.avg_metric.toFixed(1)
                            : "N/A"}
                        </td>
                        <td className="text-right px-4 py-3 text-gray-400 text-xs">
                          {tool.avg_prompt_tokens.toLocaleString()} /{" "}
                          {tool.avg_completion_tokens.toLocaleString()}
                        </td>
                        <td className="text-right px-4 py-3">
                          <span
                            className={
                              tool.zero_token_runs > 0
                                ? "text-red-400"
                                : "text-gray-600"
                            }
                          >
                            {tool.zero_token_runs}
                          </span>
                        </td>
                        <td className="text-right px-6 py-3">
                          {CREATIVE_TOOLS.includes(tool.tool_id) ? (
                            <span
                              className={
                                tool.potential_hallucinations > 0
                                  ? "text-red-400 font-semibold"
                                  : "text-green-400"
                              }
                            >
                              {tool.potential_hallucinations}
                              {tool.count > 0 && (
                                <span className="text-gray-500 font-normal ml-1">
                                  (
                                  {(
                                    (tool.potential_hallucinations / tool.count) *
                                    100
                                  ).toFixed(0)}
                                  %)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-700">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hallucination Details */}
            {data.tool_stats.some((t) => t.hallucination_details.length > 0) && (
              <div className="bg-gray-900 rounded-xl border border-red-900/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h2 className="font-semibold text-red-300">
                    Flagged Outputs (Potential Hallucinations)
                  </h2>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {data.tool_stats
                    .flatMap((t) =>
                      t.hallucination_details.map((d) => ({
                        ...d,
                        tool_id: t.tool_id,
                      }))
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .slice(0, 20)
                    .map((detail) => (
                      <div
                        key={detail.id}
                        className="px-6 py-3 flex items-start gap-4"
                      >
                        <div className="flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
                            {TOOL_LABELS[detail.tool_id] || detail.tool_id}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-red-300">{detail.issue}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(detail.created_at).toLocaleString()} |
                            ID: {detail.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

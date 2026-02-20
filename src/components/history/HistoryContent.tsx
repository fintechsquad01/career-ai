"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, ChevronDown, ChevronUp, Share2, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import { Ring } from "@/components/shared/Ring";
import { ShareModal } from "@/components/shared/ShareModal";
import { TOOLS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/shared/Toast";
import { track } from "@/lib/analytics";
import { HistoryResultRenderer } from "./HistoryResultRenderer";
import type { ToolResultRow } from "@/types";
import type { ToolResult } from "@/types/tools";

const PAGE_SIZE = 20;

interface HistoryContentProps {
  results: ToolResultRow[];
  totalCount: number;
}

export function HistoryContent({ results: initialResults, totalCount }: HistoryContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilter = searchParams.get("filter") || "all";
  const initialExpand = searchParams.get("expand") || null;

  const [filter, setFilter] = useState(initialFilter);
  const [results, setResults] = useState(initialResults);
  const [expandedId, setExpandedId] = useState<string | null>(initialExpand);
  const [loadingMore, setLoadingMore] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const filtered = filter === "all" ? results : results.filter((r) => r.tool_id === filter);
  const hasMore = results.length < totalCount;

  // Sync filter & expand changes to URL params (without full navigation)
  const updateUrlParams = useCallback((newFilter: string, newExpand: string | null) => {
    const params = new URLSearchParams();
    if (newFilter !== "all") params.set("filter", newFilter);
    if (newExpand) params.set("expand", newExpand);
    const qs = params.toString();
    router.replace(`/history${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    updateUrlParams(newFilter, expandedId);
    track("history_filter_changed", { filter: newFilter });
  };

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("tool_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(results.length, results.length + PAGE_SIZE - 1);

      if (filter !== "all") {
        query = query.eq("tool_id", filter);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setResults((prev) => [...prev, ...data]);
      }
    } catch {
      toast("Failed to load more results");
    } finally {
      setLoadingMore(false);
    }
  }, [results.length, filter]);

  const handleToggleExpand = (id: string) => {
    const newExpanded = expandedId === id ? null : id;
    setExpandedId(newExpanded);
    updateUrlParams(filter, newExpanded);
    track("history_row_expand_toggled", { result_id: id, expanded: !!newExpanded });
    if (newExpanded) {
      const row = results.find((r) => r.id === id);
      track("history_result_reopened", { result_id: id, tool_id: row?.tool_id });
    }
  };

  const handleShare = useCallback(async (r: ToolResultRow) => {
    setSharingId(r.id);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast("Please sign in to share");
        return;
      }

      const result = r.result as Record<string, unknown> | null;
      const scoreValue = r.metric_value ?? (result ? getScoreFromResult(r.tool_id, result) : 50);
      const title = r.summary || `My ${TOOLS.find((t) => t.id === r.tool_id)?.title || r.tool_id} Results`;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          score_type: r.tool_id,
          score_value: Math.min(100, Math.max(0, Math.round(scoreValue))),
          title,
          detail: { tool_result_id: r.id },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create share link");
      }

      const data = await res.json();
      setShareUrl(data.url);
      setShareTitle(title);
      setShowShare(true);
      track("share_created", { tool_id: r.tool_id, source: "history" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to share");
    } finally {
      setSharingId(null);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("tool_results").delete().eq("id", id);
      if (error) throw error;

      setResults((prev) => prev.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
      toast("Result deleted");
    } catch {
      toast("Failed to delete result");
    } finally {
      setDeletingId(null);
    }
  }, [confirmDeleteId, expandedId]);

  const handleRenameStart = useCallback((id: string, currentTitle: string | null) => {
    setEditingId(id);
    setEditingTitle((currentTitle || "").trim());
  }, []);

  const handleRenameCancel = useCallback(() => {
    setEditingId(null);
    setEditingTitle("");
  }, []);

  const handleRenameSave = useCallback(async (id: string, toolId: string, previousTitle: string | null) => {
    const nextTitle = editingTitle.trim();
    if (!nextTitle) {
      toast("Please enter a title");
      return;
    }

    setRenamingId(id);
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, summary: nextTitle } : r)));
    setEditingId(null);
    setEditingTitle("");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("tool_results").update({ summary: nextTitle }).eq("id", id);
      if (error) throw error;
      track("history_row_renamed", { tool_id: toolId, result_id: id, title_length: nextTitle.length });
      toast("Result renamed");
    } catch {
      setResults((prev) => prev.map((r) => (r.id === id ? { ...r, summary: previousTitle } : r)));
      toast("Failed to rename result");
    } finally {
      setRenamingId(null);
    }
  }, [editingTitle]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8 space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Result History</h1>
          <p className="text-gray-500 text-xs sm:text-sm">{totalCount} total results</p>
        </div>

        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          aria-label="Filter by tool"
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
          <p className="text-gray-500 text-sm">Run your first Mission Control tool to see results here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const tool = TOOLS.find((t) => t.id === r.tool_id);
            const isExpanded = expandedId === r.id;
            const isConfirmingDelete = confirmDeleteId === r.id;
            const scoreBand = getScoreBand(r.metric_value);
            const displayTitle = r.summary || `${tool?.title || "Analysis"} result`;

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
              >
                {/* Row header — clickable */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggleExpand(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleToggleExpand(r.id);
                    }
                  }}
                  className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-start justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer gap-3"
                >
                  <div className="flex-1 min-w-0">
                    {editingId === r.id ? (
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleRenameSave(r.id, r.tool_id, r.summary);
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            handleRenameCancel();
                          }
                        }}
                        placeholder="Rename this result"
                        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{displayTitle}</p>
                    )}
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                      {(tool?.title || r.tool_id)} · {new Date(r.created_at).toLocaleDateString()} · {scoreBand}
                    </p>
                    {r.detail && <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 truncate">{r.detail}</p>}
                  </div>
                  <div className="flex items-center sm:items-start gap-2 sm:gap-3 ml-1 sm:ml-3 shrink-0">
                    {r.metric_value != null && (
                      <div className="hidden sm:block">
                        <Ring score={r.metric_value} size="sm" showLabel={false} />
                      </div>
                    )}
                    <div className="text-right min-w-[68px]">
                      <p className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-300">
                        {r.tokens_spent > 0 ? `${r.tokens_spent} tokens` : "Free"}
                      </p>
                    </div>
                    {editingId === r.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleRenameSave(r.id, r.tool_id, r.summary);
                          }}
                          disabled={renamingId === r.id}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 text-green-600 hover:bg-green-50 disabled:opacity-50"
                          aria-label="Save renamed result title"
                        >
                          {renamingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameCancel();
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                          aria-label="Cancel renaming result title"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameStart(r.id, r.summary);
                        }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
                        aria-label="Rename result title"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Actions bar */}
                    <div className="px-5 py-3 bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                      <Link
                        href="/mission"
                        onClick={() =>
                          track("history_continue_mission_clicked", {
                            result_id: r.id,
                            tool_id: r.tool_id,
                            route: "/history",
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors min-h-[32px]"
                      >
                        Continue Mission
                      </Link>
                      <button
                        onClick={() => handleShare(r)}
                        disabled={sharingId === r.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[32px]"
                      >
                        {sharingId === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                        Share
                      </button>
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 min-h-[32px]"
                          >
                            {deletingId === r.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              "Confirm Delete"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-gray-500 hover:text-gray-700 min-h-[32px] px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 min-h-[32px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Full result rendering */}
                    <div className="p-5">
                      <HistoryResultRenderer
                        toolId={r.tool_id}
                        result={r.result as unknown as ToolResult}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && filtered.length > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Load more results</>
            )}
          </button>
        </div>
      )}

      {/* Share modal */}
      {showShare && shareUrl && (
        <ShareModal
          url={shareUrl}
          title={shareTitle}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

/** Extract a numeric score from a result object based on tool type */
function getScoreFromResult(toolId: string, result: Record<string, unknown>): number {
  switch (toolId) {
    case "displacement":
      return typeof result.score === "number" ? result.score : 50;
    case "jd_match":
      return typeof result.fit_score === "number" ? result.fit_score : 50;
    case "resume":
      return typeof result.score_after === "number" ? result.score_after : 50;
    case "linkedin":
      return typeof result.profile_strength_score === "number" ? result.profile_strength_score : 50;
    case "entrepreneurship":
      return typeof result.founder_market_fit === "number" ? result.founder_market_fit : 50;
    case "salary":
      return typeof result.candidate_position === "number" ? result.candidate_position : 50;
    default:
      return 50;
  }
}

function getScoreBand(metric: number | null): string {
  if (metric == null) return "No score";
  if (metric < 40) return "Low";
  if (metric < 70) return "Moderate";
  return "Strong";
}

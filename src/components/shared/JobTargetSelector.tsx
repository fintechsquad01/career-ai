"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useJobTargets } from "@/hooks/useJobTargets";

/** Compact job target switcher — used in ToolShell and Sidebar */
export function JobTargetSelector({ compact = false }: { compact?: boolean }) {
  const {
    jobTargets,
    activeJobTarget,
    switchTarget,
    addTarget,
    renameTarget,
    deleteTarget,
  } = useJobTargets();

  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJdText, setNewJdText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAddForm(false);
        setEditingId(null);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleSwitch = useCallback(
    async (targetId: string) => {
      if (targetId === activeJobTarget?.id) {
        setOpen(false);
        return;
      }
      await switchTarget(targetId);
      setOpen(false);
    },
    [activeJobTarget?.id, switchTarget]
  );

  const handleAdd = useCallback(async () => {
    if (!newJdText.trim() || newJdText.trim().length < 20) return;
    setSaving(true);
    const result = await addTarget(newJdText);
    setSaving(false);
    if (result) {
      setNewJdText("");
      setShowAddForm(false);
      setOpen(false);
    }
  }, [newJdText, addTarget]);

  const handleRename = useCallback(
    async (targetId: string) => {
      if (!editTitle.trim()) return;
      const success = await renameTarget(targetId, editTitle.trim(), editCompany.trim());
      if (success) setEditingId(null);
    },
    [editTitle, editCompany, renameTarget]
  );

  const handleDelete = useCallback(
    async (targetId: string) => {
      setDeletingId(targetId);
      await deleteTarget(targetId);
      setDeletingId(null);
    },
    [deleteTarget]
  );

  const startEditing = useCallback(
    (targetId: string) => {
      const target = jobTargets.find((t) => t.id === targetId);
      if (!target) return;
      setEditingId(targetId);
      setEditTitle(target.title || "");
      setEditCompany(target.company || "");
    },
    [jobTargets]
  );

  // No targets — show add prompt
  if (jobTargets.length === 0 && !activeJobTarget) {
    return (
      <div className="relative" ref={dropdownRef}>
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50/60 border border-blue-100/50 px-4 py-2.5 rounded-xl w-full transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Set a target job</span>
          </button>
        ) : (
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Add Target Job</span>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewJdText(""); }}
                className="text-gray-400 hover:text-gray-600 min-h-[44px] flex items-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={newJdText}
              onChange={(e) => setNewJdText(e.target.value)}
              placeholder="Paste a job description here..."
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || newJdText.trim().length < 20}
              className="btn-primary flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Set as Target"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setShowAddForm(false); setEditingId(null); }}
        className={`flex items-center justify-between w-full text-left transition-colors min-h-[44px] ${
          compact
            ? "gap-2 text-xs px-2.5 py-2 rounded-lg bg-blue-50/80 border border-blue-100"
            : "gap-2 text-sm px-4 py-2.5 rounded-xl bg-blue-50/60 border border-blue-100/50"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Briefcase className={`flex-shrink-0 text-blue-500 ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
          <div className="min-w-0 flex-1">
            <span className={`font-semibold text-blue-700 truncate block ${compact ? "text-xs" : "text-sm"}`}>
              {activeJobTarget?.title || "Select target"}
            </span>
            {!compact && activeJobTarget?.company && (
              <span className="text-xs text-blue-500 truncate block">
                {activeJobTarget.company}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {jobTargets.length > 1 && (
            <span className={`font-medium text-blue-400 ${compact ? "text-[10px]" : "text-xs"}`}>
              {jobTargets.length}
            </span>
          )}
          <ChevronDown className={`text-blue-400 transition-transform ${open ? "rotate-180" : ""} ${compact ? "w-3 h-3" : "w-4 h-4"}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-[400px] overflow-y-auto">
          {/* Target list */}
          <div className="py-1">
            {jobTargets.map((target) => {
              const isActive = target.id === activeJobTarget?.id;
              const isEditing = editingId === target.id;
              const isDeleting = deletingId === target.id;

              if (isEditing) {
                return (
                  <div key={target.id} className="px-3 py-2 space-y-2 bg-gray-50 border-b border-gray-100">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Job title"
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <input
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="Company (optional)"
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRename(target.id)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 min-h-[36px] px-2"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 min-h-[36px] px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={target.id}
                  className={`flex items-center gap-2 px-3 py-2.5 transition-colors group ${
                    isActive
                      ? "bg-blue-50/80"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  {/* Select area */}
                  <button
                    type="button"
                    onClick={() => handleSwitch(target.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 min-h-[36px] text-left"
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      isActive ? "bg-blue-600 text-white" : "border border-gray-300"
                    }`}>
                      {isActive && <Check className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${isActive ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                        {target.title}
                      </p>
                      {target.company && (
                        <p className="text-xs text-gray-500 truncate">{target.company}</p>
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startEditing(target.id); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      title="Rename"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(target.id); }}
                      disabled={isDeleting}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 min-h-[32px] min-w-[32px] flex items-center justify-center disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new target */}
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-100 min-h-[44px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add another target
            </button>
          ) : (
            <div className="px-3 py-3 border-t border-gray-100 space-y-2 bg-gray-50/50">
              <textarea
                value={newJdText}
                onChange={(e) => setNewJdText(e.target.value)}
                placeholder="Paste a job description..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={saving || newJdText.trim().length < 20}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-3 h-3" />
                  {saving ? "Saving..." : "Add & Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setNewJdText(""); }}
                  className="text-xs text-gray-500 hover:text-gray-700 min-h-[36px] px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";
import { INDUSTRIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app-store";

const EXPERIENCE_OPTIONS = ["0-2", "3-5", "6-10", "10+"] as const;

interface InlineProfileFormProps {
  careerProfile?: {
    title?: string | null;
    industry?: string | null;
    years_experience?: number | null;
    location?: string | null;
  } | null;
  onSaved?: () => void;
  compact?: boolean;
}

export function InlineProfileForm({
  careerProfile,
  onSaved,
  compact = false,
}: InlineProfileFormProps) {
  const [title, setTitle] = useState(careerProfile?.title ?? "");
  const [industry, setIndustry] = useState(careerProfile?.industry ?? "");
  const [yearsExperience, setYearsExperience] = useState(
    experienceToRange(careerProfile?.years_experience)
  );
  const [location, setLocation] = useState(careerProfile?.location ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Determine which fields are missing from the current profile
  const missingTitle = !careerProfile?.title;
  const missingIndustry = !careerProfile?.industry;
  const missingExperience = careerProfile?.years_experience == null;
  const missingLocation = !careerProfile?.location;

  // If nothing is missing, show a brief confirmation
  const allFilled =
    !missingTitle && !missingIndustry && !missingExperience && !missingLocation;

  const handleSave = useCallback(async () => {
    setError(null);
    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to save your profile.");
        return;
      }

      const yearsNum = rangeToExperience(yearsExperience);

      const { data, error: dbError } = await supabase
        .from("career_profiles")
        .upsert(
          {
            user_id: user.id,
            ...(title.trim() ? { title: title.trim() } : {}),
            ...(industry ? { industry } : {}),
            ...(yearsNum !== null ? { years_experience: yearsNum } : {}),
            ...(location.trim() ? { location: location.trim() } : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (dbError) {
        setError("Failed to save profile. Please try again.");
        console.error("InlineProfileForm save error:", dbError);
        return;
      }

      if (data) {
        const existing = useAppStore.getState().careerProfile;
        useAppStore.getState().setCareerProfile({ ...existing, ...data });
      }

      setSaved(true);
      onSaved?.();

      // Clear saved indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("InlineProfileForm error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }, [title, industry, yearsExperience, location, onSaved]);

  if (allFilled && !compact) {
    return null; // nothing to show when everything is filled (non-compact)
  }

  // --- Compact layout: single row ---
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-end gap-2">
          {missingTitle && (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Marketing Manager"
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Job title"
            />
          )}
          {missingIndustry && (
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              aria-label="Industry"
            >
              <option value="">Industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          )}
          {missingExperience && (
            <select
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="flex-1 min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              aria-label="Years of experience"
            >
              <option value="">Experience</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} years
                </option>
              ))}
            </select>
          )}
          {missingLocation && (
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="flex-1 min-w-[140px] rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Location"
            />
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white min-h-[44px] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Save className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // --- Stacked layout ---
  return (
    <div className="space-y-4">
      {missingTitle && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Job Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Marketing Manager"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {missingIndustry && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      )}

      {missingExperience && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Years of Experience
          </label>
          <select
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Select range</option>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} years
              </option>
            ))}
          </select>
        </div>
      )}

      {missingLocation && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. San Francisco, CA"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm min-h-[44px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-medium text-white min-h-[48px] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving…" : "Save Profile"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">
            Profile saved!
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// --- Helpers ---

/** Convert a numeric years_experience to a range string for the select. */
function experienceToRange(years: number | null | undefined): string {
  if (years == null) return "";
  if (years <= 2) return "0-2";
  if (years <= 5) return "3-5";
  if (years <= 10) return "6-10";
  return "10+";
}

/** Convert a range string back to a representative number. */
function rangeToExperience(range: string): number | null {
  switch (range) {
    case "0-2":
      return 1;
    case "3-5":
      return 4;
    case "6-10":
      return 8;
    case "10+":
      return 15;
    default:
      return null;
  }
}

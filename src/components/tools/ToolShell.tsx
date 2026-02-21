"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, RotateCcw, Share2, ArrowRight, AlertCircle, Lightbulb, BarChart3, Quote, Zap, Sparkles, X, Save, Target, Clock } from "lucide-react";
import { ResumeUploadOrPaste } from "@/components/shared/ResumeUploadOrPaste";
import { InlineProfileForm } from "@/components/shared/InlineProfileForm";
import { JobTargetSelector } from "@/components/shared/JobTargetSelector";
import { NpsWidget } from "@/components/shared/NpsWidget";
import { ShareModal } from "@/components/shared/ShareModal";
import { Paywall } from "./Paywall";
import { useTokens } from "@/hooks/useTokens";
import { useMission } from "@/hooks/useMission";
import { useWave2JourneyFlow } from "@/hooks/useWave2JourneyFlow";
import { useAppStore } from "@/stores/app-store";
import { EVENTS, track } from "@/lib/analytics";
import { TOOLS_MAP, MISSION_ACTIONS, calculateProfileCompleteness, formatTokenAmountLabel } from "@/lib/constants";
import { safeLocalStorage, safeSessionStorage } from "@/lib/safe-storage";
import { createClient } from "@/lib/supabase/client";
import { getLoadingInsights } from "@/lib/loading-insights";
import type { InsightCategory } from "@/lib/loading-insights";
import type { ToolState, ToolProgress, ToolResult, CareerProfile, JobTarget } from "@/types";

/** Blocklist for placeholder values returned by AI detected_profile fields. */
const PLACEHOLDER_VALUES = ["not provided", "n/a", "unknown", "unknown role", "not specified", "none", ""];
function isPlaceholderValue(val: unknown): boolean {
  if (typeof val !== "string") return true;
  return !val.trim() || PLACEHOLDER_VALUES.includes(val.toLowerCase().trim());
}

/** Narrative copy linking current tool to the recommended next */
const NARRATIVE_TRANSITIONS: Record<string, Record<string, string>> = {
  displacement: {
    jd_match: "Now you know your AI risk. Let's see how you match against a real job.",
    skills_gap: "Understand which skills to build to stay ahead of AI.",
    resume: "Make your resume reflect the skills AI can't replace.",
  },
  jd_match: {
    resume: "You know the gaps. Let's fix your resume to close them.",
    cover_letter: "Good match? Let's write a cover letter that seals it.",
    interview: "Prepare for interview questions about the requirements you matched.",
  },
  resume: {
    cover_letter: "Resume optimized. Now let's write a cover letter that tells your story.",
    linkedin: "Keep your LinkedIn profile in sync with your new resume.",
    jd_match: "Test your new resume against more job postings.",
  },
  cover_letter: {
    interview: "Application materials ready. Time to prepare for the interview.",
    resume: "Fine-tune your resume based on what the cover letter revealed.",
    linkedin: "Update your LinkedIn to match your application narrative.",
  },
  linkedin: {
    resume: "Keep your resume aligned with your LinkedIn profile.",
    headshots: "A professional photo makes your profile 14x more visible.",
    skills_gap: "Identify skills that'll make your profile stand out.",
  },
  headshots: {
    linkedin: "Update your LinkedIn with your new professional headshot.",
    resume: "While you're at it, optimize your resume too.",
    cover_letter: "Complete your professional package with a tailored cover letter.",
  },
  interview: {
    salary: "Ready for the offer? Let's make sure you negotiate well.",
    skills_gap: "Strengthen the areas interviewers will probe.",
    cover_letter: "Refine your cover letter with interview insights.",
  },
  skills_gap: {
    roadmap: "You know the gaps. Let's build a plan to close them.",
    resume: "Highlight the transferable skills you already have.",
    interview: "Prepare answers that address your skill gaps head-on.",
  },
  roadmap: {
    skills_gap: "Deep-dive into the specific skills your roadmap calls for.",
    entrepreneurship: "Explore building income while you execute your plan.",
    salary: "Know your market value at each milestone.",
  },
  salary: {
    interview: "Practice delivering your negotiation with confidence.",
    jd_match: "Find roles that match your salary expectations.",
    cover_letter: "Position your value in writing before the negotiation.",
  },
  entrepreneurship: {
    roadmap: "Build a timeline for launching your income stream.",
    skills_gap: "Find the skills you'll need for your business idea.",
    salary: "Understand your freelance rate based on market data.",
  },
};

/** Tool dependency hints — shown on input page when prerequisite hasn't been run */
const TOOL_DEPENDENCIES: Record<string, { prereqToolId: string; prereqLabel: string; hint: string }> = {
  resume: {
    prereqToolId: "jd_match",
    prereqLabel: "Job Match Score",
    hint: "Run Job Match Score first to see your gaps — Resume Optimizer will use those gaps to make targeted improvements.",
  },
  cover_letter: {
    prereqToolId: "jd_match",
    prereqLabel: "Job Match Score",
    hint: "Run Job Match Score first so your cover letter addresses specific requirements from the job posting.",
  },
  interview: {
    prereqToolId: "jd_match",
    prereqLabel: "Job Match Score",
    hint: "Run Job Match Score first — Interview Prep will focus on the exact requirements and gaps identified.",
  },
  salary: {
    prereqToolId: "jd_match",
    prereqLabel: "Job Match Score",
    hint: "Run Job Match Score first so salary data is tailored to the specific role and company type.",
  },
  roadmap: {
    prereqToolId: "skills_gap",
    prereqLabel: "Skills Gap",
    hint: "Run Skills Gap first — your roadmap will be built around the specific gaps identified.",
  },
  linkedin: {
    prereqToolId: "resume",
    prereqLabel: "Resume Optimizer",
    hint: "Optimize your resume first — LinkedIn optimization will stay consistent with your resume messaging.",
  },
  entrepreneurship: {
    prereqToolId: "displacement",
    prereqLabel: "AI Displacement Score",
    hint: "Run AI Displacement Score first (it's free!) — entrepreneurship ideas will build on your strongest skills.",
  },
};

const TOOL_EFFORT_HINTS: Record<string, string> = {
  displacement: "~30 sec",
  jd_match: "~30 sec",
  resume: "~45-60 sec",
  cover_letter: "~30-45 sec",
  linkedin: "~45 sec",
  headshots: "~60-120 sec",
  interview: "~45 sec",
  skills_gap: "~30-45 sec",
  roadmap: "~45 sec",
  salary: "~30 sec",
  entrepreneurship: "~45 sec",
};

/** Generate a contextual narrative based on actual result data */
function getResultAwareNarrative(
  fromToolId: string,
  toToolId: string,
  result: ToolResult | null,
): string | null {
  if (!result) return null;
  const r = result as unknown as Record<string, unknown>;

  // JD Match → Resume: mention gap count
  if (fromToolId === "jd_match" && toToolId === "resume") {
    const gaps = r.critical_gaps as Array<unknown> | undefined;
    const score = r.fit_score as number | undefined;
    if (gaps && gaps.length > 0) {
      return `Your match score is ${score ?? "??"}/100 with ${gaps.length} gap${gaps.length !== 1 ? "s" : ""} to close. Let's fix your resume to address ${gaps.length === 1 ? "it" : "them"}.`;
    }
  }

  // JD Match → Cover Letter: mention match score
  if (fromToolId === "jd_match" && toToolId === "cover_letter") {
    const score = r.fit_score as number | undefined;
    if (score != null && score >= 60) {
      return `Strong ${score}/100 match. A tailored cover letter can strengthen your application narrative.`;
    } else if (score != null) {
      return `At ${score}/100, a compelling cover letter can bridge the gap. Let's write one that highlights your strengths.`;
    }
  }

  // JD Match → Interview: mention gap count
  if (fromToolId === "jd_match" && toToolId === "interview") {
    const gaps = r.critical_gaps as Array<unknown> | undefined;
    if (gaps && gaps.length > 0) {
      return `Interviewers will probe your ${gaps.length} gap${gaps.length !== 1 ? "s" : ""}. Let's prepare answers that address them head-on.`;
    }
  }

  // Resume → Cover Letter: mention score improvement
  if (fromToolId === "resume" && toToolId === "cover_letter") {
    const after = r.score_after as number | undefined;
    if (after != null) {
      return `Resume optimized to ${after}/100. Now let's write a cover letter that tells the story behind it.`;
    }
  }

  // Resume → LinkedIn: mention alignment
  if (fromToolId === "resume" && toToolId === "linkedin") {
    return "Resume refreshed — let's sync your LinkedIn profile so recruiters see a consistent narrative.";
  }

  // Displacement → Skills Gap: mention risk
  if (fromToolId === "displacement" && toToolId === "skills_gap") {
    const score = r.score as number | undefined;
    if (score != null && score >= 60) {
      return `With a ${score}/100 displacement risk, upskilling is urgent. Let's identify the exact skills to build.`;
    } else if (score != null) {
      return `Your ${score}/100 risk score shows opportunity areas. Let's map the skills that will keep you ahead.`;
    }
  }

  // Displacement → JD Match
  if (fromToolId === "displacement" && toToolId === "jd_match") {
    return "Now let's see how your skills match against a real job posting.";
  }

  // Skills Gap → Roadmap
  if (fromToolId === "skills_gap" && toToolId === "roadmap") {
    const gaps = r.gaps as Array<unknown> | undefined;
    if (gaps && gaps.length > 0) {
      const critical = (gaps as Array<Record<string, unknown>>).filter((g) => g.priority === "critical" || g.priority === "high").length;
      if (critical > 0) {
        return `${critical} critical skill${critical !== 1 ? "s" : ""} to develop. Let's build a timeline with weekly milestones.`;
      }
      return `${gaps.length} skill gap${gaps.length !== 1 ? "s" : ""} identified. Let's create an action plan with deadlines.`;
    }
  }

  return null; // Fall back to default static narrative
}

function getDynamicRecommendation(
  currentToolId: string,
  result: ToolResult | null,
  completedToolIds: Set<string>
) {
  const transitions = NARRATIVE_TRANSITIONS[currentToolId];
  if (!transitions) return null;

  const entries = Object.entries(transitions).filter(([nextToolId]) => !completedToolIds.has(nextToolId));
  if (entries.length === 0) return null;

  // Return the first (highest priority) recommendation
  const [nextToolId, defaultNarrative] = entries[0];
  const nextTool = TOOLS_MAP[nextToolId];
  if (!nextTool) return null;

  // Generate result-aware narrative if we have data
  const narrative = getResultAwareNarrative(currentToolId, nextToolId, result) || defaultNarrative;

  return { tool: nextTool, narrative };
}

function getSecondaryRecommendations(currentToolId: string, completedToolIds: Set<string>) {
  const transitions = NARRATIVE_TRANSITIONS[currentToolId];
  if (!transitions) return [];

  return Object.keys(transitions)
    .filter((id) => !completedToolIds.has(id))
    .slice(1) // skip the primary recommendation
    .map((id) => TOOLS_MAP[id])
    .filter(Boolean);
}

// --- Insight Card for loading state ---
const CATEGORY_CONFIG: Record<InsightCategory, { icon: typeof Lightbulb; label: string; bg: string; border: string; iconColor: string; labelColor: string }> = {
  tip: { icon: Lightbulb, label: "Did you know?", bg: "bg-amber-50", border: "border-amber-200", iconColor: "text-amber-600", labelColor: "text-amber-700" },
  stat: { icon: BarChart3, label: "Industry Insight", bg: "bg-blue-50", border: "border-blue-200", iconColor: "text-blue-600", labelColor: "text-blue-700" },
  quote: { icon: Quote, label: "Words of Wisdom", bg: "bg-indigo-50", border: "border-indigo-200", iconColor: "text-indigo-600", labelColor: "text-indigo-700" },
  pain_solution: { icon: Zap, label: "Why This Matters", bg: "bg-emerald-50", border: "border-emerald-200", iconColor: "text-emerald-600", labelColor: "text-emerald-700" },
};

function InsightCard({ category, text, source }: { category: InsightCategory; text: string; source?: string }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl p-4 sm:p-5`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${config.labelColor} mb-1`}>{config.label}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
          {source && (
            <p className="text-xs text-gray-400 mt-1.5 italic">{category === "quote" ? `— ${source}` : source}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Auto-save detected profile to career_profiles if profile is sparse */
async function autoSaveDetectedProfile(
  result: Record<string, unknown>,
  currentCareerProfile: CareerProfile | null,
  userId: string,
  inputs?: Record<string, unknown>,
  toolId?: string,
): Promise<CareerProfile | null> {
  const detected = result.detected_profile as Record<string, unknown> | undefined;

  // Build update object
  const updates: {
    user_id: string;
    updated_at: string;
    title?: string;
    industry?: string;
    name?: string;
    years_experience?: number;
    resume_text?: string;
    source?: string;
    skills?: string[];
    skill_gaps?: string[];
    displacement_score?: number;
    resume_score?: number;
  } = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  const hasTitle = currentCareerProfile?.title && currentCareerProfile.title.trim() !== "";
  const hasIndustry = currentCareerProfile?.industry && currentCareerProfile.industry.trim() !== "";

  let fieldCount = 0;

  // Save title/industry/name/experience from detected_profile
  if (detected) {
    if (!hasTitle && !isPlaceholderValue(detected.role)) {
      updates.title = String(detected.role);
      fieldCount++;
    }
    if (!hasIndustry && !isPlaceholderValue(detected.industry)) {
      updates.industry = String(detected.industry);
      fieldCount++;
    }
    if (!isPlaceholderValue(detected.name) && !currentCareerProfile?.name) {
      updates.name = String(detected.name);
      fieldCount++;
    }
    if (!isPlaceholderValue(detected.experience_years) && !currentCareerProfile?.years_experience) {
      const years = parseInt(String(detected.experience_years), 10);
      if (!isNaN(years)) {
        updates.years_experience = years;
        fieldCount++;
      }
    }

    // Save skills if detected and profile has none
    const profileSkills = currentCareerProfile?.skills as unknown[] | null;
    if ((!profileSkills || profileSkills.length === 0) && detected.key_skills && Array.isArray(detected.key_skills) && detected.key_skills.length > 0) {
      updates.skills = (detected.key_skills as string[]).map(String);
      fieldCount++;
    }

    // Save skill_gaps if detected
    const profileGaps = currentCareerProfile?.skill_gaps as unknown[] | null;
    if ((!profileGaps || profileGaps.length === 0) && detected.skill_gaps && Array.isArray(detected.skill_gaps) && detected.skill_gaps.length > 0) {
      updates.skill_gaps = (detected.skill_gaps as string[]).map(String);
      fieldCount++;
    }
  }

  // Save resume_text from inputs if profile doesn't have one
  if (!currentCareerProfile?.resume_text && inputs?.resume_text && typeof inputs.resume_text === "string" && inputs.resume_text.trim().length > 50) {
    updates.resume_text = inputs.resume_text.trim();
    updates.source = "paste";
    fieldCount++;
  }

  // Save displacement score
  if (toolId === "displacement" && typeof result.overall_score === "number") {
    updates.displacement_score = result.overall_score;
    fieldCount++;
  }

  // Save resume/ATS score
  if (toolId === "resume" && typeof result.ats_score === "number") {
    updates.resume_score = result.ats_score;
    fieldCount++;
  }

  // Only update if we have something new to save
  if (fieldCount === 0) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("career_profiles")
      .upsert(updates, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Auto-profile save failed:", error);
      return null;
    }
    return data as CareerProfile;
  } catch (err) {
    console.error("Auto-profile save error:", err);
    return null;
  }
}

/** Auto-save JD text as active job target if none exists */
async function autoSaveJobTarget(
  inputs: Record<string, unknown>,
  currentJobTarget: JobTarget | null,
  userId: string,
): Promise<JobTarget | null> {
  // Only save if no active job target and inputs contain jd_text
  if (currentJobTarget?.jd_text) return null;
  const jdText = inputs.jd_text || inputs.target_jd;
  if (!jdText || typeof jdText !== "string" || jdText.trim().length < 50) return null;

  try {
    const supabase = createClient();

    // Try to extract title from JD text (simple heuristic)
    const lines = jdText.trim().split("\n").filter((l: string) => l.trim());
    const possibleTitle = lines[0]?.trim().slice(0, 100) || "Untitled Position";

    const { data, error } = await supabase
      .from("job_targets")
      .insert({
        user_id: userId,
        jd_text: jdText.trim(),
        title: possibleTitle,
        company: "",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Auto job target save failed:", error);
      return null;
    }
    return data as JobTarget;
  } catch (err) {
    console.error("Auto job target save error:", err);
    return null;
  }
}

interface ToolShellProps {
  toolId: string;
  children: (props: {
    state: ToolState;
    result: ToolResult | null;
    progress: ToolProgress;
    onRun: (inputs: Record<string, unknown>) => void;
    onReset: () => void;
  }) => React.ReactNode;
}

export function ToolShell({ toolId, children }: ToolShellProps) {
  const wave2JourneyFlowEnabled = useWave2JourneyFlow();
  const tool = TOOLS_MAP[toolId];
  const [state, setState] = useState<ToolState>("input");
  const [result, setResult] = useState<ToolResult | null>(null);
  const [progress, setProgress] = useState<ToolProgress>({ step: 0, total: 5, message: "" });
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingInputs, setPendingInputs] = useState<Record<string, unknown> | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { balance, refreshBalance } = useTokens();
  const { completeAction } = useMission();
  const careerProfile = useAppStore((s) => s.careerProfile);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);
  const jobTargets = useAppStore((s) => s.jobTargets);
  const setCareerProfile = useAppStore((s) => s.setCareerProfile);
  const setActiveJobTarget = useAppStore((s) => s.setActiveJobTarget);
  const setJobTargets = useAppStore((s) => s.setJobTargets);

  const isRunning = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const elapsedInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [insightIdx, setInsightIdx] = useState(0);
  const [completedToolIds, setCompletedToolIds] = useState<Set<string>>(new Set());
  const [showInputSupport, setShowInputSupport] = useState(false);
  const [showNps, setShowNps] = useState(false);
  const [showReferralPrompt, setShowReferralPrompt] = useState(false);
  const [resultActionTaken, setResultActionTaken] = useState(false);

  const primaryRecommendation = useMemo(() => {
    if (!result) return null;
    return getDynamicRecommendation(toolId, result, completedToolIds);
  }, [completedToolIds, result, toolId]);
  const secondaryRecommendations = useMemo(() => {
    if (!result) return [];
    return getSecondaryRecommendations(toolId, completedToolIds);
  }, [completedToolIds, result, toolId]);
  const missionComplete = useMemo(
    () => MISSION_ACTIONS.every((a) => completedToolIds.has(a.toolId)),
    [completedToolIds]
  );

  useEffect(() => {
    if (!wave2JourneyFlowEnabled || state !== "result" || !primaryRecommendation || missionComplete) return;
    track(EVENTS.TOOL_PRIMARY_ACTION_VIEWED, {
      route: `/tools/${toolId}`,
      tool_id: toolId,
      next_tool_id: primaryRecommendation.tool.id,
    });
  }, [wave2JourneyFlowEnabled, state, primaryRecommendation, missionComplete, toolId]);
  const [variantSaved, setVariantSaved] = useState(false);
  const [savingVariant, setSavingVariant] = useState(false);
  const [scoreDelta, setScoreDelta] = useState<{ previous: number; current: number; delta: number } | null>(null);
  const [insightsDismissed, setInsightsDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return safeSessionStorage.getItem(`insights-dismissed-${toolId}`) === "1";
  });
  // (target editor state removed — now handled by JobTargetSelector)

  // Restore pendingInputs from localStorage after Stripe redirect
  useEffect(() => {
    const stored = safeLocalStorage.getItem("pendingInputs");
    if (stored) {
      try { setPendingInputs(JSON.parse(stored)); } catch { /* ignore */ }
      safeLocalStorage.removeItem("pendingInputs");
    }
  }, []);

  // Memoize loading insights so they shuffle once per tool, not per render
  const loadingInsights = useMemo(() => getLoadingInsights(toolId), [toolId]);

  // Elapsed timer + insight rotation for loading state
  useEffect(() => {
    if (state === "loading") {
      setElapsedSec(0);
      setInsightIdx(0);
      elapsedInterval.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    } else {
      if (elapsedInterval.current) {
        clearInterval(elapsedInterval.current);
        elapsedInterval.current = null;
      }
    }
    return () => {
      if (elapsedInterval.current) clearInterval(elapsedInterval.current);
    };
  }, [state]);

  // Rotate insights every 5 seconds during loading
  useEffect(() => {
    if (state !== "loading" || loadingInsights.length === 0) return;
    const timer = setInterval(() => {
      setInsightIdx((prev) => (prev + 1) % loadingInsights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [state, loadingInsights]);

  // Cleanup: abort any in-flight request when component unmounts
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Show NPS widget only after action or a 20s idle period.
  useEffect(() => {
    if (state === "result" && result && !error) {
      if (resultActionTaken) {
        setShowNps(true);
        return;
      }
      const timer = setTimeout(() => setShowNps(true), 20000);
      return () => clearTimeout(timer);
    } else {
      setShowNps(false);
      setResultActionTaken(false);
    }
  }, [state, result, error, resultActionTaken]);

  // Show referral prompt after NPS dismissal or 20 seconds with no interaction.
  useEffect(() => {
    if (state === "result" && result && !error && !showNps && !showReferralPrompt) {
      const timer = setTimeout(() => setShowReferralPrompt(true), 20000);
      return () => clearTimeout(timer);
    }
  }, [state, result, error, showNps, showReferralPrompt]);

  // Fetch completed tool IDs for dependency hints (b5b)
  useEffect(() => {
    const fetchCompletedTools = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data } = await supabase
          .from("tool_results")
          .select("tool_id, job_target_id")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(100);

        if (data) {
          const scoped = data.filter((r: { tool_id: string; job_target_id: string | null }) => {
            if (r.tool_id === "displacement") return true;
            if (!activeJobTarget?.id) return r.job_target_id == null;
            return r.job_target_id === activeJobTarget.id;
          });
          setCompletedToolIds(new Set(scoped.map((r: { tool_id: string }) => r.tool_id)));
        }
      } catch {
        // Silently fail — hint just won't show
      }
    };
    fetchCompletedTools();
  }, [activeJobTarget?.id]);

  const handleRun = useCallback(
    async (inputs: Record<string, unknown>) => {
      if (!tool) return;
      if (isRunning.current) return;

      isRunning.current = true;
      setError(null);

      track("tool_started", { tool_id: toolId });

      // Check tokens — use dynamic cost from inputs if provided (e.g. cover letter length pricing)
      const effectiveCost = typeof inputs.token_cost === "number" ? inputs.token_cost : tool.tokens;
      if (effectiveCost > 0 && balance < effectiveCost) {
        setPendingInputs(inputs);
        safeLocalStorage.setItem("pendingInputs", JSON.stringify(inputs));
        setShowPaywall(true);
        track(EVENTS.PAYWALL_SHOWN, {
          tool_id: toolId,
          required_tokens: effectiveCost,
          current_balance: balance,
          deficit: effectiveCost - balance,
        });
        isRunning.current = false;
        return;
      }

      setState("loading");

      // Create abort controller with 120s timeout
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => controller.abort(), 120000);

      // Fallback simulation (runs in parallel; SSE progress overrides when available)
      const toolStepMap: Record<string, string[]> = {
        displacement: ["Analyzing your role & industry...", "Calculating AI displacement risk...", "Benchmarking against market data...", "Identifying vulnerable skills...", "Generating your risk profile..."],
        jd_match: ["Extracting job requirements...", "Analyzing your qualifications...", "Calculating match score...", "Finding skill gaps...", "Generating recommendations..."],
        resume: ["Parsing resume structure...", "Calculating ATS score...", "Checking keyword optimization...", "Analyzing formatting...", "Generating optimized version..."],
        cover_letter: ["Analyzing job description...", "Matching your experience...", "Crafting narrative...", "Optimizing tone & structure...", "Finalizing cover letter..."],
        linkedin: ["Auditing your profile...", "Analyzing headline & summary...", "Checking keyword density...", "Benchmarking against top profiles...", "Generating recommendations..."],
        headshots: ["Uploading photos...", "Processing images...", "Generating headshots...", "Finalizing..."],
        interview: ["Analyzing role requirements...", "Generating likely questions...", "Crafting STAR responses...", "Preparing follow-ups...", "Building your prep guide..."],
        skills_gap: ["Mapping current skills...", "Analyzing market demand...", "Identifying gaps...", "Prioritizing learning paths...", "Generating your plan..."],
        roadmap: ["Analyzing career trajectory...", "Mapping milestone options...", "Estimating timelines...", "Identifying accelerators...", "Building your roadmap..."],
        salary: ["Benchmarking market data...", "Analyzing your experience...", "Calculating target range...", "Preparing negotiation scripts...", "Finalizing strategy..."],
        entrepreneurship: ["Analyzing your background...", "Evaluating market opportunities...", "Assessing founder-market fit...", "Calculating risk profile...", "Generating your assessment..."],
      };
      const steps = toolStepMap[toolId] || ["Preparing your data...", "Analyzing with AI...", "Processing results...", "Formatting output...", "Finalizing..."];
      let stepIdx = 0;
      const simInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          setProgress({ step: stepIdx + 1, total: steps.length, message: steps[stepIdx] });
          stepIdx++;
        }
      }, 450);

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (toolId === "headshots") {
          // --- Headshots: upload files to Storage, then call generate-headshots ---
          const files = inputs.files as File[] | undefined;
          if (!files || files.length === 0) {
            throw new Error("Please upload at least one photo.");
          }

          setProgress({ step: 1, total: 4, message: "Uploading photos..." });

          // Upload each file to Supabase Storage
          const imagePaths: string[] = [];
          for (const file of files) {
            const filePath = `${session?.user?.id}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from("headshots-input")
              .upload(filePath, file);
            if (uploadError) {
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }
            imagePaths.push(filePath);
          }

          setProgress({ step: 2, total: 4, message: "Processing images..." });

          // Call the dedicated generate-headshots function
          const response = await fetch(`${supabaseUrl}/functions/v1/generate-headshots`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
              image_paths: imagePaths,
              style: inputs.style || "professional",
              background: inputs.background || "neutral",
            }),
          });

          if (!response.ok) {
            let errorMsg = "Headshot generation failed";
            try {
              const err = await response.json();
              const raw = err.error || "";
              if (raw.includes("timeout") || raw.includes("timed out")) {
                errorMsg = "Image generation timed out. This usually resolves on retry — please try again.";
              } else if (raw.includes("content") || raw.includes("policy") || raw.includes("safety")) {
                errorMsg = "Image couldn't be generated due to content guidelines. Try a different photo.";
              } else if (raw.includes("rate") || raw.includes("limit")) {
                const retryAfter = typeof err.retry_after_seconds === "number" ? err.retry_after_seconds : null;
                errorMsg = retryAfter
                  ? `Too many requests. Please wait ${retryAfter} seconds and try again.`
                  : "Too many requests. Please wait a minute and try again.";
              } else if (raw) {
                errorMsg = raw;
              }
            } catch {
              errorMsg = "Image generation failed. Please try again — your tokens were not charged.";
            }
            throw new Error(errorMsg);
          }

          setProgress({ step: 3, total: 4, message: "Generating headshots..." });

          const data = await response.json();

          // Transform result to match HeadshotsResults expected format
          const headshotsResult = {
            images: (data.result?.headshots || []).map(
              (h: { url: string; style: string; index: number }) => ({
                id: `headshot-${h.index}`,
                url: h.url,
                style: h.style,
              })
            ),
            ...data.result,
          };

          setResult(headshotsResult as ToolResult);
          setCompletedToolIds((prev) => new Set(prev).add(toolId));
          // Tokens already deducted server-side in generate-headshots; just refresh
          await refreshBalance();
          track("tool_completed", { tool_id: toolId });
          setState("result");
        } else {
          // --- Standard tools: call run-tool with SSE ---
          const response = await fetch(`${supabaseUrl}/functions/v1/run-tool`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
              tool_id: toolId,
              inputs,
              job_target_id: toolId === "displacement" ? null : (activeJobTarget?.id || null),
            }),
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Tool execution failed");
          }

          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("text/event-stream") && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let lastActivity = Date.now();
            const STREAM_TIMEOUT = 60000; // 60s without data = stalled

            while (true) {
              // Check for stream stall
              if (Date.now() - lastActivity > STREAM_TIMEOUT) {
                throw new Error("Analysis stream stalled. Please try again — your tokens are safe.");
              }

              const readPromise = reader.read();
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Analysis stream stalled. Please try again — your tokens are safe.")), STREAM_TIMEOUT)
              );

              const { done, value } = await Promise.race([readPromise, timeoutPromise]);
              if (done) break;

              lastActivity = Date.now();
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n\n");
              buffer = lines.pop() || "";

              for (const block of lines) {
                const eventMatch = block.match(/^event: (.+)$/m);
                const dataMatch = block.match(/^data: (.+)$/m);
                if (!eventMatch || !dataMatch) continue;

                const event = eventMatch[1];
                const data = JSON.parse(dataMatch[1]);

                if (event === "progress") {
                  setProgress({ step: data.step, total: data.total, message: data.message });
                } else if (event === "complete") {
                  setResult(data.result as ToolResult);
                  setCompletedToolIds((prev) => new Set(prev).add(toolId));
                  // Score delta from backend comparison
                  if (data.score_delta != null && data.previous_score != null) {
                    const metricVal = data.metric_value ?? data.score_delta + data.previous_score;
                    setScoreDelta({
                      previous: data.previous_score,
                      current: metricVal,
                      delta: data.score_delta,
                    });
                  }
                  // Tokens already deducted server-side in run-tool; just refresh balance
                  if (tool.tokens > 0) {
                    await refreshBalance();
                  }
                  // Mark corresponding mission action as completed
                  const missionAction = MISSION_ACTIONS.find((a) => a.toolId === toolId);
                  if (missionAction) {
                    await completeAction(missionAction.id);
                  }
                  // Auto-save detected profile data
                  const sseResultObj = data.result as Record<string, unknown>;
                  if (session?.user?.id) {
                    const savedProfile = await autoSaveDetectedProfile(
                      sseResultObj,
                      careerProfile,
                      session.user.id,
                      inputs,
                      toolId,
                    );
                    if (savedProfile) {
                      setCareerProfile(savedProfile);
                    }
                    // Auto-save JD as job target
                    const savedJobTarget = await autoSaveJobTarget(inputs, activeJobTarget, session.user.id);
                    if (savedJobTarget) {
                      setActiveJobTarget(savedJobTarget);
                      setJobTargets([savedJobTarget, ...jobTargets.map((t) => ({ ...t, is_active: false }))]);
                    }
                  }
                  track("tool_completed", { tool_id: toolId });
                  setState("result");
                } else if (event === "error") {
                  throw new Error(data.error);
                }
              }
            }
          } else {
            // Fallback: plain JSON response (when Edge Function isn't deployed with SSE yet)
            const data = await response.json();
            setResult(data.result as ToolResult);
            // Score delta from backend comparison
            if (data.score_delta != null && data.previous_score != null) {
              const metricVal = data.metric_value ?? data.score_delta + data.previous_score;
              setScoreDelta({
                previous: data.previous_score,
                current: metricVal,
                delta: data.score_delta,
              });
            }
            // Tokens already deducted server-side in run-tool; just refresh balance
            if (tool.tokens > 0) {
              await refreshBalance();
            }
            // Mark corresponding mission action as completed
            const missionAction = MISSION_ACTIONS.find((a) => a.toolId === toolId);
            if (missionAction) {
              await completeAction(missionAction.id);
            }
            // Auto-save detected profile data
            const jsonResultObj = data.result as Record<string, unknown>;
            if (session?.user?.id) {
              const savedProfile = await autoSaveDetectedProfile(
                jsonResultObj,
                careerProfile,
                session.user.id,
                inputs,
                toolId,
              );
              if (savedProfile) {
                setCareerProfile(savedProfile);
              }
              // Auto-save JD as job target
              const savedJobTarget = await autoSaveJobTarget(inputs, activeJobTarget, session.user.id);
              if (savedJobTarget) {
                setActiveJobTarget(savedJobTarget);
                setJobTargets([savedJobTarget, ...jobTargets.map((t) => ({ ...t, is_active: false }))]);
              }
            }
            track("tool_completed", { tool_id: toolId });
            setCompletedToolIds((prev) => new Set(prev).add(toolId));
            setState("result");
          }
        }
      } catch (err) {
        console.error("Tool execution error:", err);
        let message: string;
        if (err instanceof DOMException && err.name === "AbortError") {
          message = "Analysis timed out after 2 minutes. Please try again — your tokens were not deducted.";
        } else if (err instanceof TypeError && (err.message === "Failed to fetch" || err.message.includes("NetworkError") || err.message.includes("network"))) {
          message = "Connection lost. Please check your internet and try again. Your tokens are safe.";
        } else if (err instanceof Error) {
          message = err.message;
        } else {
          message = "Analysis didn't complete — most likely a temporary issue. Your tokens were not deducted.";
        }
        track("tool_error", { tool_id: toolId, error: message });
        setError(message);
        setState("result");
      } finally {
        clearInterval(simInterval);
        clearTimeout(timeoutId);
        abortControllerRef.current = null;
        isRunning.current = false;
      }
    },
    [tool, balance, refreshBalance, completeAction, toolId, activeJobTarget, jobTargets, careerProfile, setCareerProfile, setActiveJobTarget, setJobTargets]
  );

  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState("input");
    setResult(null);
    setError(null);
    setProgress({ step: 0, total: 5, message: "" });
    setVariantSaved(false);
    setSavingVariant(false);
    setScoreDelta(null);
  }, []);

  const handleShare = useCallback(async () => {
    if (!result || !tool) return;
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          score_type: toolId,
          score_value: (result as unknown as Record<string, unknown>).score ?? (result as unknown as Record<string, unknown>).fit_score ?? null,
          title: careerProfile?.title || "Career Professional",
          industry: careerProfile?.industry || "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.url || `${window.location.origin}/share/${data.hash}`);
        setShowShare(true);
      }
    } catch {
      // Fallback: share current page
      setShareUrl(window.location.href);
      setShowShare(true);
    }
  }, [result, tool, toolId, careerProfile]);

  const handleSaveResumeVariant = useCallback(async () => {
    if (!result || toolId !== "resume" || savingVariant || variantSaved) return;
    const resumeResult = result as unknown as { optimized_resume_text?: string };
    if (!resumeResult.optimized_resume_text) return;

    setSavingVariant(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const targetName = activeJobTarget?.title || "General";
      const name = `Optimized for ${targetName} — ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

      const { data, error: insertError } = await supabase
        .from("resume_variants")
        .insert({
          user_id: session.user.id,
          name,
          resume_text: resumeResult.optimized_resume_text,
          job_target_id: activeJobTarget?.id || null,
          source: "optimizer",
        })
        .select()
        .single();

      if (!insertError && data) {
        setVariantSaved(true);
      }
    } catch (err) {
      console.error("Failed to save resume variant:", err);
    } finally {
      setSavingVariant(false);
    }
  }, [result, toolId, savingVariant, variantSaved, activeJobTarget]);

  // handleSaveNewTarget removed — now handled by JobTargetSelector component

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">This tool isn&apos;t available yet. Check back soon or try one of our 11 other tools.</p>
        <Link href="/dashboard" className="text-blue-600 text-sm mt-2 inline-block">
          Browse all tools
        </Link>
      </div>
    );
  }

  return (
    <div
      data-wave2-journey={wave2JourneyFlowEnabled ? "enabled" : "disabled"}
      className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6"
    >
      {/* Header */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-h1">{tool.title}</h1>
          <span className={`ui-badge ${tool.tokens === 0 ? "ui-badge-green" : "ui-badge-blue"}`}>
            {formatTokenAmountLabel(tool.tokens)}
          </span>
          <span className="ui-badge ui-badge-gray">
            {tool.category}
          </span>
          {tool.beta && (
            <span className="ui-badge ui-badge-amber">
              Beta
            </span>
          )}
        </div>
        <p className="text-body-sm max-w-2xl">{tool.description}</p>
      </div>

      {state === "input" && (() => {
        const dep = TOOL_DEPENDENCIES[toolId];
        const missingDependency = !!dep && !completedToolIds.has(dep.prereqToolId);
        const hasResume = !!careerProfile?.resume_text;
        const hasProfile = !!careerProfile?.title;
        const hasTarget = toolId === "displacement" ? true : !!activeJobTarget;
        const needsTargetHint = !activeJobTarget && ["jd_match", "resume", "cover_letter", "interview", "salary"].includes(toolId);

        return (
          <div className="space-y-4">
            <div className="surface-card-hero p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Start here now</p>
              <p className="text-sm text-gray-900 mt-1">
                Run <span className="font-semibold">{tool.title}</span> to get your next recommended move.
              </p>
              <p className="text-xs text-gray-600 mt-1.5">
                Effort: {formatTokenAmountLabel(tool.tokens)} · {TOOL_EFFORT_HINTS[toolId] || "~30-60 sec"}
              </p>
            </div>

            <div className="surface-card-soft p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`ui-badge ${hasResume ? "ui-badge-green" : "ui-badge-amber"}`}>
                  Resume {hasResume ? "ready" : "missing"}
                </span>
                <span className={`ui-badge ${hasTarget ? "ui-badge-blue" : "ui-badge-gray"}`}>
                  {toolId === "displacement" ? "Target not required" : hasTarget ? "Target selected" : "Target optional"}
                </span>
                <span className={`ui-badge ${hasProfile ? "ui-badge-blue" : "ui-badge-amber"}`}>
                  Profile {hasProfile ? "ready" : "incomplete"}
                </span>
              </div>
            </div>

            {toolId !== "displacement" && <JobTargetSelector />}

            {children({ state, result, progress, onRun: handleRun, onReset: handleReset })}

            <section className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowInputSupport((prev) => !prev)}
                aria-expanded={showInputSupport}
                aria-controls={`tool-input-support-${toolId}`}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Support context</span>
                <span className="text-gray-400">{showInputSupport ? "−" : "+"}</span>
              </button>

              {showInputSupport && (
                <div id={`tool-input-support-${toolId}`} className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
                  {missingDependency && dep && (
                    <div className="surface-card-soft px-3 py-2.5">
                      <p className="text-xs font-semibold text-amber-800">Run this first</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs text-amber-800 leading-relaxed line-clamp-2">
                          • {dep.hint}
                        </li>
                      </ul>
                      <Link
                        href={`/tools/${dep.prereqToolId}`}
                        className="text-xs font-medium text-amber-700 hover:text-amber-900 mt-1 inline-flex items-center gap-1"
                      >
                        Run {dep.prereqLabel} first
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {!insightsDismissed && (
                    <div className="relative surface-card-soft px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInsightsDismissed(true);
                          safeSessionStorage.setItem(`insights-dismissed-${toolId}`, "1");
                        }}
                        className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 transition-colors"
                        aria-label="Dismiss insight"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-xs font-semibold text-gray-700 pr-5">Why this matters</p>
                      <ul className="mt-1 space-y-1 pr-5">
                        <li className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          • {tool.painPoint}
                        </li>
                        {tool.vsCompetitor && (
                          <li className="text-xs text-blue-700 leading-relaxed line-clamp-2">
                            • Value context: {tool.vsCompetitor}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {needsTargetHint && (
                    <div className="surface-card-soft px-3 py-2.5">
                      <p className="text-xs font-semibold text-blue-800">Target-specific output</p>
                      <ul className="mt-1">
                        <li className="text-xs text-blue-800 leading-relaxed line-clamp-2">
                          • Paste a JD for role-specific recommendations.
                        </li>
                      </ul>
                    </div>
                  )}

                  {!hasResume && toolId !== "headshots" && (
                    <ResumeUploadOrPaste
                      value=""
                      onChange={() => {
                        // After upload, this component auto-saves and updates store state.
                      }}
                      compact
                      label="Add resume for personalized results"
                      autoSave
                    />
                  )}

                  {hasResume && !hasProfile && toolId !== "headshots" && (
                    <InlineProfileForm
                      careerProfile={careerProfile}
                      compact
                    />
                  )}
                </div>
              )}
            </section>
          </div>
        );
      })()}

      {/* Loading state — Rich experience with rotating insights */}
      {state === "loading" && (
        <div className="py-8 space-y-6 stagger-children" role="status" aria-live="polite">
          {/* Progress section */}
          <div className="text-center space-y-3">
            <div className="relative w-14 h-14 mx-auto">
              <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />
              <Zap className="w-5 h-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{progress.message || (careerProfile?.name ? `Analyzing your background, ${careerProfile.name.split(" ")[0]}...` : "Preparing your analysis...")}</p>
              <p className="text-xs text-gray-400 mt-1">
                Step {progress.step || 1} of {progress.total} · {elapsedSec}s
              </p>
            </div>
            <div className="w-56 bg-gray-200 rounded-full h-1.5 mx-auto overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-700 ease-out progress-glow"
                style={{ width: `${Math.max(5, (progress.step / progress.total) * 100)}%` }}
              />
            </div>
          </div>

          {/* Reassurance message */}
          <div className="text-center space-y-2">
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {elapsedSec < 10
                  ? "We are analyzing the inputs and context you provided..."
                : elapsedSec < 25
                  ? "Building your report sections with evidence-first recommendations..."
                  : "Finalizing your report and next-step recommendations..."}
            </p>
            {/* Timeout warning at 20 seconds */}
            {elapsedSec >= 20 && (
              <p className="text-xs text-amber-600 flex items-center justify-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse [animation-delay:0.4s]" />
                </span>
                Still assembling your report...
              </p>
            )}
          </div>

          {/* Rotating insight card */}
          {loadingInsights.length > 0 && (
            <div
              key={insightIdx}
              className="mx-auto max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <InsightCard
                category={loadingInsights[insightIdx].category}
                text={loadingInsights[insightIdx].text}
                source={loadingInsights[insightIdx].source}
              />
            </div>
          )}

          {/* Report skeleton preview */}
          <div className="surface-card-soft p-4 sm:p-5 space-y-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="skeleton-base skeleton-line w-32" />
              <div className="skeleton-base skeleton-line w-16" />
            </div>
            <div className="skeleton-base skeleton-block w-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="skeleton-base skeleton-block" />
              <div className="skeleton-base skeleton-block" />
            </div>
          </div>

          {/* Insight dots indicator */}
          {loadingInsights.length > 1 && (
            <div className="flex justify-center gap-1">
              {loadingInsights.slice(0, Math.min(loadingInsights.length, 12)).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    i === insightIdx % Math.min(loadingInsights.length, 12) ? "bg-blue-500" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {state === "result" && error && !result && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4 celebrate" role="alert">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Analysis did not complete</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => { setError(null); setState("input"); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Score delta banner — shown when score changed from previous run */}
      {state === "result" && result && !error && scoreDelta && scoreDelta.delta !== 0 && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium celebrate ${
          scoreDelta.delta > 0
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          <span className="text-lg">
            {scoreDelta.delta > 0 ? "↑" : "↓"}
          </span>
          <span>
            Your score {scoreDelta.delta > 0 ? "improved" : "decreased"} from{" "}
            <strong>{scoreDelta.previous}</strong> to <strong>{scoreDelta.current}</strong>{" "}
            ({scoreDelta.delta > 0 ? "+" : ""}{scoreDelta.delta})
          </span>
        </div>
      )}

      {/* Premium analysis badge — shown on successful results */}
      {state === "result" && result && !error && (
        <div className="flex items-center gap-2 text-xs text-gray-400 celebrate">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Evidence-first AI report</span>
          <span className="text-gray-300">·</span>
          <span>{careerProfile?.resume_text ? "Personalized from your resume" : "Add resume for deeper personalization"}</span>
        </div>
      )}

      {/* Profile completion prompt — shown on results page when profile is sparse */}
      {state === "result" && result && !error && (() => {
        const completeness = calculateProfileCompleteness(careerProfile, activeJobTarget);
        if (completeness.score >= 80) return null;
        const missingItems = completeness.items.filter((i) => !i.done).slice(0, 3);
        if (missingItems.length === 0) return null;
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Complete your profile for better results
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Profile {completeness.score}% complete — more context means more accurate AI analysis.
            </p>
            <div className="space-y-1.5">
              {missingItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {state === "result" && wave2JourneyFlowEnabled && !missionComplete && primaryRecommendation && (
        <div className="report-section surface-soft border-blue-100">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 mb-1">Primary action</p>
          <p className="text-sm text-gray-700 mb-3">{primaryRecommendation.narrative}</p>
          <p className="text-xs text-gray-600 mb-3">
            Effort: {formatTokenAmountLabel(primaryRecommendation.tool.tokens)} · {TOOL_EFFORT_HINTS[primaryRecommendation.tool.id] || "~30-60 sec"}
          </p>
          <Link
            href={`/tools/${primaryRecommendation.tool.id}`}
            onClick={() => {
              setResultActionTaken(true);
              track(EVENTS.TOOL_PRIMARY_ACTION_CLICKED, {
                route: `/tools/${toolId}`,
                tool_id: toolId,
                next_tool_id: primaryRecommendation.tool.id,
              });
            }}
            className="btn-primary sm:w-auto sm:px-5"
          >
            {primaryRecommendation.tool.title}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Children render prop for result state */}
      {state === "result" && children({ state, result, progress, onRun: handleRun, onReset: handleReset })}

      {/* Result actions */}
      {state === "result" && (
        <details className="report-section">
          <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Other actions
          </summary>
          <p className="text-xs text-gray-500 mt-2 mb-3">Use these after your primary next step.</p>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={handleReset} className="btn-ghost">
              <RotateCcw className="w-4 h-4" />
              Run Again
            </button>
            <button onClick={handleShare} className="btn-ghost">
              <Share2 className="w-4 h-4" />
              Share Report
            </button>
            <Link
              href="/history"
              onClick={() => track(EVENTS.NAV_HISTORY_QUICK_OPENED, { from_route: `/tools/${toolId}`, to_route: "/history" })}
              className="btn-ghost"
            >
              <Clock className="w-4 h-4" />
              Open History
            </Link>
            {toolId === "resume" && result && (result as unknown as { optimized_resume_text?: string }).optimized_resume_text && (
              <button
                onClick={handleSaveResumeVariant}
                disabled={savingVariant || variantSaved}
                className={`btn-ghost ${variantSaved ? "text-green-700 bg-green-50" : ""}`}
              >
                <Save className="w-4 h-4" />
                {variantSaved ? "Variant Saved" : savingVariant ? "Saving..." : "Save Resume Variant"}
              </button>
            )}
            {activeJobTarget && !wave2JourneyFlowEnabled && (
              <Link href="/mission" className="btn-ghost">
                Mission Control
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </details>
      )}

      {/* NPS Widget — appears after tool completion */}
      {showNps && state === "result" && result && !error && (
        <NpsWidget toolId={toolId} onDismiss={() => setShowNps(false)} />
      )}

      {/* Referral prompt — shows after NPS dismissal */}
      {showReferralPrompt && state === "result" && result && !error && !showNps && (
        <div className="surface-soft border border-blue-100 rounded-2xl p-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-semibold text-gray-900">Know someone who&apos;d find this useful?</p>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Give a friend 15 free tokens. You get 10 when they sign up.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/referral"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[44px]"
            >
              Share Your Referral Link
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setShowReferralPrompt(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Guided next step — narrative-driven */}
      {state === "result" && tool && (() => {
        const primary = primaryRecommendation;
        const secondary = secondaryRecommendations;

        return (
          <div className="space-y-3">
            {missionComplete && (
              <div className="report-section bg-emerald-50 border-emerald-200">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Mission complete</p>
                <p className="text-sm text-emerald-900 mb-2">
                  You have finished all core mission tools for this target. Continue with refinement tools or start a new mission.
                </p>
                <Link
                  href="/mission"
                  className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  Go to Mission Control
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            {/* Primary recommendation — narrative */}
            {!missionComplete && primary && !wave2JourneyFlowEnabled && (
              <Link
                href={`/tools/${primary.tool.id}`}
                onClick={() => setResultActionTaken(true)}
                className="block report-section surface-soft border-blue-100 hover:shadow-md transition-shadow group celebrate"
              >
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Next Step</p>
                <p className="text-sm text-gray-700 mb-3">{primary.narrative}</p>
                <p className="text-xs text-gray-600 mb-3">
                  Effort: {formatTokenAmountLabel(primary.tool.tokens)} · {TOOL_EFFORT_HINTS[primary.tool.id] || "~30-60 sec"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {primary.tool.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      primary.tool.tokens === 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {formatTokenAmountLabel(primary.tool.tokens)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary recommendations — compact */}
            {!missionComplete && secondary.length > 0 && (
              <details
                onToggle={(e) => {
                  const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                  if (!isOpen) return;
                  track(EVENTS.TOOL_DETAIL_EXPANDED, { route: `/tools/${toolId}`, tool_id: toolId });
                }}
                className="report-section"
              >
                <summary className="cursor-pointer text-xs text-gray-500 font-medium">
                  Other relevant tools
                </summary>
                <div className="flex flex-wrap gap-2 mt-3 stagger-children">
                  {secondary.map((rec) => (
                    <Link
                      key={rec.id}
                      href={`/tools/${rec.id}`}
                      onClick={() => setResultActionTaken(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors min-h-[36px]"
                    >
                      {rec.title}
                      <span className="text-gray-400">{formatTokenAmountLabel(rec.tokens)}</span>
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })()}

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          url={shareUrl}
          title={`My ${tool.title} results on AISkillScore`}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Paywall */}
      {showPaywall && (
        <Paywall
          requiredTokens={tool.tokens}
          currentBalance={balance}
          toolName={tool.title}
          toolId={toolId}
          toolDescription={tool.description}
          onClose={() => setShowPaywall(false)}
          onPurchaseComplete={() => {
            setShowPaywall(false);
            // Auto-retry with pending inputs after purchase
            if (pendingInputs) {
              setTimeout(() => {
                handleRun(pendingInputs);
                setPendingInputs(null);
              }, 1000);
            }
          }}
        />
      )}
    </div>
  );
}

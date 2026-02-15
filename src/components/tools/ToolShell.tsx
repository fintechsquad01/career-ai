"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, RotateCcw, Share2, ArrowRight, AlertCircle, Lightbulb, BarChart3, Quote, Zap, Sparkles, FileText, User } from "lucide-react";
import { Insight } from "@/components/shared/Insight";
import { NpsWidget } from "@/components/shared/NpsWidget";
import { ShareModal } from "@/components/shared/ShareModal";
import { Paywall } from "./Paywall";
import { useTokens } from "@/hooks/useTokens";
import { useMission } from "@/hooks/useMission";
import { useAppStore } from "@/stores/app-store";
import { track } from "@/lib/analytics";
import { TOOLS_MAP, MISSION_ACTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { getLoadingInsights } from "@/lib/loading-insights";
import type { InsightCategory } from "@/lib/loading-insights";
import type { ToolState, ToolProgress, ToolResult, CareerProfile } from "@/types";

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
    prereqLabel: "JD Match",
    hint: "Run JD Match first to see your gaps — Resume Optimizer will use those gaps to make targeted improvements.",
  },
  cover_letter: {
    prereqToolId: "jd_match",
    prereqLabel: "JD Match",
    hint: "Run JD Match first so your cover letter addresses specific requirements from the job posting.",
  },
  interview: {
    prereqToolId: "jd_match",
    prereqLabel: "JD Match",
    hint: "Run JD Match first — Interview Prep will focus on the exact requirements and gaps identified.",
  },
  salary: {
    prereqToolId: "jd_match",
    prereqLabel: "JD Match",
    hint: "Run JD Match first so salary data is tailored to the specific role and company type.",
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
      return `Strong ${score}/100 match! A tailored cover letter will seal the deal.`;
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

function getDynamicRecommendation(currentToolId: string, result: ToolResult | null) {
  const transitions = NARRATIVE_TRANSITIONS[currentToolId];
  if (!transitions) return null;

  const entries = Object.entries(transitions);
  if (entries.length === 0) return null;

  // Return the first (highest priority) recommendation
  const [nextToolId, defaultNarrative] = entries[0];
  const nextTool = TOOLS_MAP[nextToolId];
  if (!nextTool) return null;

  // Generate result-aware narrative if we have data
  const narrative = getResultAwareNarrative(currentToolId, nextToolId, result) || defaultNarrative;

  return { tool: nextTool, narrative };
}

function getSecondaryRecommendations(currentToolId: string) {
  const transitions = NARRATIVE_TRANSITIONS[currentToolId];
  if (!transitions) return [];

  return Object.keys(transitions)
    .slice(1) // skip the primary recommendation
    .map((id) => TOOLS_MAP[id])
    .filter(Boolean);
}

// --- Insight Card for loading state ---
const CATEGORY_CONFIG: Record<InsightCategory, { icon: typeof Lightbulb; label: string; bg: string; border: string; iconColor: string; labelColor: string }> = {
  tip: { icon: Lightbulb, label: "Did you know?", bg: "bg-amber-50", border: "border-amber-200", iconColor: "text-amber-600", labelColor: "text-amber-700" },
  stat: { icon: BarChart3, label: "Industry Insight", bg: "bg-blue-50", border: "border-blue-200", iconColor: "text-blue-600", labelColor: "text-blue-700" },
  quote: { icon: Quote, label: "Words of Wisdom", bg: "bg-violet-50", border: "border-violet-200", iconColor: "text-violet-600", labelColor: "text-violet-700" },
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
): Promise<CareerProfile | null> {
  const detected = result.detected_profile as Record<string, unknown> | undefined;
  if (!detected) return null;

  // Only auto-save if current profile is missing critical fields
  const hasTitle = currentCareerProfile?.title && currentCareerProfile.title.trim() !== "";
  const hasIndustry = currentCareerProfile?.industry && currentCareerProfile.industry.trim() !== "";
  if (hasTitle && hasIndustry) return null; // Profile already populated

  // Build update object from detected_profile
  const updates: {
    user_id: string;
    updated_at: string;
    title?: string;
    industry?: string;
    name?: string;
    years_experience?: number;
  } = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  let fieldCount = 0;
  if (!hasTitle && detected.role && detected.role !== "Not provided" && detected.role !== "Unknown") {
    updates.title = String(detected.role);
    fieldCount++;
  }
  if (!hasIndustry && detected.industry && detected.industry !== "Not provided" && detected.industry !== "Unknown") {
    updates.industry = String(detected.industry);
    fieldCount++;
  }
  if (detected.name && detected.name !== "Not provided" && !currentCareerProfile?.name) {
    updates.name = String(detected.name);
    fieldCount++;
  }
  if (detected.experience_years && detected.experience_years !== "Not specified" && !currentCareerProfile?.years_experience) {
    const years = parseInt(String(detected.experience_years), 10);
    if (!isNaN(years)) {
      updates.years_experience = years;
      fieldCount++;
    }
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
  const { careerProfile, activeJobTarget, setCareerProfile } = useAppStore();

  const isRunning = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const elapsedInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [insightIdx, setInsightIdx] = useState(0);
  const [completedToolIds, setCompletedToolIds] = useState<Set<string>>(new Set());
  const [showNps, setShowNps] = useState(false);
  const [showReferralPrompt, setShowReferralPrompt] = useState(false);

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

  // Show NPS widget 3 seconds after results are displayed
  useEffect(() => {
    if (state === "result" && result && !error) {
      const timer = setTimeout(() => setShowNps(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowNps(false);
    }
  }, [state, result, error]);

  // Show referral prompt after NPS dismissal or after 15 seconds
  useEffect(() => {
    if (state === "result" && result && !error && !showNps && !showReferralPrompt) {
      const timer = setTimeout(() => setShowReferralPrompt(true), 12000);
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
          .select("tool_id")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (data) {
          setCompletedToolIds(new Set(data.map((r: { tool_id: string }) => r.tool_id)));
        }
      } catch {
        // Silently fail — hint just won't show
      }
    };
    fetchCompletedTools();
  }, []);

  const handleRun = useCallback(
    async (inputs: Record<string, unknown>) => {
      if (!tool) return;
      if (isRunning.current) return;

      isRunning.current = true;
      setError(null);

      track("tool_started", { tool_id: toolId });

      // Check tokens
      if (tool.tokens > 0 && balance < tool.tokens) {
        setPendingInputs(inputs);
        setShowPaywall(true);
        isRunning.current = false;
        return;
      }

      setState("loading");

      // Create abort controller with 120s timeout
      const controller = new AbortController();
      abortControllerRef.current = controller;
      let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(() => controller.abort(), 120000);

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
            const err = await response.json();
            throw new Error(err.error || "Headshot generation failed");
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
              job_target_id: activeJobTarget?.id || null,
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
                  // Tokens already deducted server-side in run-tool; just refresh balance
                  if (tool.tokens > 0) {
                    await refreshBalance();
                  }
                  // Mark corresponding mission action as completed
                  const missionAction = MISSION_ACTIONS.find((a) => a.toolId === toolId);
                  if (missionAction) {
                    await completeAction(missionAction.id);
                  }
                  // Auto-save detected profile if career profile is sparse
                  const sseResultObj = data.result as Record<string, unknown>;
                  if (session?.user?.id && sseResultObj?.detected_profile) {
                    const savedProfile = await autoSaveDetectedProfile(
                      sseResultObj,
                      careerProfile,
                      session.user.id,
                    );
                    if (savedProfile) {
                      setCareerProfile(savedProfile);
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
            // Tokens already deducted server-side in run-tool; just refresh balance
            if (tool.tokens > 0) {
              await refreshBalance();
            }
            // Mark corresponding mission action as completed
            const missionAction = MISSION_ACTIONS.find((a) => a.toolId === toolId);
            if (missionAction) {
              await completeAction(missionAction.id);
            }
            // Auto-save detected profile if career profile is sparse
            const jsonResultObj = data.result as Record<string, unknown>;
            if (session?.user?.id && jsonResultObj?.detected_profile) {
              const savedProfile = await autoSaveDetectedProfile(
                jsonResultObj,
                careerProfile,
                session.user.id,
              );
              if (savedProfile) {
                setCareerProfile(savedProfile);
              }
            }
            track("tool_completed", { tool_id: toolId });
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
    [tool, balance, refreshBalance, completeAction, toolId, activeJobTarget, careerProfile, setCareerProfile]
  );

  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setState("input");
    setResult(null);
    setError(null);
    setProgress({ step: 0, total: 5, message: "" });
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

  if (!tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">This tool isn&apos;t available yet. Check back soon or try one of our 11 other tools.</p>
        <Link href="/dashboard" className="text-blue-600 text-sm mt-2 inline-block">
          Browse all tools
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{tool.title}</h1>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            tool.tokens === 0 ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
          }`}>
            {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {tool.category}
          </span>
        </div>
        <p className="text-gray-500 text-sm">{tool.description}</p>
      </div>

      {/* Insights */}
      <div className="space-y-1.5">
        <Insight type="pain" text={tool.painPoint} />
        {tool.vsCompetitor && <Insight type="competitive" text={tool.vsCompetitor} />}
      </div>

      {/* Context */}
      {careerProfile?.title && (
        <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl">
          Pre-loaded from your resume: <strong className="text-gray-700">{careerProfile.title}</strong>
          {careerProfile.company && ` at ${careerProfile.company}`}
        </div>
      )}
      {activeJobTarget && (
        <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2.5 rounded-xl">
          Targeting: <strong className="text-blue-700">{activeJobTarget.title}</strong> at {activeJobTarget.company}
        </div>
      )}

      {/* Data completeness nudge — helps users get better results */}
      {state === "input" && !careerProfile?.resume_text && toolId !== "headshots" && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Add your resume for significantly better results</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Our AI uses your full resume to personalize every analysis — quoting your real achievements, matching your actual skills, and tailoring advice to your experience.
            </p>
            <Link href="/settings" className="text-xs font-semibold text-amber-700 hover:text-amber-900 mt-1 inline-block">
              Upload resume in Settings →
            </Link>
          </div>
        </div>
      )}
      {state === "input" && careerProfile?.resume_text && !careerProfile?.title && toolId !== "headshots" && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <User className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Complete your career profile for better accuracy</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Adding your job title, industry, and years of experience helps our AI calibrate scores and recommendations to your specific situation.
            </p>
            <Link href="/settings" className="text-xs font-semibold text-amber-700 hover:text-amber-900 mt-1 inline-block">
              Complete profile in Settings →
            </Link>
          </div>
        </div>
      )}

      {/* Context verification — show what the AI will use */}
      {state === "input" && (
        <details className="group border border-gray-200 rounded-xl overflow-hidden">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-xs font-medium text-gray-500">
              Context the AI will use for this analysis
            </span>
            <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-3 space-y-1.5 border-t border-gray-100 pt-2">
            {/* Resume context */}
            {careerProfile?.resume_text ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-500">&#10003;</span>
                <span className="text-gray-600">
                  Resume: <strong className="text-gray-900">{careerProfile.title || "Uploaded"}</strong>
                  {careerProfile.company ? ` at ${careerProfile.company}` : ""}
                  {careerProfile.resume_text ? ` (${Math.round(careerProfile.resume_text.length / 5)} words)` : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-500">&#9888;</span>
                <span className="text-gray-500">No resume — results will be less personalized</span>
              </div>
            )}

            {/* Job target context */}
            {activeJobTarget ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-500">&#10003;</span>
                <span className="text-gray-600">
                  Target: <strong className="text-gray-900">{activeJobTarget.title}</strong> at {activeJobTarget.company}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300">&#9679;</span>
                <span className="text-gray-400">No target job set (optional)</span>
              </div>
            )}

            {/* Profile details */}
            {careerProfile?.title ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-500">&#10003;</span>
                <span className="text-gray-600">
                  Profile: <strong className="text-gray-900">{careerProfile.title}</strong>
                  {careerProfile.industry ? `, ${careerProfile.industry}` : ""}
                  {careerProfile.years_experience ? `, ${careerProfile.years_experience}y exp` : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-500">&#9888;</span>
                <span className="text-gray-500">No career profile — AI will try to detect from inputs</span>
              </div>
            )}
          </div>
        </details>
      )}

      {/* Tool dependency hint (b5b) */}
      {state === "input" && (() => {
        const dep = TOOL_DEPENDENCIES[toolId];
        if (!dep) return null;
        if (completedToolIds.has(dep.prereqToolId)) return null;

        return (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Tip:</span> {dep.hint}
              </p>
              <Link
                href={`/tools/${dep.prereqToolId}`}
                className="text-xs font-medium text-amber-700 hover:text-amber-900 mt-1 inline-flex items-center gap-1"
              >
                Run {dep.prereqLabel} first
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Loading state — Rich experience with rotating insights */}
      {state === "loading" && (
        <div className="py-8 space-y-6" role="status" aria-live="polite">
          {/* Progress section */}
          <div className="text-center space-y-3">
            <div className="relative w-14 h-14 mx-auto">
              <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />
              <Zap className="w-5 h-5 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{progress.message || "Preparing your analysis..."}</p>
              <p className="text-xs text-gray-400 mt-1">
                Step {progress.step || 1} of {progress.total} · {elapsedSec}s
              </p>
            </div>
            <div className="w-56 bg-gray-200 rounded-full h-1.5 mx-auto overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-violet-600 h-1.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(5, (progress.step / progress.total) * 100)}%` }}
              />
            </div>
          </div>

          {/* Reassurance message */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {elapsedSec < 10
                ? "Our AI is using advanced reasoning to deeply analyze your specific situation..."
                : elapsedSec < 25
                  ? "Building a premium, personalized analysis — this takes a moment for the best results..."
                  : "Almost there — our AI is putting the finishing touches on your comprehensive analysis..."}
            </p>
            {/* Timeout warning at 20 seconds */}
            {elapsedSec >= 20 && (
              <p className="text-xs text-amber-600 flex items-center justify-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse [animation-delay:0.4s]" />
                </span>
                Still working on your analysis...
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4" role="alert">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Analysis didn&apos;t complete</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => { setError(null); setState("input"); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Premium analysis badge — shown on successful results */}
      {state === "result" && result && !error && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Premium AI Analysis</span>
          <span className="text-gray-300">·</span>
          <span>{careerProfile?.resume_text ? "Personalized from your resume" : "Add resume for deeper personalization"}</span>
        </div>
      )}

      {/* Children render prop */}
      {state !== "loading" && children({ state, result, progress, onRun: handleRun, onReset: handleReset })}

      {/* Result actions */}
      {state === "result" && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            Run Again
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </button>
          {activeJobTarget && (
            <Link
              href="/mission"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              Mission Control
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* NPS Widget — appears after tool completion */}
      {showNps && state === "result" && result && !error && (
        <NpsWidget toolId={toolId} onDismiss={() => setShowNps(false)} />
      )}

      {/* Referral prompt — shows after NPS dismissal */}
      {showReferralPrompt && state === "result" && result && !error && !showNps && (
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-semibold text-gray-900">Know someone who&apos;d find this useful?</p>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Give a friend 15 free tokens. You get 10 when they sign up.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/referral"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[40px]"
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
        const primary = getDynamicRecommendation(toolId, result);
        const secondary = getSecondaryRecommendations(toolId);

        return (
          <div className="space-y-3">
            {/* Primary recommendation — narrative */}
            {primary && (
              <Link
                href={`/tools/${primary.tool.id}`}
                className="block bg-gradient-to-r from-blue-50 to-violet-50 rounded-2xl border border-blue-100 p-5 hover:shadow-md transition-shadow group"
              >
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Your next step</p>
                <p className="text-sm text-gray-700 mb-3">{primary.narrative}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {primary.tool.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      primary.tool.tokens === 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {primary.tool.tokens === 0 ? "Free" : `${primary.tool.tokens} tokens`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary recommendations — compact */}
            {secondary.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400 self-center mr-1">Also try:</span>
                {secondary.map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/tools/${rec.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors min-h-[36px]"
                  >
                    {rec.title}
                    <span className="text-gray-400">{rec.tokens === 0 ? "Free" : `${rec.tokens} tok`}</span>
                  </Link>
                ))}
              </div>
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

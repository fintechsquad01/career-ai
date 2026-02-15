"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeroSection } from "./HeroSection";
import { SmartInput } from "./SmartInput";
import { Loader } from "./Loader";
import { XrayResults } from "./XrayResults";
import { JobResults } from "./JobResults";
import { FAQ } from "@/components/shared/FAQ";
import { PACKS, FAQ_ITEMS, TOOLS, INDUSTRIES } from "@/lib/constants";
import { track } from "@/lib/analytics";
import {
  ShieldAlert,
  Target,
  FileText,
  Mail,
  Linkedin,
  MessageSquare,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
  ClipboardPaste,
  Brain,
  MousePointerClick,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InputType } from "@/lib/detect-input";
import type { ParseInputResult } from "@/types/landing";

type LandingState = "default" | "analyzing" | "results";

function StickyCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-700 hidden sm:block">
          Ready to analyze? Paste your resume or job description.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[44px] w-full sm:w-auto"
        >
          Get Started — Free
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const RESUME_STEPS = [
  "Parsing resume text...",
  "Calculating ATS score...",
  "Analyzing AI displacement risk...",
  "Benchmarking salary data...",
  "Identifying skill gaps...",
  "Generating insights...",
];

const JD_STEPS = [
  "Extracting job requirements...",
  "Analyzing required skills...",
  "Evaluating company culture...",
  "Benchmarking salary...",
  "Calculating fit score...",
];


function getMockResumeResult(): ParseInputResult {
  return {
    type: "resume",
    data: {
      name: "Demo User",
      title: "Senior Marketing Manager",
      company: "TechCorp",
      industry: "Technology",
      resume_score: 42,
      displacement_score: 67,
      skills: [
        "SEO",
        "Content Strategy",
        "Google Analytics",
        "HubSpot",
        "Team Leadership",
      ],
      skill_gaps: ["AI/ML Knowledge", "Product Marketing", "SQL"],
    },
  };
}

function getMockJdResult(): ParseInputResult {
  return {
    type: "jd",
    data: {
      title: "Product Marketing Manager",
      company: "Anthropic",
      location: "San Francisco, CA",
      salary_range: "$140,000–$180,000",
      requirements: [
        { skill: "Product Marketing", priority: "req", match: false },
        { skill: "AI/ML Industry", priority: "req", match: false },
        { skill: "B2B Go-to-Market", priority: "req", match: false },
        { skill: "Data Analysis", priority: "pref", match: false },
      ],
    },
  };
}

const HERO_TOOLS: {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}[] = [
  { id: "displacement", icon: ShieldAlert, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { id: "jd_match", icon: Target, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { id: "resume", icon: FileText, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { id: "cover_letter", icon: Mail, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  { id: "interview", icon: MessageSquare, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { id: "linkedin", icon: Linkedin, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
];

function QuickDisplacementForm({
  onSubmit,
}: {
  onSubmit: (text: string) => void;
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    const input = `Role: ${jobTitle.trim()}${industry ? `, Industry: ${industry}` : ""}`;
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="quick-job-title" className="sr-only">
            Your job title
          </label>
          <input
            id="quick-job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Marketing Manager"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 transition-shadow min-h-[44px]"
            required
          />
        </div>
        <div>
          <label htmlFor="quick-industry" className="sr-only">
            Your industry
          </label>
          <select
            id="quick-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 transition-shadow min-h-[44px] appearance-none"
          >
            <option value="">Select your industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={!jobTitle.trim()}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShieldAlert className="w-5 h-5" />
        Analyze My AI Risk — Free
      </button>
    </form>
  );
}

export function LandingContent() {
  const [pageState, setPageState] = useState<LandingState>("default");
  const [analysisType, setAnalysisType] = useState<InputType>(null);
  const [analysisResult, setAnalysisResult] =
    useState<ParseInputResult | null>(null);
  const [analysisError, setAnalysisError] = useState(false);
  const [lastInput, setLastInput] = useState<{ text: string; type: InputType } | null>(null);
  const quickFormRef = useRef<HTMLDivElement>(null);

  const handleCtaClick = () => {
    quickFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleQuickDisplacement = (text: string) => {
    handleAnalyze(text, "resume");
  };

  const handleAnalyze = async (text: string, type: InputType) => {
    track("landing_analyze", { type: type ?? "unknown" });

    // Save JD for post-auth mission activation
    if (type === "jd" || type === "url") {
      localStorage.setItem("aiskillscore_pre_auth_jd", text);
    }

    setAnalysisType(type);
    setAnalysisError(false);
    setLastInput({ text, type });
    setPageState("analyzing");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const res = await fetch(`${supabaseUrl}/functions/v1/parse-input`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input_text: text,
            detected_type: type,
          }),
        });
        if (res.ok) {
          const data: ParseInputResult = await res.json();
          setAnalysisResult(data);
          return;
        }
      }
    } catch {
      // Fall through to mock (dev) or error (prod)
    }

    // In development, fall back to mock data for local testing
    if (process.env.NODE_ENV === "development") {
      if (type === "resume" || type === null) {
        setAnalysisResult(getMockResumeResult());
      } else {
        setAnalysisResult(getMockJdResult());
      }
    } else {
      // In production, show error UI instead of fake data
      setAnalysisError(true);
    }
  };

  const handleRetry = () => {
    if (lastInput) {
      handleAnalyze(lastInput.text, lastInput.type);
    }
  };

  const handleLoaderComplete = () => {
    setPageState("results");
  };

  const isResumeFlow =
    analysisType === "resume" ||
    analysisType === null ||
    (analysisResult?.type === "resume");

  const loaderSteps = isResumeFlow ? RESUME_STEPS : JD_STEPS;

  return (
    <div className="min-h-screen">
      {pageState === "default" && <StickyCtaBar />}
      {/* Hero + Smart Input / Loader / Results */}
      <section className="px-4 pt-16 sm:pt-24 pb-20 bg-gradient-to-b from-white to-[#F5F5F7]">
        <div className="max-w-4xl mx-auto space-y-10">
          <HeroSection onCtaClick={handleCtaClick} />

          {pageState === "default" && (
            <>
              {/* Quick Displacement Form */}
              <div ref={quickFormRef} className="max-w-2xl mx-auto">
                <div className="glass-card p-6 sm:p-8 space-y-5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">AI Displacement Score</h2>
                      <p className="text-sm text-gray-500">How vulnerable is your role to AI automation?</p>
                    </div>
                  </div>
                  <QuickDisplacementForm onSubmit={handleQuickDisplacement} />
                </div>
              </div>

              {/* Divider pointing to SmartInput */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">
                  Or paste your full resume or a job description for deeper analysis
                </p>
                <ArrowRight className="w-4 h-4 text-gray-300 mx-auto rotate-90" />
              </div>

              {/* Full SmartInput */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                  Power users: paste anything for full analysis
                </p>
                <SmartInput onAnalyze={handleAnalyze} />
              </div>
            </>
          )}

          {pageState === "analyzing" && (
            <Loader steps={loaderSteps} onComplete={handleLoaderComplete} />
          )}

          {pageState === "results" && analysisError && (
            <div className="max-w-xl mx-auto">
              <div className="glass-card p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Analysis unavailable right now</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Our servers are temporarily busy. Sign up for 15 free tokens and try from your dashboard, or retry now.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                  <Link
                    href="/auth"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[44px]"
                  >
                    Create Account — 15 Free Tokens
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {pageState === "results" && analysisResult && !analysisError && (
            <>
              {analysisResult.type === "resume" ? (
                <XrayResults data={analysisResult.data} />
              ) : (
                <JobResults
                  data={analysisResult.data}
                  fitScore={null}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* Below-fold sections — only show when default */}
      {pageState === "default" && (
        <>
          {/* Trust line — honest value props */}
          <section className="py-8 bg-white">
            <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
              <p className="text-sm text-gray-400 font-medium">
                <span className="text-2xl font-bold text-gray-900 mr-1.5">11</span> AI career tools
              </p>
              <p className="text-sm text-gray-400 font-medium">
                <span className="text-2xl font-bold text-gray-900 mr-1.5">30 sec</span> analysis time
              </p>
              <p className="text-sm text-gray-400 font-medium">
                <span className="text-2xl font-bold text-gray-900 mr-1.5">$0</span> to start
              </p>
            </div>
          </section>

          {/* How It Works — 4 steps */}
          <section className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12 tracking-tight">
                How it works
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: ClipboardPaste,
                    step: "1",
                    title: "Paste",
                    desc: "Drop in a job posting, URL, or your resume. We auto-detect the type.",
                    color: "from-blue-50 to-blue-100/50",
                    iconColor: "text-blue-600",
                  },
                  {
                    icon: Brain,
                    step: "2",
                    title: "Analyze",
                    desc: "AI evaluates in 30 seconds — fit score, ATS compatibility, gaps, and opportunities.",
                    color: "from-violet-50 to-violet-100/50",
                    iconColor: "text-violet-600",
                  },
                  {
                    icon: MousePointerClick,
                    step: "3",
                    title: "Act",
                    desc: "Get an action plan: optimize resume, prep for interviews, close skill gaps.",
                    color: "from-emerald-50 to-emerald-100/50",
                    iconColor: "text-emerald-600",
                  },
                  {
                    icon: DollarSign,
                    step: "4",
                    title: "Earn",
                    desc: "Discover freelance and consulting opportunities based on your strongest skills.",
                    color: "from-amber-50 to-amber-100/50",
                    iconColor: "text-amber-600",
                  },
                ].map((s) => (
                  <div
                    key={s.title}
                    className="text-center p-6 sm:p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100/50 shadow-sm"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-5`}>
                      <s.icon className={`w-7 h-7 ${s.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What You Get — 6 hero tools */}
          <section className="py-20 sm:py-28 px-4 bg-[#F5F5F7]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
                11 AI tools. No subscriptions. Start free.
              </h2>
              <p className="text-gray-500 text-center mb-12">
                Land your dream job AND build income resilience. Pay per use, starting at free.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {HERO_TOOLS.map((ht) => {
                  const tool = TOOLS.find((t) => t.id === ht.id);
                  if (!tool) return null;
                  return (
                    <div key={tool.id} className="glass-card p-5 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${ht.iconBg} flex items-center justify-center`}>
                          <ht.icon className={`w-5 h-5 ${ht.iconColor}`} />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tool.tokens === 0
                              ? "bg-green-50 text-green-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed flex-1">
                        {tool.description}
                      </p>
                      {tool.painPoint && (
                        <p className="text-[11px] text-red-600/80 font-medium mt-2">
                          {tool.painPoint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-center mt-8">
                <Link
                  href="/tools"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  See all 11 tools & pricing{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </section>

          {/* Why AISkillScore — honest competitive comparison */}
          <section className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
                Why job seekers switch to AISkillScore
              </h2>
              <p className="text-gray-500 text-center mb-12">
                One platform replaces 5 subscriptions. Pay only for what you use.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    pain: "Keyword matching isn't enough",
                    detail: "Jobscan charges $599/year to count keywords. We analyze your actual resume with evidence — showing what a recruiter would think, not just what an algorithm counts.",
                    vs: "vs. Jobscan ($599/yr)",
                    color: "border-blue-100 bg-blue-50/30",
                  },
                  {
                    pain: "Templates destroy your voice",
                    detail: "Teal and Kickresume use generic templates that make every resume sound the same. Our AI enhances YOUR voice — no detectable AI patterns, no corporate jargon.",
                    vs: "vs. Teal ($348/yr)",
                    color: "border-violet-100 bg-violet-50/30",
                  },
                  {
                    pain: "Interview prep misses what matters",
                    detail: "90% of candidates prepare first answers but fail follow-up questions — the part that actually decides interviews. We prep both, from your real experience.",
                    vs: "vs. FinalRound ($1,788/yr)",
                    color: "border-amber-100 bg-amber-50/30",
                  },
                ].map((item) => (
                  <div
                    key={item.pain}
                    className={`rounded-2xl border p-6 ${item.color}`}
                  >
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">{item.vs}</p>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.pain}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Preview */}
          <section className="py-20 sm:py-28 px-4 bg-[#F5F5F7]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
                Pay per use. No subscriptions.
              </h2>
              <p className="text-gray-500 text-center mb-10">
                Jobscan costs $599/year. A full job prep on AISkillScore? Under $4.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className={`rounded-2xl border p-6 ${
                      pack.highlighted
                        ? "border-blue-600 bg-white shadow-lg shadow-blue-600/10 ring-1 ring-blue-600"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {pack.highlighted && (
                      <span className="inline-block px-2 py-0.5 mb-3 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full uppercase">
                        Most Popular · Save {pack.save}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900">{pack.name}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ${pack.price}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pack.tokens} tokens · {pack.rate}/token
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {pack.description}
                    </p>
                    <Link
                      href="/auth"
                      className={`mt-4 block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] ${
                        pack.highlighted
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Get {pack.name}
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-center mt-6">
                <Link href="/lifetime" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                  Or get the Lifetime Deal — $79 once, 100 tokens/mo forever →
                </Link>
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                Frequently asked questions
              </h2>
              <FAQ items={FAQ_ITEMS} />
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-4 bg-[#F5F5F7] border-t border-gray-200">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900">AISkillScore</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <Link href="/pricing" className="hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/blog" className="hover:text-gray-900">
                  Blog
                </Link>
                <Link href="/compare" className="hover:text-gray-900">
                  Compare
                </Link>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-gray-900">
                  Terms
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} AISkillScore. All rights reserved.
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

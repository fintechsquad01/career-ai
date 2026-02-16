"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeroSection } from "./HeroSection";
import { SmartInput } from "./SmartInput";
import { Loader } from "./Loader";
import { XrayResults } from "./XrayResults";
import { JobResults } from "./JobResults";
import { FAQ } from "@/components/shared/FAQ";
import { EmailCapture } from "./EmailCapture";
import { PACKS, FAQ_ITEMS, TOOLS, INDUSTRIES } from "@/lib/constants";
import { track } from "@/lib/analytics";
import { AnimateOnScroll } from "@/components/shared/AnimateOnScroll";
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
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity min-h-[44px] w-full sm:w-auto whitespace-nowrap"
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

    // Save input for post-auth restoration
    if (type === "jd" || type === "url") {
      localStorage.setItem("aiskillscore_pre_auth_jd", text);
    } else if (type === "resume") {
      localStorage.setItem("aiskillscore_pre_auth_resume", text);
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
          <AnimateOnScroll as="section" className="py-8 bg-white">
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
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" />

          {/* See What You'll Get — interactive preview */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-warm-gradient">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12 tracking-tight">
                See what you&apos;ll get in 30 seconds
              </h2>

              {/* Blurred preview card */}
              <div className="relative max-w-2xl mx-auto mb-10">
                <div className="glass-card p-6 sm:p-8">
                  <div className="blur-[3px] select-none pointer-events-none space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                        <span className="text-2xl font-bold text-amber-700">67</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Your ATS Score: 67/100</p>
                        <p className="text-sm text-gray-500">3 formatting issues found, 2 missing keywords...</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full w-2/3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 rounded-xl bg-gray-100" />
                      <div className="h-20 rounded-xl bg-gray-100" />
                    </div>
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center px-4">
                      This could be yours in 30 seconds
                    </p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="btn-shine inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[44px]"
                    >
                      Try It Free
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 stagger-children">
                {[
                  { label: "ATS Score", color: "bg-blue-50 text-blue-700 border-blue-100" },
                  { label: "Skill Gaps", color: "bg-violet-50 text-violet-700 border-violet-100" },
                  { label: "Action Plan", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border ${pill.color}`}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" />

          {/* What You Get — 6 hero tools */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-[#F5F5F7]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
                11 AI tools. No subscriptions. Start free.
              </h2>
              <p className="text-gray-500 text-center mb-12">
                Land your dream job AND build income resilience. Pay per use, starting at free.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
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
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" />

          {/* Why AISkillScore — pain-point-first comparison */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
                Why job seekers switch to AISkillScore
              </h2>
              <p className="text-gray-500 text-center mb-12">
                One platform replaces 5 subscriptions. Pay only for what you use.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
                {[
                  {
                    heading: "We show evidence, not just scores",
                    body: "Jobscan gives you a number. We quote your resume back to you and explain why each skill matches or doesn\u2019t. Like having a recruiter review your application.",
                    color: "border-blue-100 bg-blue-50/30",
                  },
                  {
                    heading: "Your voice stays yours",
                    body: "Other tools rewrite your resume into \u2018spearheaded\u2019 and \u2018leveraged.\u2019 We enhance what\u2019s already there. Recruiters can tell the difference.",
                    color: "border-violet-100 bg-violet-50/30",
                  },
                  {
                    heading: "We help you earn while you search",
                    body: "Every tool surfaces freelance and consulting opportunities from your existing skills. Because job hunting shouldn\u2019t mean zero income.",
                    color: "border-emerald-100 bg-emerald-50/30",
                  },
                ].map((item) => (
                  <div
                    key={item.heading}
                    className={`rounded-2xl border p-6 ${item.color}`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{item.heading}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" />

          {/* Your Career Journey — timeline */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12 tracking-tight">
                From first paste to first offer
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                <div className="glass-card p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Day 1</p>
                  <h3 className="font-semibold text-gray-900 mb-2">Paste &amp; discover</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Paste your resume, get a free AI risk score. See exactly where you stand in 30 seconds.
                  </p>
                </div>
                <div className="glass-card p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-violet-600">2</span>
                  </div>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">Week 1</p>
                  <h3 className="font-semibold text-gray-900 mb-2">Match &amp; optimize</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Match against jobs, optimize your resume, prep for interviews. All in one place.
                  </p>
                </div>
                <div className="glass-card p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-emerald-600">3</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Ongoing</p>
                  <h3 className="font-semibold text-gray-900 mb-2">Track &amp; grow</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Track your progress, build new skills, and grow your income with freelance opportunities.
                  </p>
                </div>
                <div className="glass-card p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-amber-600">4</span>
                  </div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Month 1+</p>
                  <h3 className="font-semibold text-gray-900 mb-2">Apply &amp; negotiate</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Use Quick Apply to batch-run tools, craft cover letters, and negotiate salary with confidence.
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" />

          {/* Pricing Preview */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-[#F5F5F7]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
                Pay per use. No subscriptions.
              </h2>
              <p className="text-gray-500 text-center mb-10">
                Jobscan costs $599/year. A full job prep on AISkillScore? Under $4.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto stagger-children">
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
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" />

          {/* FAQ */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                Frequently asked questions
              </h2>
              <FAQ items={FAQ_ITEMS} />
            </div>
          </AnimateOnScroll>

          {/* Footer */}
          <AnimateOnScroll as="div" className="py-12 px-4 bg-[#F5F5F7] border-t border-gray-200">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Email capture */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">AISkillScore</span>
                </div>
                <div className="w-full sm:max-w-xs">
                  <EmailCapture context="landing_footer" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200/60">
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
            </div>
          </AnimateOnScroll>
        </>
      )}
    </div>
  );
}

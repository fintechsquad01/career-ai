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
import { PACKS, FAQ_ITEMS, TOOLS, CANONICAL_COPY, formatTokenWithPrice } from "@/lib/constants";
import { EVENTS, track } from "@/lib/analytics";
import { safeLocalStorage } from "@/lib/safe-storage";
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

const LANDING_FAQ_QUESTIONS = [
  "How does the token system work?",
  "Is the AI Displacement Score really free?",
  "How is AISkillScore different from Jobscan or Teal?",
  "Is my data safe and private?",
  "What is the best free AI career tool?",
];
const LANDING_FAQS = FAQ_ITEMS.filter((item) =>
  LANDING_FAQ_QUESTIONS.includes(item.q)
);

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
          Ready? Paste a job description to run Job Match Score.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn-primary w-full sm:w-auto whitespace-nowrap text-xs sm:text-sm px-5"
        >
          Run Job Match Score
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
  { id: "resume", icon: FileText, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  { id: "cover_letter", icon: Mail, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  { id: "interview", icon: MessageSquare, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { id: "linkedin", icon: Linkedin, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
];

export function LandingContent() {
  const [pageState, setPageState] = useState<LandingState>("default");
  const [analysisType, setAnalysisType] = useState<InputType>(null);
  const [analysisResult, setAnalysisResult] =
    useState<ParseInputResult | null>(null);
  const [analysisError, setAnalysisError] = useState(false);
  const [lastInput, setLastInput] = useState<{ text: string; type: InputType } | null>(null);
  const quickFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track(EVENTS.LANDING_VARIANT_VIEW, {
      referrer: document.referrer || "direct",
    });
  }, []);

  useEffect(() => {
    const fired = new Set<string>();
    const markers = document.querySelectorAll("[data-scroll-depth]");
    if (!markers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const depth = (entry.target as HTMLElement).dataset.scrollDepth;
          if (depth && !fired.has(depth)) {
            fired.add(depth);
            track(EVENTS.LANDING_SCROLL_DEPTH, { depth });
          }
        }
      },
      { threshold: 0.1 }
    );

    markers.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleCtaClick = () => {
    quickFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAnalyze = async (text: string, type: InputType) => {
    track("landing_analyze", { type: type ?? "unknown" });

    // Save input for post-auth restoration
    if (type === "jd" || type === "url") {
      safeLocalStorage.setItem("aiskillscore_pre_auth_jd", text);
    } else if (type === "resume") {
      safeLocalStorage.setItem("aiskillscore_pre_auth_resume", text);
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
              {/* Single primary input — SmartInput */}
              <div ref={quickFormRef} className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                  Paste Job Description or Job URL
                </p>
                <SmartInput onAnalyze={handleAnalyze} />
                <p className="text-xs text-gray-500 text-center">
                  After signup: job-target analyses go to Mission Control; resume-first analyses go to Dashboard.
                </p>
              </div>
            </>
          )}

          {pageState === "analyzing" && (
            <Loader steps={loaderSteps} onComplete={handleLoaderComplete} />
          )}

          {pageState === "results" && analysisError && (
            <div className="max-w-xl mx-auto">
              <div className="surface-card p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Analysis unavailable right now</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Our servers are temporarily busy. Sign up for 15 Free Tokens and try from your dashboard, or retry now.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button onClick={handleRetry} className="btn-secondary px-5">
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                  <Link
                    href="/auth"
                    className="btn-primary px-5"
                  >
                    {CANONICAL_COPY.signup.cta}
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
            <div className="max-w-4xl mx-auto px-4">
              <div className="surface-card-soft p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <span className="ui-badge ui-badge-blue">11 AI career tools</span>
                  <span className="ui-badge ui-badge-gray">Typical analysis: 15-30 seconds</span>
                  <span className="ui-badge ui-badge-green">$0 to start</span>
                  <span className="ui-badge ui-badge-gray">Pay only for what you run</span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" data-scroll-depth="25" />

          {/* See What You'll Get — interactive preview */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-warm-gradient">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12 tracking-tight">
                See what one analysis gives you
              </h2>

              {/* Blurred preview card */}
              <div className="relative max-w-2xl mx-auto mb-10">
                <div className="surface-card p-6 sm:p-8">
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
                      This is the output format you get after one run
                    </p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="btn-primary btn-shine inline-flex px-6 sm:w-auto"
                    >
                      Run Job Match Score
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat pills */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 stagger-children">
                {[
                  { label: "ATS Score", color: "ui-badge ui-badge-blue" },
                  { label: "Skill Gaps", color: "ui-badge ui-badge-amber" },
                  { label: "Action Plan", color: "ui-badge ui-badge-green" },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className={pill.color}
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
              <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
                Gemini 2.5 Pro outputs with recruiter-style evidence. Pay per use with transparent token pricing.
              </p>
              {/* Desktop grid / Mobile horizontal scroll */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {HERO_TOOLS.map((ht) => {
                  const tool = TOOLS.find((t) => t.id === ht.id);
                  if (!tool) return null;
                  return (
                    <div key={tool.id} className="surface-card surface-card-hover p-5 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${ht.iconBg} flex items-center justify-center`}>
                          <ht.icon className={`w-5 h-5 ${ht.iconColor}`} />
                        </div>
                        <span className={`ui-badge ${tool.tokens === 0 ? "ui-badge-green" : "ui-badge-blue"}`}>
                          {formatTokenWithPrice(tool.tokens)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{tool.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed flex-1">{tool.description}</p>
                      {tool.painPoint && (
                        <p className="text-[11px] text-red-600/80 font-medium mt-2">{tool.painPoint}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Mobile: horizontal swipe carousel */}
              <div className="sm:hidden -mx-4 px-4">
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
                  {HERO_TOOLS.map((ht) => {
                    const tool = TOOLS.find((t) => t.id === ht.id);
                    if (!tool) return null;
                    return (
                      <div key={tool.id} className="surface-card p-5 flex flex-col snap-center shrink-0 w-[280px]">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${ht.iconBg} flex items-center justify-center`}>
                            <ht.icon className={`w-5 h-5 ${ht.iconColor}`} />
                          </div>
                          <span className={`ui-badge ${tool.tokens === 0 ? "ui-badge-green" : "ui-badge-blue"}`}>
                            {formatTokenWithPrice(tool.tokens)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{tool.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed flex-1">{tool.description}</p>
                        {tool.painPoint && (
                          <p className="text-[11px] text-red-600/80 font-medium mt-2">{tool.painPoint}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-xs text-gray-400 mt-1">Swipe to see more</p>
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

          <div className="gradient-divider max-w-4xl mx-auto" data-scroll-depth="50" />

          {/* Why AISkillScore — pain-point-first comparison */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">
                Who this is for
              </h2>
              <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
                Whether you&apos;re pivoting, starting out, or protecting your trajectory — start with a job match.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-children">
                {[
                  {
                    heading: "Career Pivoters",
                    body: "Map transferable experience to role-specific requirements before you apply.",
                    color: "border-blue-100 bg-blue-50/30",
                  },
                  {
                    heading: "Early Career Job Seekers",
                    body: "Turn vague feedback into a concrete, job-by-job improvement plan.",
                    color: "border-indigo-100 bg-indigo-50/30",
                  },
                  {
                    heading: "Mid-Career Professionals",
                    body: "Protect your trajectory with evidence-based skills and interview strategy.",
                    color: "border-emerald-100 bg-emerald-50/30",
                  },
                ].map((item) => (
                  <div
                    key={item.heading}
                    className={`surface-card p-6 ${item.color}`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{item.heading}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-center mt-8 text-sm text-gray-600">
                Start with Job Match Score, then optimize your resume for your highest-priority gap.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" data-scroll-depth="75" />

          {/* Your Career Journey — compact stepper */}
          <AnimateOnScroll as="section" className="py-16 sm:py-20 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10 tracking-tight">
                From first paste to first offer
              </h2>
              {/* Desktop: horizontal stepper */}
              <div className="hidden sm:grid sm:grid-cols-4 gap-0 relative">
                <div className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200" aria-hidden="true" />
                {[
                  { num: "1", time: "Day 1", label: "Paste & discover", desc: "Free AI risk score with task-level breakdown.", color: "bg-blue-600" },
                  { num: "2", time: "Week 1", label: "Match & optimize", desc: "Match jobs, optimize resume, prep interviews.", color: "bg-indigo-600" },
                  { num: "3", time: "Ongoing", label: "Track & grow", desc: "Close skill gaps, explore freelance income.", color: "bg-emerald-600" },
                  { num: "4", time: "Month 1+", label: "Apply & negotiate", desc: "Batch-apply, cover letters, salary scripts.", color: "bg-amber-600" },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm mb-3`}>
                      {step.num}
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{step.time}</p>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">{step.desc}</p>
                  </div>
                ))}
              </div>
              {/* Mobile: vertical stepper */}
              <div className="sm:hidden space-y-0">
                {[
                  { num: "1", time: "Day 1", label: "Paste & discover", desc: "Free AI risk score with task-level breakdown.", color: "bg-blue-600", line: true },
                  { num: "2", time: "Week 1", label: "Match & optimize", desc: "Match jobs, optimize resume, prep interviews.", color: "bg-indigo-600", line: true },
                  { num: "3", time: "Ongoing", label: "Track & grow", desc: "Close skill gaps, explore freelance income.", color: "bg-emerald-600", line: true },
                  { num: "4", time: "Month 1+", label: "Apply & negotiate", desc: "Batch-apply, cover letters, salary scripts.", color: "bg-amber-600", line: false },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {step.num}
                      </div>
                      {step.line && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="pb-6">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{step.time}</p>
                      <h3 className="text-sm font-semibold text-gray-900">{step.label}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
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
              <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
                Get Gemini 2.5 Pro career analysis with cited evidence at transparent token pricing.
                <br className="sm:hidden" />
                Jobscan costs $599/year. A full job prep on AISkillScore is typically under $8.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto stagger-children">
                {PACKS.map((pack) => (
                  <div key={pack.id} className={`surface-card p-6 ${pack.highlighted ? "ring-1 ring-blue-600 border-blue-600 shadow-lg shadow-blue-600/10" : ""}`}>
                    {pack.highlighted && (
                      <span className="ui-badge ui-badge-blue mb-3">
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
                      className={`mt-4 flex items-center justify-center text-center ${pack.highlighted ? "btn-primary" : "btn-secondary"}`}
                    >
                      Continue with {pack.name}
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-center mt-6">
                <Link href="/lifetime" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Or get the Lifetime Deal — $119 once, 120 tokens/mo forever →
                </Link>
              </p>
            </div>
          </AnimateOnScroll>

          <div className="gradient-divider max-w-4xl mx-auto" data-scroll-depth="100" />

          {/* FAQ — top 5 with link to full /faq page */}
          <AnimateOnScroll as="section" className="py-20 sm:py-28 px-4 bg-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                Frequently asked questions
              </h2>
              <FAQ items={LANDING_FAQS} />
              <p className="text-center mt-6">
                <Link
                  href="/faq"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  See all {FAQ_ITEMS.length} questions
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </AnimateOnScroll>

          {/* Footer — categorized links */}
          <AnimateOnScroll as="div" className="py-12 px-4 bg-[#F5F5F7] border-t border-gray-200">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Top row: brand + email */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">AISkillScore</span>
                </div>
                <div className="w-full sm:max-w-xs">
                  <EmailCapture context="landing_footer" />
                </div>
              </div>
              {/* Link columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-200/60">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Product</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
                    <Link href="/tools" className="hover:text-gray-900">Tools</Link>
                    <Link href="/lifetime" className="hover:text-gray-900">Lifetime Deal</Link>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resources</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <Link href="/blog" className="hover:text-gray-900">Blog</Link>
                    <Link href="/roles" className="hover:text-gray-900">Role Guides</Link>
                    <Link href="/industries" className="hover:text-gray-900">Industry Guides</Link>
                    <Link href="/compare" className="hover:text-gray-900">Compare</Link>
                    <Link href="/faq" className="hover:text-gray-900">FAQ</Link>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Legal</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-500">
                    <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
                    <Link href="/terms" className="hover:text-gray-900">Terms</Link>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center sm:text-left pt-2">
                © {new Date().getFullYear()} AISkillScore. All rights reserved.
              </p>
            </div>
          </AnimateOnScroll>
        </>
      )}
    </div>
  );
}

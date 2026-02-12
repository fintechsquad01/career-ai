"use client";

import { useState } from "react";
import Link from "next/link";
import { HeroSection } from "./HeroSection";
import { SmartInput } from "./SmartInput";
import { Loader } from "./Loader";
import { XrayResults } from "./XrayResults";
import { JobResults } from "./JobResults";
import { FAQ } from "@/components/shared/FAQ";
import { EmailCapture } from "./EmailCapture";
import { TOOLS, PACKS, FAQ_ITEMS } from "@/lib/constants";
import { track } from "@/lib/analytics";
import {
  ShieldAlert,
  Target,
  FileText,
  Mail,
  Linkedin,
  Camera,
  MessageSquare,
  TrendingUp,
  Map,
  DollarSign,
  Rocket,
  Users,
  Star,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { InputType } from "@/lib/detect-input";
import type { ParseInputResult } from "@/types/landing";

type LandingState = "default" | "analyzing" | "results";

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

const ICON_MAP: Record<string, typeof ShieldAlert> = {
  ShieldAlert,
  Target,
  FileText,
  Mail,
  Linkedin,
  Camera,
  MessageSquare,
  TrendingUp,
  Map,
  DollarSign,
  Rocket,
};

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

export function LandingContent() {
  const [pageState, setPageState] = useState<LandingState>("default");
  const [analysisType, setAnalysisType] = useState<InputType>(null);
  const [analysisResult, setAnalysisResult] =
    useState<ParseInputResult | null>(null);

  const handleAnalyze = async (text: string, type: InputType) => {
    track("landing_analyze", { type: type ?? "unknown" });

    // Save JD for post-auth mission activation
    if (type === "jd" || type === "url") {
      localStorage.setItem("careerai_pre_auth_jd", text);
    }

    setAnalysisType(type);
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
      // Fall through to mock
    }

    if (type === "resume" || type === null) {
      setAnalysisResult(getMockResumeResult());
    } else {
      setAnalysisResult(getMockJdResult());
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
      {/* Hero + Smart Input / Loader / Results */}
      <section className="px-4 pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto space-y-10">
          <HeroSection />

          {pageState === "default" && (
            <SmartInput onAnalyze={handleAnalyze} />
          )}

          {pageState === "analyzing" && (
            <Loader steps={loaderSteps} onComplete={handleLoaderComplete} />
          )}

          {pageState === "results" && analysisResult && (
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
          {/* Social Proof */}
          <section className="py-8 border-y border-gray-100 bg-white">
            <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>
                  <strong className="text-gray-900">12,400+</strong> careers
                  analyzed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>
                  <strong className="text-gray-900">4.8/5</strong> rating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-600" />
                <span>
                  <strong className="text-gray-900">30 sec</strong> analysis
                </span>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                How it works
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: "1",
                    title: "Paste",
                    desc: "Drop in a job posting, URL, or your resume. We auto-detect the type.",
                  },
                  {
                    step: "2",
                    title: "Analyze",
                    desc: "AI evaluates in 30 seconds — fit score, ATS compatibility, gaps, and opportunities.",
                  },
                  {
                    step: "3",
                    title: "Act",
                    desc: "Get an action plan: optimize resume, prep for interviews, close skill gaps.",
                  },
                  {
                    step: "4",
                    title: "Earn",
                    desc: "Discover freelance and consulting opportunities based on your strongest skills.",
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">
                      {s.step}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-500">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tools Preview */}
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
                11 AI tools. No subscriptions. Start free.
              </h2>
              <p className="text-gray-500 text-center mb-10">
                Land your dream job AND build income resilience. Pay per use,
                starting at free.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {TOOLS.map((tool) => {
                  const Icon = ICON_MAP[tool.icon] || Zap;
                  return (
                    <div
                      key={tool.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            tool.tokens === 0
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tool.tokens === 0 ? "Free" : `${tool.tokens} tok`}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Track B: Entrepreneurship Promotion */}
          <section className="py-16 px-4 bg-gradient-to-br from-violet-50 to-purple-50">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full uppercase mb-4">
                    <Rocket className="w-3.5 h-3.5" />
                    New: Track B
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    Earn while you search.
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Every CareerAI tool surfaces freelance and consulting
                    opportunities based on your skills. The Entrepreneurship
                    Assessment identifies the business you could build with
                    what you already know — starting this week.
                  </p>
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-violet-600/20 min-h-[48px]"
                  >
                    Try Entrepreneurship Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Unfair advantages",
                      desc: "Discover what makes YOUR background uniquely valuable",
                    },
                    {
                      label: "5 business models evaluated",
                      desc: "Freelance, consulting, SaaS, content, and more — scored for your skills",
                    },
                    {
                      label: "90-day launch plan",
                      desc: "Week-by-week actions with income targets",
                    },
                    {
                      label: "Works alongside job hunting",
                      desc: "Everything suggested runs in parallel with your applications",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/70 rounded-xl p-4 border border-violet-100"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                What users say
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    name: "Alex Rivera",
                    title: "Senior Developer, Austin",
                    quote:
                      "The JD Match tool showed me exactly WHY I wasn't getting callbacks — evidence from my actual resume. Fixed 3 things, got 4 interviews the next week.",
                  },
                  {
                    name: "Priya Sharma",
                    title: "Product Manager, NYC",
                    quote:
                      "I ran the Entrepreneurship Assessment while job hunting and started freelance consulting within 2 weeks. Now I earn $4K/month on the side AND have a stronger resume.",
                  },
                  {
                    name: "Marcus Johnson",
                    title: "Marketing Manager, London",
                    quote:
                      "Jobscan gave me a 94% score and I still got rejected. CareerAI told me my formatting was wrong — something Jobscan never flagged. Fixed it, got the interview.",
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    className="bg-gray-50 rounded-2xl border border-gray-100 p-6"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500">{t.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Preview */}
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
                Pay per use. No subscriptions.
              </h2>
              <p className="text-gray-500 text-center mb-10">
                Others charge $29–$149/month. We charge per tool, starting at
                free.
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
            </div>
          </section>

          {/* Email Capture */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Get career tips in your inbox
              </h2>
              <p className="text-gray-500 mb-6">
                Weekly insights on job hunting, salary negotiation, and building
                income on the side. No spam — unsubscribe anytime.
              </p>
              <EmailCapture context="landing_footer" />
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Your career is worth 30 seconds.
              </h2>
              <p className="text-gray-500 mb-8">
                Paste your resume or a job posting and get instant, AI-powered
                insights.
              </p>
              <Link
                href="#top"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px]"
              >
                Get Started — Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 px-4 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
                Frequently asked questions
              </h2>
              <FAQ items={FAQ_ITEMS} />
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-4 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-gray-900">CareerAI</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <Link href="/pricing" className="hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-gray-900">
                  Terms
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} CareerAI. All rights reserved.
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

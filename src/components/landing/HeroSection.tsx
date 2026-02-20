"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { CANONICAL_COPY } from "@/lib/constants";

interface HeroSectionProps {
  onCtaClick?: () => void;
}

const ROTATING_HOOKS = [
  "Because you deserve to know why you're not getting callbacks.",
  "Because 'just keep applying' isn't a strategy.",
  "Because knowing your gaps is the first step to closing them.",
];

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const [hookIndex, setHookIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setHookIndex((i) => (i + 1) % ROTATING_HOOKS.length);
        setOpacity(1);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative text-center space-y-8">
      {/* Gradient orb */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/18 via-indigo-400/18 to-slate-400/12 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100/70 rounded-full">
        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="text-sm font-medium text-blue-700">Typical analysis time: 15-30 seconds</span>
      </div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight max-w-3xl mx-auto">
        Stop guessing.
        <br />
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Know exactly where you stand.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
        Paste a job posting or your resume.
        <br className="sm:hidden" />
        Get a recruiter-style assessment with cited evidence in about 30 seconds — not a keyword-only score.
      </p>

      {/* Rotating emotional hook */}
      <p className="text-sm text-gray-500 italic h-6 transition-opacity duration-500">
        <span
          className="block transition-opacity duration-500"
          style={{ opacity }}
        >
          {ROTATING_HOOKS[hookIndex]}
        </span>
      </p>

      {/* Evidence + trust */}
      <div className="space-y-4">
        <div className="surface-card-soft px-4 py-3 max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <span className="ui-badge ui-badge-blue">Claim, mechanism, and evidence in every result</span>
            <span className="ui-badge ui-badge-gray">{CANONICAL_COPY.privacy.trustLine}</span>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onCtaClick} className="btn-primary btn-shine sm:w-auto px-8 text-base">
            {CANONICAL_COPY.cta.freeAnalysisPrimary}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={onCtaClick} className="btn-secondary sm:w-auto px-6">
            See Full Analysis Flow
          </button>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed">
          No signup required for your first analysis.
          <span className="text-gray-400"> Create your account and get 15 free tokens.</span>
        </p>
      </div>
    </div>
  );
}

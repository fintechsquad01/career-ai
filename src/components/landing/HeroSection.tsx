"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Lock, Clock } from "lucide-react";

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
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 via-violet-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100/50 rounded-full">
        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="text-sm font-medium text-blue-700">12,400+ career analyses this week</span>
      </div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] tracking-tight">
        Stop guessing.
        <br />
        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Know exactly where you stand.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
        Paste a job posting or your resume. Get an honest, evidence-based assessment in 30 seconds — not a generic keyword score.
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

      {/* Primary CTA */}
      <div className="space-y-4">
        <button
          onClick={onCtaClick}
          className="btn-shine inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/25 min-h-[48px]"
        >
          Get Your Free AI Risk Score
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-400">
          No signup required · 30 second analysis · 100% free
        </p>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400"><Lock className="w-3.5 h-3.5" /> Your data stays yours</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400"><Clock className="w-3.5 h-3.5" /> 30 second analysis</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400"><Sparkles className="w-3.5 h-3.5" /> AI that preserves your voice</div>
        </div>
      </div>
    </div>
  );
}

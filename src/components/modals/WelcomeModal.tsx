"use client";

import { useState } from "react";
import { Brain, Coins, Sparkles, ArrowRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface WelcomeModalProps {
  userId: string;
  onClose: () => void;
}

const STEPS = [
  {
    icon: Brain,
    title: "Welcome to CareerAI",
    description:
      "Your AI-powered career intelligence platform. 11 tools to help you analyze, optimize, and land your dream job.",
  },
  {
    icon: Coins,
    title: "Your 5 free tokens",
    description:
      "You've received 5 free tokens to start. Each tool costs a different amount — the AI Displacement Score is always free. Use tokens to unlock powerful career insights.",
  },
  {
    icon: Sparkles,
    title: "Get started",
    description:
      "Paste your resume or a job description to kick things off. Or explore our tools from the dashboard. Your career transformation starts now.",
  },
];

export function WelcomeModal({ userId, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const supabase = createClient();

  const handleClose = async () => {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    onClose();
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-8 animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-6">
            <current.icon className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{current.description}</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 my-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors min-h-[48px] flex items-center justify-center gap-2"
          >
            {step < STEPS.length - 1 ? "Next" : "Let's Go!"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

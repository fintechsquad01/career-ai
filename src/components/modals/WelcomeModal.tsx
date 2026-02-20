"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Rocket,
  ArrowRight,
  X,
  Sparkles,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { INDUSTRIES } from "@/lib/constants";
import { safeLocalStorage } from "@/lib/safe-storage";
import { ResumeUploadOrPaste } from "@/components/shared/ResumeUploadOrPaste";

interface WelcomeModalProps {
  userId: string;
  onClose: () => void;
}

type CareerIntent = "job_hunting" | "advance_career" | "future_proof" | "side_income";

const INTENT_OPTIONS: {
  id: CareerIntent;
  icon: typeof Briefcase;
  label: string;
  desc: string;
}[] = [
  {
    id: "job_hunting",
    icon: Briefcase,
    label: "I'm actively job hunting",
    desc: "Find and land your next role",
  },
  {
    id: "advance_career",
    icon: TrendingUp,
    label: "I want to advance my career",
    desc: "Level up skills and positioning",
  },
  {
    id: "future_proof",
    icon: ShieldAlert,
    label: "I want to future-proof against AI",
    desc: "Understand your displacement risk",
  },
  {
    id: "side_income",
    icon: Rocket,
    label: "I'm exploring side income",
    desc: "Build income from your skills",
  },
];

const EXPERIENCE_OPTIONS = ["0–2 years", "3–5 years", "6–10 years", "10+ years"] as const;

export function WelcomeModal({ userId, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<CareerIntent | null>(null);
  const [currentRole, setCurrentRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [saving, setSaving] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [preAuthResumeDetected, setPreAuthResumeDetected] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const saved = safeLocalStorage.getItem("aiskillscore_pre_auth_resume");
    if (saved) {
      setResumeText(saved);
      setPreAuthResumeDetected(true);
    }
  }, []);

  const handleClose = async () => {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    onClose();
  };

  const handleStep1Next = () => {
    if (!intent) return;
    safeLocalStorage.setItem("aiskillscore_career_intent", intent);
    setStep(1);
  };

  const handleStep2Next = async () => {
    setSaving(true);
    try {
      // Save career profile data
      if (currentRole || industry || experience) {
        const yearsMap: Record<string, number> = {
          "0–2 years": 1,
          "3–5 years": 4,
          "6–10 years": 8,
          "10+ years": 15,
        };

        await supabase
          .from("career_profiles")
          .upsert({
            user_id: userId,
            title: currentRole || null,
            industry: industry || null,
            years_experience: yearsMap[experience] ?? null,
          }, { onConflict: "user_id" });
      }

      // Mark onboarding complete
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);

      setStep(2);
    } catch {
      // Still proceed even on error
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeNext = async () => {
    // Resume auto-save is handled by ResumeUploadOrPaste component (autoSave=true)
    // But if user just typed/pasted (not uploaded), save it now
    if (resumeText.trim()) {
      try {
        await supabase
          .from("career_profiles")
          .upsert({
            user_id: userId,
            resume_text: resumeText.trim(),
            source: preAuthResumeDetected ? "paste" : "paste",
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
      } catch {
        // Non-blocking
      }
    }
    // Clear pre-auth localStorage
    safeLocalStorage.removeItem("aiskillscore_pre_auth_resume");
    setStep(3);
  };

  const handleGetStarted = () => {
    onClose();

    // Route based on intent
    switch (intent) {
      case "job_hunting":
        router.push("/tools/displacement");
        break;
      case "advance_career":
        router.push("/tools/skills_gap");
        break;
      case "future_proof":
        router.push("/tools/displacement");
        break;
      case "side_income":
        router.push("/tools/entrepreneurship");
        break;
      default:
        router.push("/tools/displacement");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-blue-600" : i < step ? "w-8 bg-blue-200" : "w-8 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Intent Selection */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-gray-500 text-center mb-4">Let&apos;s make sure every tool gives you personalized results. This takes 60 seconds.</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">What brings you here?</h2>
              <p className="text-sm text-gray-500">We&apos;ll personalize your experience.</p>
            </div>

            <div className="space-y-2">
              {INTENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setIntent(option.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left min-h-[44px] ${
                    intent === option.id
                      ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    intent === option.id ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <option.icon className={`w-5 h-5 ${
                      intent === option.id ? "text-blue-600" : "text-gray-500"
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                  {intent === option.id && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleStep1Next}
              disabled={!intent}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Quick Profile */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Quick profile setup</h2>
              <p className="text-sm text-gray-500">Helps us give you better recommendations.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="onb-role" className="block text-sm font-medium text-gray-700 mb-1">Current role</label>
                <input
                  id="onb-role"
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g. Marketing Manager"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="onb-industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  id="onb-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[44px] bg-white"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <button
                      key={exp}
                      onClick={() => setExperience(exp)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all min-h-[44px] ${
                        experience === exp
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <button
                  onClick={() => { handleStep2Next(); }}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  Skip for now
                </button>
                <p className="text-xs text-gray-400 mt-1 text-center">(results will be less personalized)</p>
              </div>
              <button
                onClick={handleStep2Next}
                disabled={saving}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors min-h-[44px] flex items-center justify-center gap-2"
              >
                {saving ? "Saving..." : "Continue"}
                {!saving && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Resume Upload */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Drop your resume here</h2>
              <p className="text-sm text-gray-500">This is the single most impactful thing you can do for result quality.</p>
            </div>

            <ResumeUploadOrPaste
              value={resumeText}
              onChange={setResumeText}
              label="Upload or paste your resume"
              autoSave
            />

            {/* Pre-auth detection */}
            {preAuthResumeDetected && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                We found the resume you pasted earlier
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  Skip for now
                </button>
                <p className="text-xs text-gray-400 mt-1 text-center">(results will be less personalized)</p>
              </div>
              <button
                onClick={handleResumeNext}
                disabled={!resumeText.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Career Snapshot / Get Started */}
        {step === 3 && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {intent === "job_hunting"
                  ? "Let's start with a free AI Displacement Score to understand your position, then build your application strategy."
                  : intent === "advance_career"
                  ? "Let's start by identifying your skill gaps and building a roadmap for your next career move."
                  : intent === "future_proof"
                  ? "Let's see how AI affects your role. The Displacement Score is free — find out which tasks are safe and which aren't."
                  : intent === "side_income"
                  ? "Let's discover income opportunities based on your skills. We'll start with a free career assessment."
                  : "Your career dashboard is ready. Start with a free analysis to see where you stand."
                }
              </p>
            </div>

            {/* What they got */}
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">15 free tokens to start</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">+2 daily tokens every day</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">AI Displacement Score — always free</span>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/20 min-h-[48px] flex items-center justify-center gap-2"
            >
              {intent === "job_hunting"
                ? "Start My Free Analysis"
                : intent === "future_proof"
                ? "Check My AI Risk — Free"
                : "Get Started"
              }
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

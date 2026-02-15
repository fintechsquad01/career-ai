import { Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onCtaClick?: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <div className="text-center space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 backdrop-blur-sm border border-blue-100/50 rounded-full">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">Free analysis · 30 seconds · Your voice preserved</span>
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
        Find out if AI is coming for your job — in 30 seconds. Free.
      </p>

      {/* Primary CTA */}
      <div className="space-y-4">
        <button
          onClick={onCtaClick}
          className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-lg font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-600/25 min-h-[48px]"
        >
          Get Your Free AI Risk Score
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-400">
          No signup required · Takes 30 seconds · 100% free
        </p>
      </div>
    </div>
  );
}

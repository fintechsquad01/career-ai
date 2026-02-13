import { Sparkles } from "lucide-react";

export function HeroSection() {
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

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
        Paste a job posting or your resume. In 30 seconds, get an honest assessment
        with evidence — not generic keyword scores.
      </p>
    </div>
  );
}

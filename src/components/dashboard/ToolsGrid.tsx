"use client";

import Link from "next/link";
import {
  ShieldAlert, Target, FileText, Mail, Linkedin, Camera,
  MessageSquare, TrendingUp, Map, DollarSign, Rocket, Zap, Star, ArrowRight,
} from "lucide-react";
import { TOOLS, TOOL_CATEGORIES } from "@/lib/constants";

const ICON_MAP: Record<string, typeof ShieldAlert> = {
  ShieldAlert, Target, FileText, Mail, Linkedin, Camera,
  MessageSquare, TrendingUp, Map, DollarSign, Rocket,
};

const CATEGORY_ICON_STYLES: Record<string, { bg: string; text: string }> = {
  Analyze: { bg: "bg-blue-50", text: "text-blue-600" },
  Build: { bg: "bg-violet-50", text: "text-violet-600" },
  Prepare: { bg: "bg-amber-50", text: "text-amber-600" },
  Grow: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Analyze: "Understand your position in the market",
  Build: "Create tailored application materials",
  Prepare: "Get ready for interviews and negotiations",
  Grow: "Plan your long-term career trajectory",
};

const POPULAR_TOOLS = new Set(["displacement"]);

interface ToolsGridProps {
  compact?: boolean;
}

export function ToolsGrid({ compact = false }: ToolsGridProps) {
  if (compact) {
    return (
      <div className="space-y-6">
        {TOOL_CATEGORIES.map((cat) => {
          const categoryTools = TOOLS.filter((t) => t.category === cat);
          if (categoryTools.length === 0) return null;
          const styles = CATEGORY_ICON_STYLES[cat] || { bg: "bg-gray-50", text: "text-gray-600" };

          return (
            <div key={cat}>
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{cat}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger-children">
                {categoryTools.map((tool) => {
                  const Icon = ICON_MAP[tool.icon] || Zap;
                  return (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="glass-card p-4 hover:shadow-md hover:scale-[1.01] transition-all duration-150 min-h-[44px]"
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <div className={`w-9 h-9 rounded-xl ${styles.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${styles.text}`} strokeWidth={1.5} />
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          tool.tokens === 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {tool.tokens === 0 ? "Free" : `${tool.tokens} tok`}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-semibold text-gray-900">{tool.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tool.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Apply banner */}
      <Link
        href="/quick-apply"
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl hover:shadow-md transition-shadow group"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Quick Apply</h4>
          <p className="text-xs text-gray-500 mt-0.5">Run JD Match + Resume Optimizer + Cover Letter in one go — 15 tokens</p>
        </div>
        <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors shrink-0" />
      </Link>

      {TOOL_CATEGORIES.map((cat) => {
        const categoryTools = TOOLS.filter((t) => t.category === cat);
        if (categoryTools.length === 0) return null;
        const styles = CATEGORY_ICON_STYLES[cat] || { bg: "bg-gray-50", text: "text-gray-600" };

        return (
          <div key={cat}>
            <div className="mb-4">
              <h3 className="text-overline">{cat}</h3>
              <p className="text-caption mt-0.5">{CATEGORY_DESCRIPTIONS[cat]}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
              {categoryTools.map((tool) => {
                const Icon = ICON_MAP[tool.icon] || Zap;
                const isPopular = POPULAR_TOOLS.has(tool.id);

                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="glass-card p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group flex items-center gap-4"
                  >
                    <div className={`w-11 h-11 rounded-xl ${styles.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${styles.text}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{tool.title}</h4>
                        {isPopular && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-full uppercase shrink-0">
                            <Star className="w-2.5 h-2.5" fill="currentColor" />
                            Popular
                          </span>
                        )}
                        {tool.beta && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-full uppercase shrink-0 border border-amber-200">
                            Beta
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{tool.description}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                      tool.tokens === 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tool.tokens === 0 ? "Free" : `${tool.tokens} tok`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  ShieldAlert, Target, FileText, Mail, Linkedin, Camera,
  MessageSquare, TrendingUp, Map, DollarSign, Rocket, Zap, Star,
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

const POPULAR_TOOLS = new Set(["jd_match", "resume", "displacement"]);

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
      {TOOL_CATEGORIES.map((cat) => {
        const categoryTools = TOOLS.filter((t) => t.category === cat);
        if (categoryTools.length === 0) return null;
        const styles = CATEGORY_ICON_STYLES[cat] || { bg: "bg-gray-50", text: "text-gray-600" };

        return (
          <div key={cat}>
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{cat}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{CATEGORY_DESCRIPTIONS[cat]}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
              {categoryTools.map((tool) => {
                const Icon = ICON_MAP[tool.icon] || Zap;
                const isPopular = POPULAR_TOOLS.has(tool.id);

                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="glass-card p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl ${styles.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${styles.text}`} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{tool.title}</h4>
                            {isPopular && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-full uppercase">
                                <Star className="w-2.5 h-2.5" fill="currentColor" />
                                Popular
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold ${
                            tool.tokens === 0 ? "text-green-600" : "text-gray-400"
                          }`}>
                            {tool.tokens === 0 ? "Free" : `${tool.tokens} tokens`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{tool.description}</p>

                    {tool.painPoint && (
                      <p className="text-xs text-red-600/70 italic mb-2 line-clamp-2">{tool.painPoint}</p>
                    )}

                    {tool.vsCompetitor && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <span className="flex-shrink-0 text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full uppercase mt-px">vs</span>
                        <p className="text-[11px] text-green-700 leading-snug line-clamp-2">{tool.vsCompetitor}</p>
                      </div>
                    )}
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

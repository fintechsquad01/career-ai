"use client";

import Link from "next/link";
import {
  ShieldAlert, Target, FileText, Mail, Linkedin, Camera,
  MessageSquare, TrendingUp, Map, DollarSign, Rocket, Zap,
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

export function ToolsGrid() {
  return (
    <div className="space-y-6">
      {TOOL_CATEGORIES.map((cat) => {
        const categoryTools = TOOLS.filter((t) => t.category === cat);
        if (categoryTools.length === 0) return null;
        const styles = CATEGORY_ICON_STYLES[cat] || { bg: "bg-gray-50", text: "text-gray-600" };

        return (
          <div key={cat}>
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{cat}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

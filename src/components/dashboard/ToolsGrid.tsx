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

export function ToolsGrid() {
  return (
    <div className="space-y-6">
      {TOOL_CATEGORIES.map((cat) => {
        const categoryTools = TOOLS.filter((t) => t.category === cat);
        if (categoryTools.length === 0) return null;

        return (
          <div key={cat}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{cat}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryTools.map((tool) => {
                const Icon = ICON_MAP[tool.icon] || Zap;
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all min-h-[44px]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        tool.tokens === 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {tool.tokens === 0 ? "Free" : `${tool.tokens} tok`}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">{tool.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
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

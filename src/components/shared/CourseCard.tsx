"use client";

import { ExternalLink, Award, Clock } from "lucide-react";
import { getCourseUrl, trackAffiliateClick } from "@/lib/affiliates";

interface CourseCardProps {
  name: string;
  provider: string;
  price?: string;
  duration?: string;
  certificate?: boolean;
  urlHint?: string;
  /** Which tool triggered this card, for analytics */
  toolId: string;
}

export function CourseCard({
  name,
  provider,
  price,
  duration,
  certificate,
  urlHint,
  toolId,
}: CourseCardProps) {
  const url = getCourseUrl(provider, name, urlHint);

  const handleClick = () => {
    trackAffiliateClick(provider, toolId, name);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group min-h-[44px]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-indigo-700 group-hover:text-indigo-800 truncate">
          {name}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{provider}</span>
          {price && (
            <span className={`text-xs font-medium ${price.toLowerCase() === "free" ? "text-green-600" : "text-gray-600"}`}>
              {price}
            </span>
          )}
          {duration && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {duration}
            </span>
          )}
          {certificate && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
              <Award className="w-2.5 h-2.5" />
              cert
            </span>
          )}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 mt-1 transition-colors" />
    </a>
  );
}

/**
 * ToolCard: Renders a tool/platform recommendation with an affiliate link.
 * Used in entrepreneurship results for tools_needed.
 */
interface ToolCardProps {
  tool: string;
  cost?: string;
  whatFor?: string;
  toolId: string;
}

export function ToolCard({ tool, cost, whatFor, toolId }: ToolCardProps) {
  const url = getCourseUrl(tool, tool);

  const handleClick = () => {
    trackAffiliateClick(tool, toolId, "tool_recommendation");
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group text-sm min-h-[36px]"
    >
      <span className="font-medium text-gray-700 group-hover:text-indigo-700">{tool}</span>
      {cost && <span className="text-xs text-gray-400">({cost})</span>}
      {whatFor && <span className="text-xs text-gray-400 hidden sm:inline">— {whatFor}</span>}
      <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-indigo-500 transition-colors" />
    </a>
  );
}

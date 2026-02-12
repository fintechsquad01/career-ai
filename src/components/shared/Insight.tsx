import { AlertTriangle, TrendingUp, BarChart3, Info } from "lucide-react";
import type { InsightType } from "@/types";

interface InsightProps {
  type: InsightType;
  text: string;
}

const CONFIG: Record<InsightType, { icon: typeof AlertTriangle; bg: string; border: string; text: string }> = {
  pain: {
    icon: AlertTriangle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
  competitive: {
    icon: TrendingUp,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
  },
  data: {
    icon: BarChart3,
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-800",
  },
  info: {
    icon: Info,
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
  },
};

export function Insight({ type, text }: InsightProps) {
  const { icon: Icon, bg, border, text: textColor } = CONFIG[type];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${bg} ${border}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${textColor}`} />
      <p className={`text-sm ${textColor}`}>{text}</p>
    </div>
  );
}

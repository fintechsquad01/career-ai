"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Target, Zap, type LucideIcon } from "lucide-react";

interface QuickAccessItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
}

const DEFAULT_ITEMS: QuickAccessItem[] = [
  {
    id: "free-analysis",
    href: "/tools/displacement",
    label: "Free Analysis",
    icon: Zap,
    iconColor: "text-blue-600",
  },
  {
    id: "all-tools",
    href: "/tools",
    label: "All Tools",
    icon: Sparkles,
    iconColor: "text-indigo-600",
  },
  {
    id: "mission",
    href: "/mission",
    label: "Mission Control",
    icon: Target,
    iconColor: "text-emerald-600",
  },
];

interface DashboardQuickAccessProps {
  items?: QuickAccessItem[];
}

export function DashboardQuickAccess({ items = DEFAULT_ITEMS }: DashboardQuickAccessProps) {
  return (
    <div className="space-y-3">
      <p className="text-overline">Tool Access</p>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="surface-card surface-card-hover p-4 text-center group min-h-[44px]"
          >
            <item.icon className={`w-5 h-5 mx-auto mb-1.5 ${item.iconColor}`} />
            <p className="text-xs font-medium text-gray-700">{item.label}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400 mt-1">
              Open <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

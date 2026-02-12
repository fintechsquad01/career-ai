"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
  Wrench,
  ShieldAlert,
  Target,
  FileText,
  Mail,
  Linkedin,
  Camera,
  MessageSquare,
  TrendingUp,
  Map,
  DollarSign,
  Rocket,
  Coins,
  Clock,
  Gem,
  Gift,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Crosshair,
  Wrench,
  ShieldAlert,
  Target,
  FileText,
  Mail,
  Linkedin,
  Camera,
  MessageSquare,
  TrendingUp,
  Map,
  DollarSign,
  Rocket,
  Coins,
  Clock,
  Gem,
  Gift,
  Settings,
};

const NAV_ITEMS = [
  { href: "/dashboard", icon: "LayoutDashboard", label: "Dashboard" },
  { href: "/tools", icon: "Wrench", label: "All Tools" },
  { href: "/mission", icon: "Crosshair", label: "Job Mission" },
];

const TOOL_ITEMS = [
  { section: "Analyze", items: [
    { href: "/tools/displacement", icon: "ShieldAlert", label: "AI Displacement" },
    { href: "/tools/jd_match", icon: "Target", label: "JD Match" },
  ]},
  { section: "Build", items: [
    { href: "/tools/resume", icon: "FileText", label: "Resume Optimizer" },
    { href: "/tools/cover_letter", icon: "Mail", label: "Cover Letter" },
    { href: "/tools/linkedin", icon: "Linkedin", label: "LinkedIn" },
    { href: "/tools/headshots", icon: "Camera", label: "AI Headshots" },
  ]},
  { section: "Prepare", items: [
    { href: "/tools/interview", icon: "MessageSquare", label: "Interview Prep" },
    { href: "/tools/salary", icon: "DollarSign", label: "Salary" },
  ]},
  { section: "Grow", items: [
    { href: "/tools/skills_gap", icon: "TrendingUp", label: "Skills Gap" },
    { href: "/tools/roadmap", icon: "Map", label: "Career Roadmap" },
    { href: "/tools/entrepreneurship", icon: "Rocket", label: "Entrepreneurship" },
  ]},
];

const UTILITY_ITEMS = [
  { href: "/pricing", icon: "Coins", label: "Get Tokens" },
  { href: "/history", icon: "Clock", label: "History" },
  { href: "/lifetime", icon: "Gem", label: "Lifetime Deal" },
  { href: "/referral", icon: "Gift", label: "Refer & Earn" },
  { href: "/settings", icon: "Settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { tokenBalance } = useAppStore();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-gray-200 bg-white h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="flex-1 py-4 px-3 space-y-6">
        {/* Core nav */}
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} />
          ))}
        </div>

        {/* Tools by category */}
        {TOOL_ITEMS.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Utility */}
        <div className="space-y-0.5 pt-2 border-t border-gray-100">
          {UTILITY_ITEMS.map((item) => (
            <SidebarLink key={item.href} href={item.href} icon={item.icon} label={item.label} active={pathname === item.href} />
          ))}
        </div>
      </div>

      {/* Token balance card */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Coins className="w-4 h-4" />
          <span className="text-sm font-semibold">{tokenBalance} tokens</span>
        </div>
        <Link href="/pricing" className="text-xs text-blue-100 hover:text-white transition-colors">
          Get more tokens →
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  const Icon = ICON_MAP[icon] || Wrench;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

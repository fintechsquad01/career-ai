"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard, Crosshair, ShieldAlert, Target, FileText, Mail,
  Linkedin, Camera, MessageSquare, TrendingUp, Map, DollarSign,
  Rocket, Coins, Clock, Gem, Gift, Settings,
};

// Category color mapping: bg for icon well, text for icon, accent for active border
const CATEGORY_STYLES: Record<string, { iconBg: string; iconText: string; activeBorder: string }> = {
  nav: { iconBg: "bg-gray-100", iconText: "text-gray-600", activeBorder: "border-gray-900" },
  Analyze: { iconBg: "bg-blue-50", iconText: "text-blue-600", activeBorder: "border-blue-600" },
  Build: { iconBg: "bg-violet-50", iconText: "text-violet-600", activeBorder: "border-violet-600" },
  Prepare: { iconBg: "bg-amber-50", iconText: "text-amber-600", activeBorder: "border-amber-600" },
  Grow: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", activeBorder: "border-emerald-600" },
  utility: { iconBg: "bg-gray-50", iconText: "text-gray-500", activeBorder: "border-gray-600" },
};

const NAV_ITEMS = [
  { href: "/dashboard", icon: "LayoutDashboard", label: "Dashboard", category: "nav" },
  { href: "/mission", icon: "Crosshair", label: "Mission", category: "nav" },
];

const TOOL_ITEMS = [
  { section: "Analyze", items: [
    { href: "/tools/displacement", icon: "ShieldAlert", label: "AI Displacement" },
    { href: "/tools/jd_match", icon: "Target", label: "JD Match" },
  ]},
  { section: "Build", items: [
    { href: "/tools/resume", icon: "FileText", label: "Resume" },
    { href: "/tools/cover_letter", icon: "Mail", label: "Cover Letter" },
    { href: "/tools/linkedin", icon: "Linkedin", label: "LinkedIn" },
    { href: "/tools/headshots", icon: "Camera", label: "Headshots" },
  ]},
  { section: "Prepare", items: [
    { href: "/tools/interview", icon: "MessageSquare", label: "Interview" },
    { href: "/tools/salary", icon: "DollarSign", label: "Salary" },
  ]},
  { section: "Grow", items: [
    { href: "/tools/skills_gap", icon: "TrendingUp", label: "Skills Gap" },
    { href: "/tools/roadmap", icon: "Map", label: "Roadmap" },
    { href: "/tools/entrepreneurship", icon: "Rocket", label: "Entrepreneur" },
  ]},
];

const UTILITY_ITEMS = [
  { href: "/pricing", icon: "Coins", label: "Tokens", category: "utility" },
  { href: "/history", icon: "Clock", label: "History", category: "utility" },
  { href: "/lifetime", icon: "Gem", label: "Lifetime", category: "utility" },
  { href: "/referral", icon: "Gift", label: "Referral", category: "utility" },
  { href: "/settings", icon: "Settings", label: "Settings", category: "utility" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { tokenBalance, dailyCreditsBalance, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-gray-200/60 bg-white/80 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto overflow-x-hidden transition-all duration-200 ${
        collapsed ? "w-[60px]" : "w-52"
      }`}
    >
      <div className="flex-1 py-3 px-2 space-y-4">
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        {/* Core nav */}
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              category={item.category}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* Tools by category */}
        {TOOL_ITEMS.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
                {group.section}
              </p>
            )}
            {collapsed && (
              <div className="flex justify-center py-1">
                <div className={`w-4 h-0.5 rounded-full ${
                  group.section === "Analyze" ? "bg-blue-300" :
                  group.section === "Build" ? "bg-violet-300" :
                  group.section === "Prepare" ? "bg-amber-300" :
                  "bg-emerald-300"
                }`} />
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href || pathname.startsWith(item.href + "/")}
                  category={group.section}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Utility */}
        <div className="space-y-0.5 pt-2 border-t border-gray-100">
          {UTILITY_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              category={item.category}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>

      {/* Token balance */}
      <div className={`m-2 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white ${collapsed ? "p-2" : "p-3"}`}>
        {collapsed ? (
          <Link href="/pricing" className="flex flex-col items-center gap-0.5" title={`${tokenBalance + dailyCreditsBalance} tokens`}>
            <Coins className="w-4 h-4 text-gray-300" />
            <span className="text-[10px] font-bold">{tokenBalance + dailyCreditsBalance}</span>
          </Link>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <Coins className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-semibold">{tokenBalance + dailyCreditsBalance}</span>
              <span className="text-[10px] text-gray-400">tokens</span>
            </div>
            {dailyCreditsBalance > 0 && (
              <p className="text-[10px] text-gray-500 mb-1">{dailyCreditsBalance} daily · {tokenBalance} purchased</p>
            )}
            <Link href="/pricing" className="text-[11px] text-gray-400 hover:text-white transition-colors">
              Get more →
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}

function SidebarLink({
  href, icon, label, active, category, collapsed,
}: {
  href: string; icon: string; label: string; active: boolean; category: string; collapsed: boolean;
}) {
  const Icon = ICON_MAP[icon] || LayoutDashboard;
  const styles = CATEGORY_STYLES[category] || CATEGORY_STYLES.nav;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-2 rounded-lg transition-all duration-150 ${
        collapsed ? "justify-center px-1 py-2" : "px-2 py-1.5"
      } ${
        active
          ? `bg-gray-50 border-l-2 ${styles.activeBorder}`
          : "border-l-2 border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      <div className={`flex items-center justify-center rounded-lg flex-shrink-0 ${
        collapsed ? "w-8 h-8" : "w-7 h-7"
      } ${active ? styles.iconBg : "bg-transparent"}`}>
        <Icon
          className={`${collapsed ? "w-4 h-4" : "w-3.5 h-3.5"} ${active ? styles.iconText : "text-gray-400"}`}
          strokeWidth={1.5}
        />
      </div>
      {!collapsed && (
        <span className={`text-[13px] truncate ${active ? "font-medium text-gray-900" : ""}`}>
          {label}
        </span>
      )}
    </Link>
  );
}

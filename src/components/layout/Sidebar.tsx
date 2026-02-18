"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
  Wrench,
  Clock,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Briefcase,
  Zap,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/mission", icon: Crosshair, label: "App HQ" },
  { href: "/quick-apply", icon: Zap, label: "Quick Apply" },
  { href: "/tools", icon: Wrench, label: "Tools" },
  { href: "/history", icon: Clock, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const QUICK_TOOLS = [
  { href: "/tools/displacement", icon: ShieldAlert, label: "AI Risk", color: "text-red-500" },
  { href: "/tools/resume", icon: FileText, label: "Resume", color: "text-blue-500" },
  { href: "/tools/interview", icon: Zap, label: "Interview", color: "text-violet-500" },
];

/** Mini SVG ring for token progress (sidebar) */
function TokenRing({ balance, max = 200 }: { balance: number; max?: number }) {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(balance / max, 1);
  const offset = circumference - pct * circumference;
  const color = balance <= 5 ? "#EF4444" : balance <= 20 ? "#F59E0B" : "#22C55E";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{ filter: `drop-shadow(0 0 3px ${color}60)` }}
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-white tabular-nums">
        {balance}
      </span>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const tokenBalance = useAppStore((s) => s.tokenBalance);
  const dailyCreditsBalance = useAppStore((s) => s.dailyCreditsBalance);
  const tokensLoaded = useAppStore((s) => s.tokensLoaded);
  const tokenAnimating = useAppStore((s) => s.tokenAnimating);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);

  const totalBalance = tokenBalance + dailyCreditsBalance;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-gray-200/60 bg-white/90 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16 z-10 overflow-y-auto overflow-x-hidden transition-all duration-200 ${
        sidebarCollapsed ? "w-[60px]" : "w-48"
      }`}
    >
      <div className="flex-1 py-3 px-2 space-y-1">
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center w-full py-1.5 mb-2 text-gray-400 hover:text-gray-600 transition-colors"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        {/* Navigation items */}
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          const isToolsActive = item.href === "/tools" && pathname.startsWith("/tools");

          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={`nav-item flex items-center gap-2.5 transition-all duration-150 ${
                sidebarCollapsed ? "justify-center px-1 py-2.5" : "px-3 py-2.5"
              } ${
                active || isToolsActive
                  ? "nav-item-active text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              } ${
                isToolsActive && pathname.startsWith("/tools/")
                  ? "border-l-2 border-l-violet-500"
                  : ""
              }`}
            >
              <item.icon
                className={`flex-shrink-0 ${sidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"}`}
                strokeWidth={active || isToolsActive ? 2 : 1.5}
              />
              {!sidebarCollapsed && (
                <span className={`text-sm truncate ${active || isToolsActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* Quick tool shortcuts — expanded only */}
        {!sidebarCollapsed && (
          <div className="pt-3 mt-2 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">Quick Tools</p>
            {QUICK_TOOLS.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <t.icon className={`w-3.5 h-3.5 ${active ? "text-blue-600" : t.color}`} strokeWidth={1.5} />
                  {t.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Job Target indicator */}
      {activeJobTarget && !sidebarCollapsed && (
        <Link
          href="/mission"
          className="mx-2 mb-1.5 px-3 py-2 rounded-xl surface-card-hero hover:bg-blue-50 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Target</p>
              <p className="text-xs font-medium text-gray-700 truncate group-hover:text-blue-700 transition-colors">
                {activeJobTarget.title}
              </p>
            </div>
          </div>
        </Link>
      )}
      {activeJobTarget && sidebarCollapsed && (
        <Link
          href="/mission"
          title={`Target: ${activeJobTarget.title}`}
          className="flex justify-center mx-2 mb-1.5 py-1.5 rounded-lg bg-blue-50/80 border border-blue-100 hover:bg-blue-50 transition-colors"
        >
          <Briefcase className="w-4 h-4 text-blue-500" />
        </Link>
      )}

      {/* Token balance with ring */}
      <div className={`mx-2 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white ${sidebarCollapsed ? "p-2" : "p-3"}`}>
        {sidebarCollapsed ? (
          <Link href="/pricing" className="flex flex-col items-center gap-0.5" title={`${totalBalance} tokens`}>
            {tokensLoaded ? (
              <TokenRing balance={totalBalance} />
            ) : (
              <span className="inline-block w-6 h-3 bg-white/20 rounded animate-pulse" />
            )}
          </Link>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              {tokensLoaded && <TokenRing balance={totalBalance} />}
              <div className="flex-1 min-w-0">
                {tokensLoaded ? (
                  dailyCreditsBalance > 0 && tokenBalance > 0 ? (
                    <span className={`text-sm font-semibold tabular-nums ${tokenAnimating ? "token-spend-animate" : ""}`}>
                      {tokenBalance}
                      <span className="text-xs text-gray-500 mx-0.5">+</span>
                      <span className="text-xs text-gray-400">{dailyCreditsBalance}</span>
                    </span>
                  ) : (
                    <span className={`text-sm font-semibold tabular-nums ${tokenAnimating ? "token-spend-animate" : ""}`}>{totalBalance}</span>
                  )
                ) : (
                  <span className="inline-block w-8 h-4 bg-white/20 rounded animate-pulse" />
                )}
                <span className="text-[10px] text-gray-400 ml-1">tokens</span>
              </div>
            </div>
            {dailyCreditsBalance > 0 && (
              <p className="text-[10px] text-gray-500 mb-1">{tokenBalance} purchased · {dailyCreditsBalance} daily</p>
            )}
            <Link href="/pricing" className="text-[11px] text-gray-400 hover:text-white transition-colors">
              Get more →
            </Link>
          </>
        )}
      </div>

      {/* Sign Out — bottom */}
      <button
        onClick={handleSignOut}
        title={sidebarCollapsed ? "Sign Out" : undefined}
        className={`flex items-center gap-2 mx-2 mb-2 mt-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors ${
          sidebarCollapsed ? "justify-center px-1 py-2" : "px-3 py-2"
        }`}
      >
        <LogOut className="w-4 h-4 flex-shrink-0" />
        {!sidebarCollapsed && <span className="text-xs font-medium">Sign Out</span>}
      </button>
    </aside>
  );
}

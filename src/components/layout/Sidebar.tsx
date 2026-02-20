"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Briefcase,
  Zap,
  FileText,
  ShieldAlert,
  Coins,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";
import { CORE_NAV_ITEMS, EXTENDED_NAV_ITEMS, isActiveRoute, type AppNavItem } from "@/lib/navigation";
import { useWave2JourneyFlow } from "@/hooks/useWave2JourneyFlow";
import { EVENTS, track } from "@/lib/analytics";
import { CANONICAL_COPY } from "@/lib/constants";

const navByKey = new Map<string, AppNavItem>(
  [...CORE_NAV_ITEMS, ...EXTENDED_NAV_ITEMS].map((item) => [item.key, item])
);
const NAV_ITEMS: AppNavItem[] = [
  navByKey.get("dashboard")!,
  navByKey.get("mission")!,
  navByKey.get("quick_apply")!,
  navByKey.get("tools")!,
  navByKey.get("history")!,
  navByKey.get("settings")!,
];

const QUICK_TOOLS = [
  { href: "/tools/displacement", icon: ShieldAlert, label: "AI Risk", color: "text-red-500" },
  { href: "/tools/resume", icon: FileText, label: "Resume", color: "text-blue-500" },
  { href: "/tools/interview", icon: Zap, label: "Interview", color: "text-indigo-500" },
];

export function Sidebar() {
  const wave2JourneyFlowEnabled = useWave2JourneyFlow();
  const pathname = usePathname();
  const router = useRouter();
  const tokenBalance = useAppStore((s) => s.tokenBalance);
  const dailyCreditsBalance = useAppStore((s) => s.dailyCreditsBalance);
  const profile = useAppStore((s) => s.profile);
  const tokensLoaded = useAppStore((s) => s.tokensLoaded);
  const tokenAnimating = useAppStore((s) => s.tokenAnimating);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);

  const totalBalance = tokenBalance + dailyCreditsBalance;

  const getJourneyBadge = (key: string): "New" | "In progress" | "Ready" | null => {
    if (!wave2JourneyFlowEnabled) return null;
    if (key === "mission") return activeJobTarget ? "In progress" : "New";
    if (key === "history") return (profile?.total_tokens_spent ?? 0) > 0 ? "Ready" : "New";
    return null;
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-gray-200/60 bg-white/90 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16 z-10 overflow-y-auto overflow-x-hidden transition-all duration-200 ${
        sidebarCollapsed ? "w-[68px]" : "w-56"
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
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => track(EVENTS.NAV_ITEM_CLICKED, { from_route: pathname, to_route: item.href })}
              title={sidebarCollapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              className={`nav-item flex items-center gap-2.5 transition-all duration-150 ${
                sidebarCollapsed ? "justify-center px-1 py-2.5" : "px-3 py-2.5"
              } ${
                active
                  ? "nav-item-active text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <item.icon
                className={`flex-shrink-0 ${sidebarCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"}`}
                strokeWidth={active ? 2 : 1.5}
              />
              {!sidebarCollapsed && (
                <div className="min-w-0 w-full">
                  <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                  {getJourneyBadge(item.key) && (
                    <span className={`ui-badge mt-1 inline-flex ${getJourneyBadge(item.key) === "Ready" ? "ui-badge-green" : getJourneyBadge(item.key) === "In progress" ? "ui-badge-blue" : "ui-badge-amber"}`}>
                      {getJourneyBadge(item.key)}
                    </span>
                  )}
                </div>
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
                  className={`nav-item flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                    active ? "nav-item-active text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
          onClick={() => track(EVENTS.NAV_TARGET_SWITCH_OPENED, { from_route: pathname, to_route: "/mission" })}
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
          onClick={() => track(EVENTS.NAV_TARGET_SWITCH_OPENED, { from_route: pathname, to_route: "/mission" })}
          title={`Target: ${activeJobTarget.title}`}
          className="flex justify-center mx-2 mb-1.5 py-1.5 rounded-lg bg-blue-50/80 border border-blue-100 hover:bg-blue-50 transition-colors"
        >
          <Briefcase className="w-4 h-4 text-blue-500" />
        </Link>
      )}

      {/* Token balance with ring */}
      <div className={`mx-2 rounded-xl surface-card ${sidebarCollapsed ? "p-2" : "p-3"}`}>
        {sidebarCollapsed ? (
          <Link href="/pricing" className="flex flex-col items-center gap-0.5 text-gray-700" title={`${totalBalance} tokens`}>
            {tokensLoaded ? (
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-100">
                <Coins className="w-4 h-4 text-blue-600" />
              </div>
            ) : (
              <span className="inline-block w-6 h-3 bg-gray-200 rounded animate-pulse" />
            )}
            {tokensLoaded && <span className="text-[10px] font-semibold tabular-nums">{totalBalance}</span>}
          </Link>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex-shrink-0">
                <Coins className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Token Balance</p>
                {tokensLoaded ? (
                  <span className={`text-base font-semibold text-gray-900 tabular-nums ${tokenAnimating ? "token-spend-animate" : ""}`}>
                    {totalBalance}
                  </span>
                ) : (
                  <span className="inline-block w-8 h-4 bg-gray-200 rounded animate-pulse" />
                )}
              </div>
            </div>
            {dailyCreditsBalance > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1">
                {tokenBalance > 0 && <span className="ui-badge ui-badge-gray">{tokenBalance} purchased</span>}
                <span className="ui-badge ui-badge-blue">{dailyCreditsBalance} daily {CANONICAL_COPY.tokens.unit}</span>
              </div>
            )}
            <Link href="/pricing" className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
              {CANONICAL_COPY.cta.addTokens} →
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

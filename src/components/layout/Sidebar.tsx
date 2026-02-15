"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
  Wrench,
  Clock,
  Settings,
  Coins,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/mission", icon: Crosshair, label: "App HQ" },
  { href: "/tools", icon: Wrench, label: "Tools" },
  { href: "/history", icon: Clock, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Use individual selectors to prevent re-renders from unrelated state changes
  const tokenBalance = useAppStore((s) => s.tokenBalance);
  const dailyCreditsBalance = useAppStore((s) => s.dailyCreditsBalance);
  const tokensLoaded = useAppStore((s) => s.tokensLoaded);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-gray-200/60 bg-white/80 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16 z-10 overflow-y-auto overflow-x-hidden transition-all duration-200 ${
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
              className={`flex items-center gap-2.5 rounded-xl transition-all duration-150 ${
                sidebarCollapsed ? "justify-center px-1 py-2.5" : "px-3 py-2.5"
              } ${
                active || isToolsActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              } ${
                isToolsActive && pathname.startsWith("/tools/")
                  ? "border-l-2 border-l-violet-500"
                  : ""
              }`}
            >
              <item.icon
                className={`flex-shrink-0 ${sidebarCollapsed ? "w-5 h-5" : "w-4.5 h-4.5"}`}
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
      </div>

      {/* Token balance */}
      <div className={`mx-2 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white ${sidebarCollapsed ? "p-2" : "p-3"}`}>
        {sidebarCollapsed ? (
          <Link href="/pricing" className="flex flex-col items-center gap-0.5" title={`${tokenBalance + dailyCreditsBalance} tokens`}>
            <Coins className="w-4 h-4 text-gray-300" />
            {tokensLoaded ? (
              <span className="text-[10px] font-bold">{tokenBalance + dailyCreditsBalance}</span>
            ) : (
              <span className="inline-block w-6 h-3 bg-white/20 rounded animate-pulse" />
            )}
          </Link>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <Coins className="w-3.5 h-3.5 text-gray-400" />
              {tokensLoaded ? (
                dailyCreditsBalance > 0 && tokenBalance > 0 ? (
                  <span className="text-sm font-semibold tabular-nums">
                    {tokenBalance}
                    <span className="text-xs text-gray-500 mx-0.5">+</span>
                    <span className="text-xs text-gray-400">{dailyCreditsBalance}</span>
                  </span>
                ) : (
                  <span className="text-sm font-semibold tabular-nums">{tokenBalance + dailyCreditsBalance}</span>
                )
              ) : (
                <span className="inline-block w-8 h-4 bg-white/20 rounded animate-pulse" />
              )}
              <span className="text-[10px] text-gray-400">tokens</span>
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

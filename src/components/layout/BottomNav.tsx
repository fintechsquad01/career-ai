"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Crosshair, Wrench, User } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

const ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home", key: "home" },
  { href: "/mission", icon: Crosshair, label: "App HQ", key: "mission" },
  { href: "/tools", icon: Wrench, label: "Tools", key: "tools" },
  { href: "/settings", icon: User, label: "Profile", key: "profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const profile = useAppStore((s) => s.profile);

  // Show a notification dot on Tools when user hasn't explored tools yet
  // (total_tokens_spent === 0 means they haven't run any paid tools)
  const hasExploredTools = (profile?.total_tokens_spent ?? 0) > 0;
  const showToolsDot = profile !== null && !hasExploredTools;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-6px_24px_rgba(15,23,42,0.08)] md:hidden">
      <div className="flex items-center justify-around">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const showDot = item.key === "tools" && showToolsDot && !active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-2 px-4 min-h-[48px] min-w-[48px] transition-colors ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div className={`relative ${active ? "bg-blue-50 rounded-lg px-2 py-1" : ""}`}>
                <item.icon className="w-5 h-5" strokeWidth={active ? 2 : 1.75} />
                {showDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full bg-blue-500" />
                )}
              </div>
              <span className={`text-[11px] font-medium mt-0.5 ${active ? "text-blue-700" : ""}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

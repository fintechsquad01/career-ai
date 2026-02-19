"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { CORE_NAV_ITEMS, isActiveRoute } from "@/lib/navigation";

const ITEMS = CORE_NAV_ITEMS;

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
          const active = isActiveRoute(pathname, item.href);
          const showDot = item.key === "tools" && showToolsDot && !active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`nav-item relative flex flex-col items-center justify-center py-2 px-4 min-h-[48px] min-w-[48px] transition-colors ${
                active ? "nav-item-active text-blue-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" strokeWidth={active ? 2 : 1.75} />
                {showDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full bg-violet-500" />
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

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain, Menu, X, ChevronRight, Settings, LogOut, Plus, Coins, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TokBadge } from "@/components/shared/TokBadge";
import { useAppStore } from "@/stores/app-store";
import { createClient } from "@/lib/supabase/client";
import { TOOLS_MAP, CANONICAL_COPY } from "@/lib/constants";
import { CORE_NAV_ITEMS, EXTENDED_NAV_ITEMS, isActiveRoute } from "@/lib/navigation";
import { useWave2JourneyFlow } from "@/hooks/useWave2JourneyFlow";
import { EVENTS, track } from "@/lib/analytics";

interface NavProps {
  isLoggedIn: boolean;
}

const AUTH_NAV_ITEMS = [...CORE_NAV_ITEMS, ...EXTENDED_NAV_ITEMS];

/** Derive a breadcrumb from the current pathname */
function useBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href?: string }> = [];

  if (segments[0] === "dashboard") {
    crumbs.push({ label: "Dashboard" });
  } else if (segments[0] === "mission") {
    crumbs.push({ label: "Mission Control" });
  } else if (segments[0] === "tools") {
    crumbs.push({ label: "Tools", href: "/tools" });
    if (segments[1]) {
      const tool = TOOLS_MAP[segments[1]];
      crumbs.push({ label: tool?.title || segments[1].replace(/_/g, " ") });
    }
  } else if (segments[0] === "settings") {
    crumbs.push({ label: "Settings" });
  } else if (segments[0] === "history") {
    crumbs.push({ label: "History" });
  } else if (segments[0] === "quick-apply") {
    crumbs.push({ label: "Quick Apply" });
  } else if (segments[0] === "pricing") {
    crumbs.push({ label: "Tokens" });
  } else if (segments[0] === "lifetime") {
    crumbs.push({ label: "Lifetime Deal" });
  } else if (segments[0] === "referral") {
    crumbs.push({ label: "Referral" });
  }

  return crumbs;
}

export function Nav({ isLoggedIn }: NavProps) {
  const wave2JourneyFlowEnabled = useWave2JourneyFlow();
  const pathname = usePathname();
  const router = useRouter();
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useAppStore((s) => s.setMobileMenuOpen);
  const profile = useAppStore((s) => s.profile);
  const dailyCreditsBalance = useAppStore((s) => s.dailyCreditsBalance);
  const dailyCreditsAwarded = useAppStore((s) => s.dailyCreditsAwarded);
  const activeJobTarget = useAppStore((s) => s.activeJobTarget);
  const breadcrumbs = useBreadcrumb(pathname);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [avatarMenuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAvatarMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const getJourneyBadge = (key: string): "New" | "In progress" | "Ready" | null => {
    if (!wave2JourneyFlowEnabled) return null;
    if (key === "mission") return activeJobTarget ? "In progress" : "New";
    if (key === "history") return (profile?.total_tokens_spent ?? 0) > 0 ? "Ready" : "New";
    return null;
  };

  return (
    <>
      <nav
        data-wave2-journey={wave2JourneyFlowEnabled ? "enabled" : "disabled"}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/70"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 sm:h-16">
          {/* Logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Brain className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg hidden sm:inline">AISkillScore</span>
            </Link>

            {/* Breadcrumb — desktop only, logged-in only */}
            {isLoggedIn && breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center gap-1 text-sm text-gray-400 min-w-0">
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1 min-w-0">
                    {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-gray-600 transition-colors truncate">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-700 font-medium truncate">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
            {isLoggedIn && activeJobTarget?.title && (
              <Link
                href="/mission"
                onClick={() => track(EVENTS.NAV_TARGET_SWITCH_OPENED, { from_route: pathname, to_route: "/mission" })}
                className="hidden lg:inline-flex items-center max-w-[260px] truncate rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Target: {activeJobTarget.title}
              </Link>
            )}
          </div>

          {/* Right side */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="relative inline-flex items-center">
                <Link href="/pricing" aria-label="Manage tokens" className="inline-flex items-center">
                  <TokBadge />
                </Link>
                {dailyCreditsBalance > 0 && !dailyCreditsAwarded && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-bold shadow-sm"
                  >
                    <Plus className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden hover:opacity-90 transition-opacity"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name ? `${profile.full_name}'s avatar` : "User avatar"} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </button>
                {avatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <Link href="/settings" onClick={() => setAvatarMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4 text-gray-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/resources" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Resources
              </Link>
              <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-opacity min-h-[44px] flex items-center"
              >
                {CANONICAL_COPY.cta.getStarted}
              </Link>
            </div>
          )}

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2.5">
            {isLoggedIn && (
              <div className="relative inline-flex items-center">
                <Link href="/pricing" aria-label="Manage tokens" className="inline-flex items-center">
                  <TokBadge />
                </Link>
                {dailyCreditsBalance > 0 && !dailyCreditsAwarded && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-bold shadow-sm">
                    <Plus className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                )}
              </div>
            )}
            {isLoggedIn && pathname.startsWith("/tools/") && (
              <Link
                href="/history"
                aria-label="Open history quickly"
                onClick={() => track(EVENTS.NAV_HISTORY_QUICK_OPENED, { from_route: pathname, to_route: "/history" })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-blue-700 min-h-[36px]"
              >
                <Clock className="w-4 h-4" />
                History
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white pt-14 md:hidden overflow-y-auto">
          <div className="px-4 py-6 space-y-1">
            {isLoggedIn ? (
              <>
                <p className="text-overline px-3 pb-1">Job Mission Control</p>
                {AUTH_NAV_ITEMS.map((item) => (
                  <MobileLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActiveRoute(pathname, item.href)}
                    badge={getJourneyBadge(item.key)}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
                <div className="pt-2 px-1">
                  <Link
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 min-h-[44px]"
                  >
                    <Coins className="w-4 h-4" />
                    Add Tokens
                  </Link>
                </div>
                <div className="border-t border-gray-200 my-2" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-3 py-3 rounded-xl text-base font-medium text-gray-500 hover:bg-gray-50 min-h-[44px]"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/pricing" label="Pricing" active={isActiveRoute(pathname, "/pricing")} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/resources" label="Resources" active={isActiveRoute(pathname, "/resources")} onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/auth" label="Sign In" active={isActiveRoute(pathname, "/auth")} onClick={() => setMobileMenuOpen(false)} />
                <div className="pt-4">
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 min-h-[48px]"
                  >
                    {CANONICAL_COPY.cta.getStarted}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  label,
  active,
  onClick,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  badge?: "New" | "In progress" | "Ready" | null;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      onClick={() => {
        track(EVENTS.NAV_ITEM_CLICKED, { from_route: pathname, to_route: href });
        onClick();
      }}
      aria-current={active ? "page" : undefined}
      className={`nav-item flex items-center gap-2.5 px-3 py-3 text-base font-medium min-h-[44px] ${
        active ? "nav-item-active text-blue-700" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {Icon && <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={active ? 2 : 1.75} />}
      <span>{label}</span>
      {badge && (
        <span className={`ml-auto ui-badge ${badge === "Ready" ? "ui-badge-green" : badge === "In progress" ? "ui-badge-blue" : "ui-badge-amber"}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

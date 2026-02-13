"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X, ChevronRight } from "lucide-react";
import { TokBadge } from "@/components/shared/TokBadge";
import { useAppStore } from "@/stores/app-store";
import { TOOLS_MAP } from "@/lib/constants";

interface NavProps {
  isLoggedIn: boolean;
}

/** Derive a breadcrumb from the current pathname */
function useBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Array<{ label: string; href?: string }> = [];

  if (segments[0] === "dashboard") {
    crumbs.push({ label: "Dashboard" });
  } else if (segments[0] === "mission") {
    crumbs.push({ label: "Mission" });
  } else if (segments[0] === "tools") {
    crumbs.push({ label: "Tools", href: "/dashboard" });
    if (segments[1]) {
      const tool = TOOLS_MAP[segments[1]];
      crumbs.push({ label: tool?.title || segments[1].replace(/_/g, " ") });
    }
  } else if (segments[0] === "pricing") {
    crumbs.push({ label: "Tokens" });
  } else if (segments[0] === "settings") {
    crumbs.push({ label: "Settings" });
  } else if (segments[0] === "history") {
    crumbs.push({ label: "History" });
  } else if (segments[0] === "lifetime") {
    crumbs.push({ label: "Lifetime Deal" });
  } else if (segments[0] === "referral") {
    crumbs.push({ label: "Referral" });
  }

  return crumbs;
}

export function Nav({ isLoggedIn }: NavProps) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, profile } = useAppStore();
  const breadcrumbs = useBreadcrumb(pathname);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
          {/* Logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
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
          </div>

          {/* Right side */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-4">
              <TokBadge />
              <Link
                href="/settings"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden hover:opacity-90 transition-opacity"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name ? `${profile.full_name}'s avatar` : "User avatar"} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 transition-opacity min-h-[44px] flex items-center"
              >
                Get Started — Free
              </Link>
            </div>
          )}

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            {isLoggedIn && <TokBadge />}
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
                <MobileLink href="/dashboard" label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/mission" label="Mission" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/tools" label="Tools" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/pricing" label="Tokens" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/history" label="History" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/settings" label="Settings" onClick={() => setMobileMenuOpen(false)} />
              </>
            ) : (
              <>
                <MobileLink href="/pricing" label="Pricing" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/auth" label="Sign In" onClick={() => setMobileMenuOpen(false)} />
                <div className="pt-4">
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 min-h-[48px]"
                  >
                    Get Started — Free
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

function MobileLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
    >
      {label}
    </Link>
  );
}

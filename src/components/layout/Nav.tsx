"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X } from "lucide-react";
import { TokBadge } from "@/components/shared/TokBadge";
import { useAppStore } from "@/stores/app-store";

interface NavProps {
  isLoggedIn: boolean;
}

export function Nav({ isLoggedIn }: NavProps) {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, profile, activeJobTarget } = useAppStore();
  const missionIncomplete = activeJobTarget && activeJobTarget.mission_actions
    ? Object.values(activeJobTarget.mission_actions as Record<string, boolean>).filter(Boolean).length < 5
    : false;

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
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">CareerAI</span>
          </Link>

          {/* Desktop nav */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${pathname === "/dashboard" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/mission"
                className={`text-sm font-medium relative ${pathname === "/mission" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Job Mission
                {missionIncomplete && <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />}
              </Link>
              <Link
                href="/pricing"
                className={`text-sm font-medium ${pathname === "/pricing" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Tokens
              </Link>
              <TokBadge />
              <Link href="/settings" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
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
                <MobileLink href="/mission" label="Job Mission" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/tools" label="All Tools" onClick={() => setMobileMenuOpen(false)} />
                <MobileLink href="/pricing" label="Get Tokens" onClick={() => setMobileMenuOpen(false)} />
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

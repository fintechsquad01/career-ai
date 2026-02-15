"use client";

import { useEffect } from "react";
import { Nav } from "./Nav";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { ToastProvider } from "@/components/shared/Toast";
import { useAppStore } from "@/stores/app-store";
import { usePostAuthSync } from "@/hooks/usePostAuthSync";
import type { Profile, CareerProfile, JobTarget } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  profile?: Profile | null;
  careerProfile?: CareerProfile | null;
  activeJobTarget?: JobTarget | null;
}

export function AppShell({
  children,
  isLoggedIn,
  profile,
  careerProfile,
  activeJobTarget,
}: AppShellProps) {
  const { setProfile, setCareerProfile, setActiveJobTarget } = useAppStore();

  useEffect(() => {
    if (profile) setProfile(profile);
    if (careerProfile !== undefined) setCareerProfile(careerProfile ?? null);
    if (activeJobTarget !== undefined) setActiveJobTarget(activeJobTarget ?? null);
  }, [profile, careerProfile, activeJobTarget, setProfile, setCareerProfile, setActiveJobTarget]);

  // Sync any pre-auth localStorage data (resume/JD) to the database
  usePostAuthSync();

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav isLoggedIn={isLoggedIn} />
      <div className="flex">
        {isLoggedIn && <Sidebar />}
        <main className="flex-1 min-w-0">
          <div className={isLoggedIn ? "pb-24 sm:pb-8" : ""}>
            {children}
          </div>
        </main>
      </div>
      {isLoggedIn && <BottomNav />}
      <ToastProvider />
    </div>
  );
}

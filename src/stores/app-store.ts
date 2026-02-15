import { create } from "zustand";
import type { Profile, CareerProfile, JobTarget } from "@/types";

interface AppState {
  // User & profile
  profile: Profile | null;
  careerProfile: CareerProfile | null;
  activeJobTarget: JobTarget | null;
  setProfile: (profile: Profile | null) => void;
  setCareerProfile: (cp: CareerProfile | null) => void;
  setActiveJobTarget: (jt: JobTarget | null) => void;

  // Tokens
  tokenBalance: number;
  dailyCreditsBalance: number;
  dailyCreditsAwarded: boolean;
  tokenAnimating: boolean;
  tokensLoaded: boolean;
  setTokenBalance: (balance: number) => void;
  setDailyCreditsBalance: (balance: number) => void;
  setDailyCreditsAwarded: (awarded: boolean) => void;
  setTokenAnimating: (animating: boolean) => void;
  setTokensLoaded: (loaded: boolean) => void;

  // UI
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  careerProfile: null,
  activeJobTarget: null,
  setProfile: (profile) =>
    set({
      profile,
      tokenBalance: profile?.token_balance ?? 0,
      dailyCreditsBalance: profile?.daily_credits_balance ?? 0,
    }),
  setCareerProfile: (careerProfile) => set({ careerProfile }),
  setActiveJobTarget: (activeJobTarget) => set({ activeJobTarget }),

  tokenBalance: 0,
  dailyCreditsBalance: 0,
  dailyCreditsAwarded: false,
  tokenAnimating: false,
  tokensLoaded: false,
  setTokenBalance: (tokenBalance) => set({ tokenBalance }),
  setDailyCreditsBalance: (dailyCreditsBalance) => set({ dailyCreditsBalance }),
  setDailyCreditsAwarded: (dailyCreditsAwarded) => set({ dailyCreditsAwarded }),
  setTokenAnimating: (tokenAnimating) => set({ tokenAnimating }),
  setTokensLoaded: (tokensLoaded) => set({ tokensLoaded }),

  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}));

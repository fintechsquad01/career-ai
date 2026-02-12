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
  tokenAnimating: boolean;
  setTokenBalance: (balance: number) => void;
  setTokenAnimating: (animating: boolean) => void;

  // UI
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  careerProfile: null,
  activeJobTarget: null,
  setProfile: (profile) => set({ profile, tokenBalance: profile?.token_balance ?? 0 }),
  setCareerProfile: (careerProfile) => set({ careerProfile }),
  setActiveJobTarget: (activeJobTarget) => set({ activeJobTarget }),

  tokenBalance: 0,
  tokenAnimating: false,
  setTokenBalance: (tokenBalance) => set({ tokenBalance }),
  setTokenAnimating: (tokenAnimating) => set({ tokenAnimating }),

  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));

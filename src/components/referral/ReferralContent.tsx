"use client";

import { useState } from "react";
import { Gift, Copy, CheckCircle, Twitter, Linkedin } from "lucide-react";
import type { Profile } from "@/types";

interface ReferralContentProps {
  profile: Profile | null;
}

export function ReferralContent({ profile }: ReferralContentProps) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://careerai.com";
  const referralLink = `${appUrl}?ref=${profile?.referral_code || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Refer & Earn</h1>
        <p className="text-gray-500">Give 5 tokens, get 10 tokens. Everyone wins.</p>
      </div>

      {/* Value prop */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 text-white text-center">
        <Gift className="w-12 h-12 mx-auto mb-4 text-blue-200" />
        <h2 className="text-xl font-bold mb-2">Give 5, Get 10</h2>
        <p className="text-blue-100 text-sm">
          When your friend signs up and runs their first paid tool, you both get free tokens.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{profile?.referral_count || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Referrals</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{(profile?.referral_count || 0) * 10}</p>
          <p className="text-sm text-gray-500 mt-1">Tokens earned</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Your referral link</h3>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 min-h-[44px]"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors min-h-[44px] flex items-center gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=Check out CareerAI - AI-powered career tools&url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <Twitter className="w-4 h-4" /> Twitter
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <Linkedin className="w-4 h-4" /> LinkedIn
        </a>
      </div>
    </div>
  );
}

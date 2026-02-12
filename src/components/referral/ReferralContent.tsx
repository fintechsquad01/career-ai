"use client";

import { useState } from "react";
import { Gift, Copy, CheckCircle, Twitter, Linkedin, Users, Coins } from "lucide-react";
import type { Profile, TokenTransaction } from "@/types";

interface ReferralContentProps {
  profile: Profile | null;
  referralTransactions?: TokenTransaction[];
}

export function ReferralContent({ profile, referralTransactions = [] }: ReferralContentProps) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://careerai.com";
  const referralLink = `${appUrl}?ref=${profile?.referral_code || ""}`;

  const totalEarned = referralTransactions.reduce((sum, tx) => sum + Math.max(0, tx.amount), 0);

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
          <p className="text-3xl font-bold text-green-600">{totalEarned}</p>
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

      {/* Referral History */}
      {referralTransactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            Referral History
          </h3>
          <div className="space-y-3">
            {referralTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      {tx.description || "Referral bonus"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  +{tx.amount} tokens
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for no referrals */}
      {referralTransactions.length === 0 && (profile?.referral_count || 0) === 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Share your referral link to start earning tokens. Your referral history will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

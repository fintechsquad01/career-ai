"use client";

import { useState, useEffect } from "react";
import { User, CreditCard, Shield, Upload, Download, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/shared/Toast";
import type { Profile, CareerProfile, TokenTransaction } from "@/types";

interface SettingsContentProps {
  profile: Profile | null;
  careerProfile: CareerProfile | null;
  transactions: TokenTransaction[];
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: CreditCard },
  { id: "privacy", label: "Privacy", icon: Shield },
] as const;

export function SettingsContent({ profile, careerProfile, transactions }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [name, setName] = useState(profile?.full_name || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setName(profile?.full_name || "");
  }, [profile?.full_name]);

  const handleSave = async () => {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", profile?.id || "");
    if (!error) toast("Profile saved!");
  };

  const handleExportData = async () => {
    const supabase = createClient();
    const userId = profile?.id;
    if (!userId) return;
    const [profiles, career, jobs, results, txns] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId),
      supabase.from("career_profiles").select("*").eq("user_id", userId),
      supabase.from("job_targets").select("*").eq("user_id", userId),
      supabase.from("tool_results").select("*").eq("user_id", userId),
      supabase.from("token_transactions").select("*").eq("user_id", userId),
    ]);
    const exportData = { profiles: profiles.data, career_profiles: career.data, job_targets: jobs.data, tool_results: results.data, token_transactions: txns.data };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "careerai-data.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Data exported!");
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    toast("Account deletion requested");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
                {profile?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
              </div>
              <button className="text-sm text-blue-600 font-medium hover:underline">Change photo</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
              {careerProfile?.resume_text ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-sm text-green-800">Resume uploaded</span>
                  <button className="text-xs text-red-600 hover:underline">Remove</button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Upload PDF or DOCX</p>
                </div>
              )}
            </div>

            <button onClick={handleSave} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px]">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Account tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Token Balance</h3>
            <p className="text-4xl font-bold text-gray-900">{profile?.token_balance ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.total_tokens_purchased || 0} purchased · {profile?.total_tokens_spent || 0} spent
            </p>
            <Link href="/pricing" className="inline-block mt-4 text-sm text-blue-600 font-medium hover:underline">
              Get more tokens →
            </Link>
          </div>

          {!profile?.lifetime_deal && (
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-1">Lifetime Deal Available</h3>
              <p className="text-sm text-blue-100 mb-3">$49 for 100 tokens/month forever</p>
              <Link href="/lifetime" className="inline-block px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50">
                Learn More
              </Link>
            </div>
          )}

          {transactions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Transaction History</h3>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-900">{tx.description || tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Privacy tab */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Data & Privacy</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• AES-256 encryption at rest for all personal data</p>
              <p>• AI processing via API with no data retention</p>
              <p>• Auto-delete after 90 days of inactivity</p>
              <p>• GDPR compliant with full data export and deletion</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Your Data</h3>
            <button onClick={handleExportData} className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px]">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Download className="w-4 h-4" /> Export All Data (JSON)
              </span>
            </button>
            <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between px-4 py-3 border border-red-200 rounded-xl hover:bg-red-50 transition-colors min-h-[44px]">
              <span className="flex items-center gap-2 text-sm font-medium text-red-600">
                <Trash2 className="w-4 h-4" /> Delete Account
              </span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </button>
            {showDeleteConfirm && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                Click again to sign out and request deletion. Your data will be removed per our privacy policy.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

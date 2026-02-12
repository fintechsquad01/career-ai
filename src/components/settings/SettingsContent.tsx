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
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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

    setDeleting(true);
    try {
      const res = await fetch("/api/delete-account", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete account");
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Delete account error:", error);
      alert("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      alert("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB.");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const filePath = `${user.id}/resume-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("resumes").upload(filePath, file);

      if (error) throw error;

      // Read text for .txt files; for PDF/DOCX store path only (parsing would need backend)
      let resumeText: string | null = null;
      if (file.type === "text/plain") {
        resumeText = await file.text();
      } else {
        resumeText = "[Uploaded - processing pending]";
      }

      // Upsert career_profile with resume path (and text if available)
      const { data: existing } = await supabase.from("career_profiles").select("id").eq("user_id", user.id).single();
      if (existing) {
        await supabase.from("career_profiles").update({ resume_file_path: filePath, resume_text: resumeText, source: "upload", updated_at: new Date().toISOString() }).eq("user_id", user.id);
      } else {
        await supabase.from("career_profiles").insert({ user_id: user.id, resume_file_path: filePath, resume_text: resumeText, source: "upload" });
      }

      setUploadSuccess(true);
      toast("Resume uploaded!");
      setTimeout(() => setUploadSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
    e.target.value = "";
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
              {careerProfile?.resume_text || careerProfile?.resume_file_path ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-sm text-green-800">
                    {uploadSuccess ? "Resume uploaded!" : "Resume uploaded"}
                  </span>
                  <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      className="sr-only"
                      onChange={handleResumeUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="sr-only"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                  />
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {uploading ? "Uploading..." : "Upload PDF, DOCX, or TXT"}
                  </p>
                </label>
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
            {showDeleteConfirm ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-800 font-medium">Are you sure? This will permanently delete all your data.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? "Deleting..." : "Yes, Delete Everything"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

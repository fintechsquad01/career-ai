"use client";

import { useState, useEffect, useRef } from "react";
import { User, CreditCard, Shield, Upload, Download, Trash2, AlertTriangle, Camera, Eye, EyeOff, Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseFile } from "@/lib/file-parser";
import { toast } from "@/components/shared/Toast";
import type { Profile, CareerProfile, TokenTransaction } from "@/types";
import type { Json } from "@/types/database";

interface SettingsContentProps {
  profile: Profile | null;
  careerProfile: CareerProfile | null;
  transactions: TokenTransaction[];
}

interface NotificationPreferences {
  marketing: boolean;
  product_updates: boolean;
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: CreditCard },
  { id: "privacy", label: "Privacy", icon: Shield },
] as const;

function getNotificationPrefs(profile: Profile | null): NotificationPreferences {
  const prefs = profile?.notification_preferences;
  if (prefs && typeof prefs === "object" && !Array.isArray(prefs)) {
    const obj = prefs as Record<string, unknown>;
    return {
      marketing: typeof obj.marketing === "boolean" ? obj.marketing : true,
      product_updates: typeof obj.product_updates === "boolean" ? obj.product_updates : true,
    };
  }
  return { marketing: true, product_updates: true };
}

export function SettingsContent({ profile, careerProfile, transactions }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [name, setName] = useState(profile?.full_name || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [parsing, setParsing] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(getNotificationPrefs(profile));
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setName(profile?.full_name || "");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile?.full_name, profile?.avatar_url]);

  const handleSave = async () => {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", profile?.id || "");
    if (!error) toast("Profile saved!");
  };

  // --- Avatar Upload ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be less than 2MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      // Upload (upsert to replace existing)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast("Avatar updated!");
      router.refresh();
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
    e.target.value = "";
  };

  // --- Resume Upload with Parsing ---
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("File must be less than 5MB.");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setParsing(false);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const filePath = `${user.id}/resume-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("resumes").upload(filePath, file);
      if (error) throw error;

      // Parse text from all file types using file-parser
      let resumeText: string;
      setParsing(true);
      try {
        const parsed = await parseFile(file);
        resumeText = parsed.text;
      } catch (parseErr) {
        console.warn("File parsing failed, storing path only:", parseErr);
        resumeText = file.type === "text/plain" ? await file.text() : "[Uploaded - parsing failed. Please paste text manually.]";
      }
      setParsing(false);

      // Upsert career_profile
      const { data: existing } = await supabase.from("career_profiles").select("id").eq("user_id", user.id).single();
      const updateData = {
        resume_file_path: filePath,
        resume_text: resumeText,
        source: "upload" as const,
        parsed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        await supabase.from("career_profiles").update(updateData).eq("user_id", user.id);
      } else {
        await supabase.from("career_profiles").insert({ user_id: user.id, ...updateData });
      }

      setUploadSuccess(true);
      toast(resumeText.startsWith("[") ? "Resume uploaded (text extraction incomplete)" : "Resume uploaded and parsed!");
      setTimeout(() => setUploadSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);
      toast("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
      setParsing(false);
    }
    e.target.value = "";
  };

  // --- Password Change ---
  const handlePasswordChange = async () => {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      toast("Password updated successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setPasswordError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  // --- Notification Preferences ---
  const handleNotifToggle = async (key: keyof NotificationPreferences) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setSavingNotifs(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: updated as unknown as Json })
        .eq("id", profile?.id || "");
      if (error) throw error;
      toast("Preferences saved!");
    } catch {
      // Revert on error
      setNotifPrefs(notifPrefs);
      toast("Failed to save preferences");
    } finally {
      setSavingNotifs(false);
    }
  };

  // --- Data Export ---
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

  // --- Delete Account ---
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
      toast("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
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

      {/* ======== Profile tab ======== */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
                    {profile?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                  </div>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="text-sm text-blue-600 font-medium hover:underline disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {avatarUrl ? "Change photo" : "Upload photo"}
                </button>
                <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP — max 2MB</p>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 min-h-[44px]"
              />
            </div>

            {/* Resume Upload with Parsing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
              {careerProfile?.resume_text || careerProfile?.resume_file_path ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div>
                      <span className="text-sm text-green-800">
                        {uploadSuccess
                          ? "Resume uploaded!"
                          : careerProfile.resume_text && !careerProfile.resume_text.startsWith("[")
                            ? "Resume uploaded & parsed"
                            : "Resume uploaded"}
                      </span>
                      {careerProfile.parsed_at && (
                        <p className="text-[10px] text-green-600 mt-0.5">
                          Parsed {new Date(careerProfile.parsed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <label className="text-xs text-blue-600 hover:underline cursor-pointer">
                      {uploading || parsing ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {parsing ? "Parsing..." : "Uploading..."}
                        </span>
                      ) : (
                        "Replace"
                      )}
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        className="sr-only"
                        onChange={handleResumeUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {careerProfile.resume_text?.startsWith("[") && (
                    <p className="text-xs text-amber-600">
                      Text extraction was incomplete. For best results, paste your resume text directly in a tool input.
                    </p>
                  )}
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
                    {uploading ? (parsing ? "Parsing file..." : "Uploading...") : "Upload PDF, DOCX, or TXT"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">We extract text from PDFs and DOCX files automatically</p>
                </label>
              )}
            </div>

            <button onClick={handleSave} className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px]">
              Save Changes
            </button>
          </div>

          {/* Password Change Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-500">Update your password. Only available for email/password accounts.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Re-enter your new password"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {passwordError}
              </p>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px] flex items-center gap-2"
            >
              {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      )}

      {/* ======== Account tab ======== */}
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

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-700">Product updates</p>
                  <p className="text-xs text-gray-400">New tools, features, and improvements</p>
                </div>
                <button
                  onClick={() => handleNotifToggle("product_updates")}
                  disabled={savingNotifs}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifPrefs.product_updates ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      notifPrefs.product_updates ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-700">Marketing emails</p>
                  <p className="text-xs text-gray-400">Tips, career advice, and promotions</p>
                </div>
                <button
                  onClick={() => handleNotifToggle("marketing")}
                  disabled={savingNotifs}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifPrefs.marketing ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      notifPrefs.marketing ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            </div>
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

      {/* ======== Privacy tab ======== */}
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

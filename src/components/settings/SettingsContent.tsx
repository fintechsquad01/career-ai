"use client";

import { useState, useEffect, useRef } from "react";
import { User, CreditCard, Shield, Upload, Download, Trash2, AlertTriangle, Camera, Eye, EyeOff, Bell, Loader2, Briefcase, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseFile } from "@/lib/file-parser";
import { toast } from "@/components/shared/Toast";
import { INDUSTRIES } from "@/lib/constants";
import { useAppStore } from "@/stores/app-store";
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

function parseSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: CreditCard },
  { id: "privacy", label: "Privacy", icon: Shield },
] as const;

const EXPERIENCE_LEVELS = [
  { value: "2", label: "0-2 years" },
  { value: "5", label: "3-5 years" },
  { value: "10", label: "6-10 years" },
  { value: "15", label: "10+ years" },
] as const;

function yearsToExperienceLevel(years: number | null | undefined): string {
  if (years == null) return "";
  if (years <= 2) return "2";
  if (years <= 5) return "5";
  if (years <= 10) return "10";
  return "15";
}

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
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [parsing, setParsing] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(getNotificationPrefs(profile));
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Career profile fields
  const [resumeFilePath, setResumeFilePath] = useState(careerProfile?.resume_file_path || "");
  const [jobTitle, setJobTitle] = useState(careerProfile?.title || "");
  const [company, setCompany] = useState(careerProfile?.company || "");
  const [industry, setIndustry] = useState(careerProfile?.industry || "");
  const [yearsExperience, setYearsExperience] = useState(yearsToExperienceLevel(careerProfile?.years_experience ?? null));
  const [location, setLocation] = useState(careerProfile?.location || "");
  const [linkedinUrl, setLinkedinUrl] = useState(careerProfile?.linkedin_url || "");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>(parseSkills(careerProfile?.skills));
  const [savingCareer, setSavingCareer] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setName(profile?.full_name || "");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile?.full_name, profile?.avatar_url]);

  useEffect(() => {
    setResumeFilePath(careerProfile?.resume_file_path || "");
    setJobTitle(careerProfile?.title || "");
    setCompany(careerProfile?.company || "");
    setIndustry(careerProfile?.industry || "");
    setYearsExperience(yearsToExperienceLevel(careerProfile?.years_experience ?? null));
    setLocation(careerProfile?.location || "");
    setLinkedinUrl(careerProfile?.linkedin_url || "");
    setSkills(parseSkills(careerProfile?.skills));
    setSkillsInput("");
  }, [careerProfile]);

  const handleSave = async () => {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", profile?.id || "");
    if (!error) toast("Profile saved!");
  };

  const handleSaveCareerProfile = async () => {
    setSavingCareer(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const careerData = {
        user_id: user.id,
        title: jobTitle.trim() || null,
        company: company.trim() || null,
        industry: industry || null,
        years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
        location: location.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        skills,
        updated_at: new Date().toISOString(),
      };

      const { data: savedCareer, error } = await supabase
        .from("career_profiles")
        .upsert(careerData, { onConflict: "user_id" })
        .select()
        .single();

      if (savedCareer) {
        useAppStore.getState().setCareerProfile(savedCareer as CareerProfile);
      }
      toast("Career profile saved!");
      router.refresh();
    } catch (err) {
      console.error("Career profile save error:", err);
      toast("Failed to save career profile. Please try again.", "error");
    } finally {
      setSavingCareer(false);
    }
  };

  const handleAddSkill = () => {
    const value = skillsInput.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkillsInput("");
      return;
    }
    setSkills((prev) => [...prev, value].slice(0, 30));
    setSkillsInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
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
    setUploadWarning(null);
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
      let parsedWithWarning = false;
      setParsing(true);
      try {
        const parsed = await parseFile(file);
        if (parsed.quality === "failed") {
          throw new Error("Resume extraction failed: fewer than 50 words were detected.");
        }
        resumeText = parsed.text;
        if (parsed.quality === "partial") {
          parsedWithWarning = true;
          setUploadWarning("Resume uploaded with partial extraction. Paste full text for best results.");
        }
      } catch (parseErr) {
        console.warn("File parsing failed, storing path only:", parseErr);
        setUploadWarning(parseErr instanceof Error ? parseErr.message : "Resume extraction failed. Please paste text manually.");
        resumeText = "";
      }
      setParsing(false);

      // Atomic upsert career_profile
      const { data: saved, error: upsertError } = await supabase
        .from("career_profiles")
        .upsert({
          user_id: user.id,
          resume_file_path: filePath,
          resume_text: resumeText,
          source: "upload" as const,
          parsed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .select()
        .single();
      if (upsertError) throw new Error(`Failed to save resume: ${upsertError.message}`);
      if (saved) useAppStore.getState().setCareerProfile(saved as CareerProfile);

      setResumeFilePath(filePath);
      setUploadSuccess(true);
      toast(parsedWithWarning || !resumeText ? "Resume uploaded with extraction warning" : "Resume uploaded and parsed!");
      setTimeout(() => setUploadSuccess(false), 5000);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      router.refresh();
    } catch (err) {
      console.error("Upload error:", err);
      toast(err instanceof Error ? err.message : "Failed to upload resume. Please try again.");
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
    a.download = "aiskillscore-data.json";
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
                    alt={profile?.full_name ? `${profile.full_name}'s avatar` : "User avatar"}
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
                  aria-label="Upload avatar image"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="settings-email"
                type="email"
                value={profile?.email || ""}
                readOnly
                aria-readonly="true"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 min-h-[44px]"
              />
            </div>

            {/* Resume Upload with Parsing */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">Resume</span>
              {careerProfile?.resume_text || resumeFilePath ? (
                <div className="space-y-2">
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    uploadSuccess
                      ? "bg-green-50 border border-green-200"
                      : uploadWarning || !careerProfile?.resume_text
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-green-50 border border-green-200"
                  }`}>
                    <div>
                      <span className={`text-sm ${
                        uploadSuccess
                          ? "text-green-800"
                          : uploadWarning || !careerProfile?.resume_text
                            ? "text-amber-800"
                            : "text-green-800"
                      }`}>
                        {uploadSuccess
                          ? "Resume saved successfully"
                          : careerProfile?.resume_text
                            ? "Resume uploaded & parsed"
                            : "Resume uploaded (paste text needed)"}
                      </span>
                      {careerProfile?.parsed_at && !uploadSuccess && (
                        <p className={`text-[10px] mt-0.5 ${uploadWarning || !careerProfile.resume_text ? "text-amber-700" : "text-green-600"}`}>
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
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                        className="sr-only"
                        onChange={handleResumeUpload}
                        disabled={uploading}
                        aria-label="Replace resume file"
                      />
                    </label>
                  </div>
                  {!uploadSuccess && (uploadWarning || !careerProfile?.resume_text) && (
                    <p className="text-xs text-amber-700">
                      {uploadWarning || "Text extraction was incomplete. Paste your full resume text directly for reliable analysis."}
                    </p>
                  )}
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="sr-only"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    aria-label="Upload resume file"
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

          {/* Career Profile */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Career Profile</h3>
            </div>
            <p className="text-xs text-gray-500">This data pre-fills your tools and improves analysis accuracy.</p>

            <div>
              <label htmlFor="settings-job-title" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                id="settings-job-title"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer, Marketing Manager"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="settings-company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                id="settings-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Acme Corp"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="settings-industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                id="settings-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px] bg-white"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="settings-experience" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select
                id="settings-experience"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px] bg-white"
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="settings-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                id="settings-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="settings-linkedin" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                id="settings-linkedin"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="settings-skills" className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2">
                <input
                  id="settings-skills"
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Python, SQL, Leadership"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 min-h-[44px]"
                >
                  Add
                </button>
              </div>
              {skills.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100 hover:bg-blue-100"
                      title="Remove skill"
                    >
                      {skill}
                      <span aria-hidden>×</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">Add your top skills to improve Skills Gap and Resume analysis.</p>
              )}
            </div>

            <button
              onClick={handleSaveCareerProfile}
              disabled={savingCareer}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors min-h-[44px] flex items-center gap-2 disabled:opacity-50"
            >
              {savingCareer && <Loader2 className="w-4 h-4 animate-spin" />}
              {savingCareer ? "Saving..." : "Save Career Profile"}
            </button>
          </div>

          {/* Password Change Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-500">Update your password. Only available for email/password accounts.</p>

            <div>
              <label htmlFor="settings-new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  id="settings-new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="At least 8 characters"
                  aria-invalid={!!passwordError}
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
              <label htmlFor="settings-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="settings-confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Re-enter your new password"
                aria-invalid={!!passwordError}
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
              <p className="text-sm text-blue-100 mb-3">$119 for 120 tokens/month forever</p>
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

          {/* Sign Out */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
                router.refresh();
              }}
              className="flex items-center gap-2.5 px-4 py-3 w-full border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              Sign Out
            </button>
          </div>
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

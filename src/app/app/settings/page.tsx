"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Brain,
  Bell,
  Mail,
  Save,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  Users,
  Tag,
  Lock,
  BadgeCheck,
  RotateCcw,
  Key,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { setSession } from "@/lib/session";
import { format } from "date-fns";
import {
  useProfileCheck,
  useProfileUpdate,
  useUploadFile,
  useStudentVerifyStatus,
  useInitiateStudentVerify,
  useConfirmStudentVerify,
  GHANA_UNIVERSITY_DOMAINS,
  type IUpload,
} from "@/hooks";
import { toast } from "sonner";
import { cn, resolveAvatarUrl } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  creator: "Creator",
  moderator: "Moderator",
  super_admin: "Super Admin",
};

// ─── localStorage-backed toggle ───────────────────────────────────────────────

function useLocalToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as boolean) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const toggle = () => {
    setValue((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return [value, toggle] as const;
}

function useLocalSelect(key: string, defaultValue: string) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? stored : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = (next: string) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch {}
  };

  return [value, set] as const;
}

// ─── Weekly digest toggle hook ────────────────────────────────────────────────

function useWeeklyDigest() {
  const queryClient = useQueryClient();

  const { data: enabled = false } = useQuery({
    queryKey: ["notifications", "weeklyDigest"],
    queryFn: async () => {
      const res = await api.get<{ data: { weeklyDigest?: boolean } }>(
        "/users/notifications",
      );
      return res.data.data?.weeklyDigest ?? false;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: setDigest, isPending } = useMutation({
    mutationFn: async (value: boolean) => {
      await api.patch("/users/notifications", { weeklyDigest: value });
    },
    onMutate: async (value) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", "weeklyDigest"],
      });
      const prev = queryClient.getQueryData(["notifications", "weeklyDigest"]);
      queryClient.setQueryData(["notifications", "weeklyDigest"], value);
      return { prev };
    },
    onError: (_err, _value, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(
          ["notifications", "weeklyDigest"],
          context.prev,
        );
      }
      toast.error("Failed to update notification settings");
    },
  });

  return { enabled, setDigest, isPending };
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

type TabKey = "profile" | "verification" | "ai" | "notifications";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "profile";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const { user, updateSession } = useAuth();
  const checkProfile = useProfileCheck();
  const updateProfile = useProfileUpdate();
  const uploadMutation = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [username, setUsername] = useState(user?.username || "");
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedPicture, setUploadedPicture] = useState<IUpload | null>(null);

  // AI & Study Preferences
  const [thinkingMode, toggleThinking] = useLocalToggle(
    "qz_setting_thinking_mode",
    true,
  );
  const [autoTitle, toggleAutoTitle] = useLocalToggle(
    "qz_setting_auto_title",
    true,
  );
  const [defaultMode, setDefaultMode] = useLocalSelect(
    "qz_setting_default_mode",
    "ai",
  );

  // Notifications
  const { enabled: weeklyDigest, setDigest } = useWeeklyDigest();

  // Student Verification State
  const [studentEmailInput, setStudentEmailInput] = useState("");
  const [manualTokenInput, setManualTokenInput] = useState("");
  const [showManualToken, setShowManualToken] = useState(false);
  const { data: verifyStatus, isLoading: isVerifyLoading } =
    useStudentVerifyStatus();
  const initiateVerify = useInitiateStudentVerify();
  const confirmVerify = useConfirmStudentVerify();

  // Username & Password Live Checks
  const {
    mutate: checkMutation,
    isPending: isChecking,
    data: checkData,
  } = useProfileCheck();

  const isUsernameTaken =
    checkData?.username?.exists && username !== user?.username;
  const isPasswordValid = checkData?.password?.valid;

  useEffect(() => {
    if (username && username !== user?.username) {
      const timer = setTimeout(() => {
        checkMutation({ username });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [username, user?.username, checkMutation]);

  useEffect(() => {
    if (currentPassword.length >= 4) {
      const timer = setTimeout(() => {
        checkMutation({ currentPassword });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPassword, checkMutation]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    try {
      const res = await uploadMutation.mutateAsync({ file, folder: "avatars" });
      setUploadedPicture(res);
      toast.success("Avatar uploaded. Save profile to confirm.");
    } catch {
      toast.error("Failed to upload avatar");
      setLocalPreview(null);
    }
  };

  const handleSaveProfile = () => {
    if (newPassword && !currentPassword) {
      toast.error("Current password is required to change password");
      return;
    }
    if (username !== user?.username && isUsernameTaken) {
      toast.error("That username is already taken");
      return;
    }
    if (currentPassword && !isPasswordValid) {
      toast.error("Current password is incorrect");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    updateProfile.mutate(
      {
        username: username !== user?.username ? username : undefined,
        currentPassword: currentPassword || undefined,
        password: newPassword || undefined,
        studentId: studentId,
        profilePicture: uploadedPicture ? uploadedPicture._id : undefined,
      },
      {
        onSuccess: (data: {
          data?: { user?: any; accessToken?: string; refreshToken?: string };
          user?: any;
          accessToken?: string;
          refreshToken?: string;
        }) => {
          toast.success("Profile saved successfully");
          const resData = data.data ?? data;
          if (resData.accessToken && resData.user) {
            setSession(
              resData.user,
              resData.accessToken,
              resData.refreshToken ?? "",
            );
          }
          updateSession();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Failed to update profile",
          );
        },
      },
    );
  };

  const handleStudentVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmailInput.trim()) return;
    try {
      await initiateVerify.mutateAsync(studentEmailInput.trim().toLowerCase());
      toast.success("Verification link sent! Check your university inbox.");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(msg ?? "Failed to send verification email.");
    }
  };

  const handleManualTokenConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTokenInput.trim()) return;
    try {
      await confirmVerify.mutateAsync(manualTokenInput.trim());
      toast.success("Student status verified successfully!");
      setManualTokenInput("");
      setShowManualToken(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Invalid or expired verification token",
      );
    }
  };

  const roleLabel = user?.role
    ? (ROLE_LABELS[user.role] ?? user.role)
    : "Student";
  const avatarSrc =
    localPreview || uploadedPicture?.url || resolveAvatarUrl(user);
  const userInitials = (user?.name || user?.username || "Q")
    .slice(0, 2)
    .toUpperCase();

  const STATUS_CONFIG: Record<
    string,
    { icon: React.ElementType; label: string; bg: string; text: string }
  > = {
    verified: {
      icon: CheckCircle,
      label: "Verified Student",
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
    },
    pending: {
      icon: Clock,
      label: "Verification Sent",
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
    },
    lapsed: {
      icon: XCircle,
      label: "Verification Lapsed",
      bg: "bg-rose-50 border-rose-200",
      text: "text-rose-700",
    },
    revoked: {
      icon: XCircle,
      label: "Verification Revoked",
      bg: "bg-rose-50 border-rose-200",
      text: "text-rose-700",
    },
    none: {
      icon: GraduationCap,
      label: "Not Verified",
      bg: "bg-slate-100 border-slate-200",
      text: "text-slate-600",
    },
  };

  const verifyCfg =
    STATUS_CONFIG[verifyStatus?.status ?? "none"] ??
    STATUS_CONFIG.none;
  const VerifyIcon = verifyCfg.icon;

  const POPULAR_DOMAINS = ["st.ug.edu.gh", "ug.edu.gh", "st.knust.edu.gh", "knust.edu.gh", "ashesi.edu.gh", "ucc.edu.gh"];
  const OTHER_DOMAINS = GHANA_UNIVERSITY_DOMAINS.filter(
    (d) => !POPULAR_DOMAINS.includes(d),
  );

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "verification", label: "Student Verification", icon: GraduationCap },
    { key: "ai", label: "AI & Study", icon: Brain },
    { key: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="qz-app w-full min-h-full bg-[#F7F9FC] text-slate-900 antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-6 pt-8 pb-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-[#0C60FC]">
              Account & Preferences
            </p>
            <h1 className="display mt-2 text-3xl font-bold leading-tight sm:text-4xl text-slate-950">
              Settings.
            </h1>
            <p className="hand mt-1 text-xl text-[#0C60FC]">
              manage your profile, AI & university status ✦
            </p>
          </div>

          {/* Quick status chips */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-700">
              {roleLabel}
            </span>
            <span
              className={cn(
                "rounded-full px-3.5 py-1.5 border flex items-center gap-1.5",
                verifyCfg.bg,
                verifyCfg.text,
              )}
            >
              <VerifyIcon className="size-3.5" />
              <span>{verifyCfg.label}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs — moved lower with generous breathing room */}
        <div className="mx-auto mt-8 pt-2 flex max-w-6xl gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-slate-950 text-white shadow-md"
                    : "bg-white text-slate-600 ring-1 ring-slate-200/90 hover:bg-slate-50",
                )}
              >
                <Icon className="size-3.5" strokeWidth={2.2} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Settings Content */}
      <main className="px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Profile Card Header */}
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative group">
                  <Avatar className="size-24 rounded-3xl border-4 border-slate-100 shadow-md">
                    {avatarSrc ? (
                      <AvatarImage src={avatarSrc} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-[#DFFF61] text-xl font-extrabold text-slate-950">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="absolute -bottom-2 -right-2 size-8 rounded-full bg-[#0C60FC] text-white flex items-center justify-center shadow-md hover:bg-blue-600 active:scale-95 transition cursor-pointer"
                    title="Change profile picture"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-bold text-slate-950">
                      {user?.name || user?.username || "Account User"}
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-[#0C60FC] ring-1 ring-blue-200">
                      {roleLabel}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    {user?.email}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 pt-1">
                    Click the camera icon to upload a personalized avatar
                  </p>
                </div>
              </div>

              {/* Profile Details Form */}
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    Personal Information
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Update your public handle and student identifiers.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400">
                      Name is linked to your authentication account
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400">
                      Primary email for account access
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-700">
                        Username
                      </label>
                      {username !== user?.username && (
                        <span className="text-[10px] font-bold">
                          {isChecking ? (
                            <span className="text-slate-400">Checking…</span>
                          ) : isUsernameTaken ? (
                            <span className="text-rose-500">Taken</span>
                          ) : (
                            <span className="text-emerald-600">Available</span>
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-950 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">
                      Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 10982341"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-950 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Card */}
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                    <Lock className="size-4 text-[#0C60FC]" />
                    <span>Change Password</span>
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Leave blank if you do not wish to update your password.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-950 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-950 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-950 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button Bar */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="flex items-center gap-2 rounded-2xl bg-[#0C60FC] px-8 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-blue-600 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  <span>Save Profile</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: STUDENT VERIFICATION */}
          {activeTab === "verification" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Perk Promo Banner */}
              <div className="rounded-[28px] border border-blue-200 bg-linear-to-r from-blue-50/80 via-white to-blue-50/50 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0C60FC] px-3 py-1 text-[10px] font-extrabold text-white">
                    <GraduationCap className="size-3" />
                    <span>10% Student Discount</span>
                  </span>
                  <h3 className="text-xl font-bold text-slate-950">
                    Verify your university email
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 max-w-lg">
                    Confirm your enrollment with your institutional email address to unlock student pricing and exclusive academic study perks.
                  </p>
                </div>
                <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-blue-100 text-[#0C60FC]">
                  <GraduationCap className="size-8" />
                </div>
              </div>

              {/* Status Card & Interactive Verification Action */}
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-950">
                      Verification Status
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Current student status registered with your account.
                    </p>
                  </div>

                  {isVerifyLoading ? (
                    <Loader2 className="size-4 animate-spin text-slate-400" />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-extrabold shadow-2xs",
                        verifyCfg.bg,
                        verifyCfg.text,
                      )}
                    >
                      <VerifyIcon className="size-4" />
                      <span>{verifyCfg.label}</span>
                    </div>
                  )}
                </div>

                {/* Verified state details */}
                {verifyStatus?.status === "verified" && verifyStatus.studentEmail && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
                      <BadgeCheck className="size-4 text-emerald-600" />
                      <span>Verified as: {verifyStatus.studentEmail}</span>
                    </div>
                    {(verifyStatus.verifiedAt || verifyStatus.expiresAt) && (
                      <p className="text-[11px] font-semibold text-emerald-700">
                        {verifyStatus.verifiedAt && (
                          <>
                            Verified since{" "}
                            {format(new Date(verifyStatus.verifiedAt), "MMMM d, yyyy")}
                          </>
                        )}
                        {verifyStatus.verifiedAt && verifyStatus.expiresAt && " · "}
                        {verifyStatus.expiresAt && (
                          <>
                            Student discount valid until{" "}
                            {format(new Date(verifyStatus.expiresAt), "MMMM d, yyyy")}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Verification lapsed — re-verify CTA */}
                {verifyStatus?.status === "lapsed" && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-rose-900">
                      <XCircle className="size-4 text-rose-600" />
                      <span>Verification Lapsed</span>
                    </div>
                    <p className="text-xs font-semibold text-rose-800">
                      Your student discount paused because the semester ended. Re-verify to reactivate it.
                    </p>
                    {verifyStatus.studentEmail && (
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const email = verifyStatus.studentEmail || "";
                            setStudentEmailInput(email);
                            try {
                              await initiateVerify.mutateAsync(email);
                              toast.success("Verification link sent! Check your university inbox.");
                            } catch (err: unknown) {
                              const msg =
                                err && typeof err === "object" && "response" in err
                                  ? (err as { response?: { data?: { message?: string } } }).response
                                      ?.data?.message
                                  : undefined;
                              toast.error(msg ?? "Failed to send verification email.");
                            }
                          }}
                          disabled={initiateVerify.isPending}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100 px-3.5 py-1.5 text-xs font-bold text-rose-900 hover:bg-rose-200 transition cursor-pointer"
                        >
                          {initiateVerify.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3.5" />
                          )}
                          <span>Re-verify now</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Verification revoked — admin-only, no re-verify CTA */}
                {verifyStatus?.status === "revoked" && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-rose-900">
                      <XCircle className="size-4 text-rose-600" />
                      <span>Verification Revoked</span>
                    </div>
                    <p className="text-xs font-semibold text-rose-800">
                      Student verification was revoked on this account.
                    </p>
                  </div>
                )}

                {/* Verification pending */}
                {verifyStatus?.status === "pending" && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-amber-900 flex items-center gap-2">
                        <Clock className="size-4 text-amber-600" />
                        <span>Verification link sent</span>
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-amber-800">
                      A verification link was sent to <span className="font-bold underline">{verifyStatus.studentEmail}</span>. Click the link in your email to complete verification.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => initiateVerify.mutate(verifyStatus.studentEmail || "")}
                        disabled={initiateVerify.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-200 transition cursor-pointer"
                      >
                        {initiateVerify.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5" />
                        )}
                        <span>Resend Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowManualToken((v) => !v)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 px-3.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 transition cursor-pointer"
                      >
                        <Key className="size-3.5" />
                        <span>Enter Verification Token / Test</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Unverified / Lapsed (no prior email) Verification Form */}
                {(verifyStatus?.status === "none" ||
                  (verifyStatus?.status === "lapsed" && !verifyStatus.studentEmail) ||
                  !verifyStatus) && (
                  <form onSubmit={handleStudentVerifySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700">
                        University Email
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <input
                            type="email"
                            value={studentEmailInput}
                            onChange={(e) => setStudentEmailInput(e.target.value)}
                            placeholder="student@st.ug.edu.gh"
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-xs font-semibold text-slate-950 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100 outline-none transition"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={initiateVerify.isPending || !studentEmailInput.trim()}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#0C60FC] px-6 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-blue-600 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                        >
                          {initiateVerify.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <GraduationCap className="size-4" />
                          )}
                          <span>Send Verification</span>
                        </button>
                      </div>

                      {/* Quick Domain Selector Pills — full GH allowlist */}
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            Popular:
                          </span>
                          {POPULAR_DOMAINS.map((domain) => (
                            <button
                              key={domain}
                              type="button"
                              onClick={() => {
                                const usernamePart = studentEmailInput.split("@")[0] || "student";
                                setStudentEmailInput(`${usernamePart}@${domain}`);
                              }}
                              className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-[#0C60FC] transition cursor-pointer"
                            >
                              @{domain}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            All Ghanaian universities:
                          </span>
                          {OTHER_DOMAINS.map((domain) => (
                            <button
                              key={domain}
                              type="button"
                              onClick={() => {
                                const usernamePart = studentEmailInput.split("@")[0] || "student";
                                setStudentEmailInput(`${usernamePart}@${domain}`);
                              }}
                              className="rounded-lg bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-blue-50 hover:text-[#0C60FC] transition cursor-pointer"
                            >
                              @{domain}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Manual Token Confirmation Dialog / Form */}
                {showManualToken && (
                  <form onSubmit={handleManualTokenConfirm} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">
                        Manual Verification Token
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Paste the verification token received in your email or generated in development
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualTokenInput}
                        onChange={(e) => setManualTokenInput(e.target.value)}
                        placeholder="Paste verification token here…"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-[#0C60FC] outline-none"
                      />
                      <button
                        type="submit"
                        disabled={confirmVerify.isPending || !manualTokenInput.trim()}
                        className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition disabled:opacity-40 cursor-pointer"
                      >
                        {confirmVerify.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: AI & STUDY PREFERENCES */}
          {activeTab === "ai" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    AI Tutor Behavior
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Customize how Z assists you across study sessions and materials.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Thinking Mode */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-slate-950 flex items-center gap-2">
                        <Brain className="size-4 text-[#0C60FC]" />
                        <span>Thinking Mode</span>
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500">
                        Display step-by-step reasoning before each response
                      </p>
                    </div>
                    <Switch checked={thinkingMode} onCheckedChange={toggleThinking} />
                  </div>

                  {/* Auto Title */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-bold text-slate-950 flex items-center gap-2">
                        <Tag className="size-4 text-[#0C60FC]" />
                        <span>Auto-Title Sessions</span>
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500">
                        Automatically name sessions from your initial message
                      </p>
                    </div>
                    <Switch checked={autoTitle} onCheckedChange={toggleAutoTitle} />
                  </div>
                </div>

                {/* Default Session Mode */}
                <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-950 flex items-center gap-2">
                      <Users className="size-4 text-[#0C60FC]" />
                      <span>Default Session Mode</span>
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      Choose whether new study sessions default to AI Tutor or Peer Study
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {(["ai", "peer"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDefaultMode(mode)}
                        className={cn(
                          "rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer",
                          defaultMode === mode
                            ? "bg-[#0C60FC] text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                        )}
                      >
                        {mode === "ai" ? "AI Tutor" : "Peer Study"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    Email & Study Digests
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Control automated summary digests and alerts.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#F7F9FC] p-5">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-950 flex items-center gap-2">
                      <Mail className="size-4 text-[#0C60FC]" />
                      <span>Weekly Study Digest</span>
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      Receive a weekly Monday morning email summarizing your sessions, quiz scores, and retention progress
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={() => setDigest(!weeklyDigest)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

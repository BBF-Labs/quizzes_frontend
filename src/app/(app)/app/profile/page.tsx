"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Shield,
  Save,
  Fingerprint,
  KeyRound,
  LoaderCircle,
  BadgeCheck,
  Camera,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useProfileCheck, useProfileUpdate } from "@/hooks";
import { useUploadFile, IUpload } from "@/hooks";
import { toast } from "sonner";
import { Bell, MessageSquare, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  creator: "Creator",
  moderator: "Moderator",
  super_admin: "Super Admin",
};

export default function ProfilePage() {
  const { user, updateSession } = useAuth();
  const checkProfile = useProfileCheck();
  const updateProfile = useProfileUpdate();

  const [username, setUsername] = useState(user?.username || "");
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedPicture, setUploadedPicture] = useState<IUpload | null>(null);

  // Notification Preferences State
  type NotifChannels = { email: boolean; push: boolean; inApp: boolean };
  type NotifSettings = {
    examReminders: NotifChannels & { reminderIntervals: string[] };
    courseAnnouncements: NotifChannels;
  };

  const [notifSettings, setNotifSettings] = useState<NotifSettings>(user?.notificationSettings || {
    examReminders: { email: true, push: true, inApp: true, reminderIntervals: ["7", "3", "1"] },
    courseAnnouncements: { email: true, push: true, inApp: true },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile();

  const { mutate: checkMutation, isPending: isChecking, data: checkData } = useProfileCheck();

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

  useEffect(() => {
    if (user?.notificationSettings) {
      setNotifSettings(user.notificationSettings);
    }
  }, [user?.notificationSettings]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    try {
      const res = await uploadMutation.mutateAsync({ file, folder: "avatars" });
      setUploadedPicture(res);
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to upload image");
      setLocalPreview(null);
    }
  };

  const handleUpdate = () => {
    if (!currentPassword) {
      toast.error("Current password is required to save changes");
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
        notificationSettings: notifSettings,
      },
      {
        onSuccess: (data: { data?: { accessToken?: string; refreshToken?: string }; accessToken?: string; refreshToken?: string }) => {
          toast.success("Profile updated");
          const resData = data.data ?? data;
          if (resData.accessToken) {
            updateSession(resData.accessToken, resData.refreshToken);
          }
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "Student";
  const avatarSrc = localPreview || uploadedPicture?.url || user?.profilePicture;

  return (
    <div className="space-y-6">
      {/* Page label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.3 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Account / Profile
          </span>
        </div>
        <h1 className="text-2xl font-mono font-bold tracking-[0.15em] uppercase text-foreground">
          My Profile
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase opacity-60">
          Manage your identity and security settings
        </p>
      </motion.div>

      {/* Avatar hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.3, delay: 0.05 }}
        className="border border-border/50 bg-card/40 p-6"
      >
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <Avatar className="size-20 border border-border/50 bg-secondary/20">
              <AvatarImage src={avatarSrc} className="object-cover" />
              <AvatarFallback className="bg-transparent font-mono text-2xl text-primary uppercase">
                {user?.username?.substring(0, 2) || "QZ"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploadMutation.isPending ? (
                <LoaderCircle className="size-4 text-white animate-spin" />
              ) : (
                <Camera className="size-4 text-white" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-mono font-bold uppercase tracking-widest text-foreground truncate">
              {user?.username || "—"}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5 truncate">
              {user?.email || "—"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 border border-primary/30 text-primary uppercase">
                {roleLabel}
              </span>
              {user?.isSubscribed && (
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 border border-green-500/30 text-green-500 uppercase">
                  Pro
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-3 text-green-500" />
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Z Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-3 text-green-500" />
              <span className="text-[9px] font-mono uppercase text-muted-foreground">Unlimited Sessions</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Identity fields */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.3, delay: 0.1 }}
        className="border border-border/50 bg-card/40"
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50">
          <Fingerprint className="size-3.5 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-medium">
            Identity
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email — read only */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
              <Mail className="size-3" /> Email
            </label>
            <div className="h-10 flex items-center px-3 bg-secondary/10 border border-border/40 font-mono text-[11px] text-muted-foreground/50 cursor-not-allowed truncate">
              {user?.email || "—"}
            </div>
          </div>

          {/* Role — read only */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
              <Shield className="size-3" /> Role
            </label>
            <div className="h-10 flex items-center px-3 bg-secondary/10 border border-border/40 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/50 cursor-not-allowed">
              {roleLabel}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Fingerprint className="size-3" /> Username
              </span>
              {username !== user?.username && (
                <span className={cn(
                  "text-[9px] italic lowercase",
                  isChecking ? "text-muted-foreground" : isUsernameTaken ? "text-destructive" : "text-green-500"
                )}>
                  {isChecking
                    ? <LoaderCircle className="size-2 animate-spin inline" />
                    : isUsernameTaken ? "taken" : "available"}
                </span>
              )}
            </label>
            <Input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/\s+/g, "_"))
              }
              placeholder="your_username"
              className={cn(
                "font-mono text-xs h-10 bg-background/50",
                username !== user?.username && !isUsernameTaken && !isChecking && "border-green-500/50 bg-green-500/5",
                username !== user?.username && isUsernameTaken && "border-destructive/50 bg-destructive/5",
              )}
            />
          </div>

          {/* Student ID / Index Number */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
              <BadgeCheck className="size-3" /> Index Number / Student ID
            </label>
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 10987654 or ID-12345"
              className="font-mono text-xs h-10 bg-background/50"
            />
            <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest">
              Used for personalizing your exam timetable and venue assignments.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.3, delay: 0.15 }}
        className="border border-border/50 bg-card/40"
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50">
          <Lock className="size-3.5 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-medium">
            Security
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Current password */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="size-3" /> Current Password
              </span>
              {currentPassword && (
                <span className={cn(
                  "text-[9px] lowercase",
                  isChecking ? "text-muted-foreground" : isPasswordValid ? "text-green-500" : "text-destructive"
                )}>
                  {isChecking
                    ? <LoaderCircle className="size-2 animate-spin inline" />
                    : isPasswordValid ? "verified" : "incorrect"}
                </span>
              )}
            </label>
            <Input
              id="current-password"
              name="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "font-mono text-xs h-10 bg-background/50",
                currentPassword && isPasswordValid && "border-green-500/50 bg-green-500/5",
                currentPassword && currentPassword.length >= 4 && !isChecking && !isPasswordValid && "border-destructive/50 bg-destructive/5",
              )}
            />
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">
              New Password
            </label>
            <Input
              id="new-password"
              name="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="font-mono text-xs h-10 bg-background/50"
            />
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center justify-between">
              <span>Confirm Password</span>
              {confirmPassword && newPassword !== confirmPassword && (
                <span className="text-[9px] lowercase text-destructive">mismatch</span>
              )}
            </label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className={cn(
                "font-mono text-xs h-10 bg-background/50",
                confirmPassword && newPassword === confirmPassword && "border-green-500/50 bg-green-500/5",
                confirmPassword && newPassword !== confirmPassword && "border-destructive/50 bg-destructive/5",
              )}
            />
          </div>
        </div>

        <div className="px-5 pb-4">
          <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            Current password is required for any changes. Leave new password blank to keep existing.
          </p>
        </div>
      </motion.div>

      {/* Communication Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.3, delay: 0.2 }}
        className="border border-border/50 bg-card/40"
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50">
          <Bell className="size-3.5 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-medium">
            Communication
          </span>
        </div>

        <div className="p-5 space-y-6">
          {/* Exam Reminders */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="h-px w-4 bg-primary/30" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Exam Reminders</span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PreferenceToggle 
                  label="Email Alerts"
                  description="Receive 7, 3, and 1-day reminders via email."
                  enabled={notifSettings.examReminders?.email !== false}
                  onToggle={() => setNotifSettings((prev: NotifSettings) => ({
                    ...prev,
                    examReminders: { ...prev.examReminders, email: !prev.examReminders?.email }
                  }))}
                  icon={Mail}
                />
                <PreferenceToggle 
                  label="Push Notifications"
                  description="Get instant reminders on your device."
                  enabled={notifSettings.examReminders?.push !== false}
                  onToggle={() => setNotifSettings((prev: NotifSettings) => ({
                    ...prev,
                    examReminders: { ...prev.examReminders, push: !prev.examReminders?.push }
                  }))}
                  icon={Bell}
                />
             </div>
          </div>

          {/* Timetable Updates */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="h-px w-4 bg-primary/30" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Timetable Shifts</span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PreferenceToggle 
                  label="Email Updates"
                  description="Get notified if a venue or time changes."
                  enabled={notifSettings.courseAnnouncements?.email !== false}
                  onToggle={() => setNotifSettings((prev: NotifSettings) => ({
                    ...prev,
                    courseAnnouncements: { ...prev.courseAnnouncements, email: !prev.courseAnnouncements?.email }
                  }))}
                  icon={MessageSquare}
                />
                <PreferenceToggle 
                  label="Urgent Push"
                  description="Critical alerts for day-of schedule changes."
                  enabled={notifSettings.courseAnnouncements?.push !== false}
                  onToggle={() => setNotifSettings((prev: NotifSettings) => ({
                    ...prev,
                    courseAnnouncements: { ...prev.courseAnnouncements, push: !prev.courseAnnouncements?.push }
                  }))}
                  icon={Bell}
                />
             </div>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.3, delay: 0.25 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleUpdate}
          disabled={
            updateProfile.isPending ||
            Boolean(newPassword && newPassword !== confirmPassword)
          }
          className="font-mono text-xs tracking-[0.15em] uppercase gap-2 h-10 px-10 shadow-[0_0_15px_rgba(0,110,255,0.1)] hover:shadow-[0_0_25px_rgba(0,110,255,0.2)] transition-all"
        >
          {updateProfile.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {updateProfile.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
}

function PreferenceToggle({ 
  label, 
  description, 
  enabled, 
  onToggle, 
  icon: Icon 
}: { 
  label: string; 
  description: string; 
  enabled: boolean; 
  onToggle: () => void;
  icon: any;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex flex-col items-start text-left p-4 border transition-all duration-200 group relative overflow-hidden",
        enabled 
          ? "border-primary/40 bg-primary/5 shadow-[0_0_10px_rgba(0,110,255,0.05)]" 
          : "border-border/40 bg-card/20 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "size-6 flex items-center justify-center border transition-colors duration-200",
          enabled ? "border-primary bg-primary text-white" : "border-border bg-background text-muted-foreground"
        )}>
          {enabled ? <Check className="size-3" /> : <X className="size-3" />}
        </div>
        <div className="flex items-center gap-2">
          <Icon className={cn("size-3.5", enabled ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{label}</span>
        </div>
      </div>
      <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Decorative corner */}
      <div className={cn(
        "absolute top-0 right-0 size-6 border-t border-r transition-colors duration-200",
        enabled ? "border-primary/20" : "border-transparent"
      )} />
    </button>
  );
}

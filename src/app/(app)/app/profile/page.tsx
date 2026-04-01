"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Save,
  Fingerprint,
  KeyRound,
  LoaderCircle,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useProfileCheck, useProfileUpdate } from "@/hooks";
import { useUploadFile, IUpload } from "@/hooks";
import { toast } from "sonner";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedPicture, setUploadedPicture] = useState<IUpload | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile();

  const isChecking = checkProfile.isPending;
  const isUsernameTaken =
    checkProfile.data?.username?.exists && username !== user?.username;
  const isPasswordValid = checkProfile.data?.password?.valid;

  useEffect(() => {
    if (username && username !== user?.username) {
      const timer = setTimeout(() => {
        checkProfile.mutate({ username });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [username, user?.username, checkProfile.mutate]);

  useEffect(() => {
    if (currentPassword.length >= 4) {
      const timer = setTimeout(() => {
        checkProfile.mutate({ currentPassword });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPassword, checkProfile.mutate]);

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
        profilePicture: uploadedPicture ? uploadedPicture._id : undefined,
      },
      {
        onSuccess: (data: any) => {
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.35 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Account
          </span>
        </div>
        <h1 className="text-2xl font-mono font-bold tracking-[0.15em] uppercase text-foreground">
          My Profile
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase opacity-60">
          Manage your identity and security settings
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/40 shadow-none">
            <CardHeader className="border-b border-border/50 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em]">
                    Identity Details
                  </CardTitle>
                </div>
                <div className="px-2 py-0.5 border border-primary/20 bg-primary/5">
                  <span className="text-[8px] font-mono text-primary uppercase">
                    Active Session
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4 shrink-0 mt-2">
                  <Avatar className="size-24 border border-border/50 bg-secondary/20 hover:border-primary/50 transition-colors">
                    <AvatarImage src={avatarSrc} className="object-cover" />
                    <AvatarFallback className="bg-transparent font-mono text-xl text-primary uppercase">
                      {user?.username?.substring(0, 2) || "QZ"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-mono uppercase px-4 w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending
                      ? "Uploading..."
                      : avatarSrc
                        ? "Change Photo"
                        : "Upload Photo"}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Mail className="size-3" /> Email
                    </label>
                    <div className="h-11 flex items-center px-4 bg-secondary/20 border border-border/50 font-mono text-xs text-muted-foreground/60 cursor-not-allowed truncate">
                      {user?.email || "—"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Shield className="size-3" /> Role
                    </label>
                    <div className="h-11 flex items-center px-4 bg-secondary/10 border border-border/30 font-mono text-[11px] uppercase tracking-widest opacity-50">
                      {roleLabel}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="size-3" /> Username
                      </div>
                      {username !== user?.username && (
                        <span className={cn(
                          "text-[9px] italic lowercase",
                          isChecking ? "text-muted-foreground" : isUsernameTaken ? "text-destructive" : "text-green-500"
                        )}>
                          {isChecking ? <LoaderCircle className="size-2 animate-spin inline" /> : isUsernameTaken ? "taken" : "available"}
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
                        "font-mono text-xs h-11 bg-background/50",
                        username !== user?.username && !isUsernameTaken && !isChecking && "border-green-500/50 bg-green-500/5",
                        username !== user?.username && isUsernameTaken && "border-destructive/50 bg-destructive/5",
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="size-3" /> Current Password
                      </div>
                      {currentPassword && (
                        <span className={cn(
                          "text-[9px] lowercase",
                          isChecking ? "text-muted-foreground" : isPasswordValid ? "text-green-500" : "text-destructive"
                        )}>
                          {isChecking ? <LoaderCircle className="size-2 animate-spin inline" /> : isPasswordValid ? "verified" : "incorrect"}
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
                        "font-mono text-xs h-11 bg-background/50",
                        currentPassword && isPasswordValid && "border-green-500/50 bg-green-500/5",
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Password change */}
              <div className="pt-6 border-t border-dashed border-border/50">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-4">
                  Change Password
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      New Password
                    </label>
                    <Input
                      id="new-password"
                      name="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="font-mono text-xs h-11 bg-background/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Confirm Password
                    </label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={cn(
                        "font-mono text-xs h-11 bg-background/50",
                        confirmPassword && newPassword === confirmPassword && "border-green-500/50 bg-green-500/5",
                        confirmPassword && newPassword !== confirmPassword && "border-destructive/50 bg-destructive/5",
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleUpdate}
              disabled={
                updateProfile.isPending ||
                Boolean(newPassword && newPassword !== confirmPassword)
              }
              className="font-mono text-xs tracking-[0.15em] uppercase gap-2 h-11 px-10 shadow-[0_0_15px_rgba(0,110,255,0.1)] hover:shadow-[0_0_25px_rgba(0,110,255,0.2)] transition-all"
            >
              {updateProfile.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {updateProfile.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Account info sidebar */}
        <div className="space-y-6">
          {/* Subscription status */}
          <Card className="border-border/50 bg-card/40 shadow-none">
            <CardHeader className="py-3 border-b border-border/50 bg-secondary/5">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {[
                {
                  label: "Account Type",
                  value: roleLabel,
                },
                {
                  label: "Subscription",
                  value: user?.isSubscribed ? "Active" : "Free Plan",
                  highlight: user?.isSubscribed,
                },
                {
                  label: "Z Memory",
                  value: "Enabled",
                  highlight: true,
                },
                {
                  label: "Session Access",
                  value: "Unlimited",
                  highlight: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border-b border-border/5 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-[9px] font-mono uppercase tracking-tight text-zinc-400">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "text-[8px] font-mono font-bold px-1.5 py-0.5 border uppercase",
                      item.highlight
                        ? "text-green-500 border-green-500/30"
                        : "text-muted-foreground border-border/30",
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info box */}
          <div className="p-5 border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-[10px] font-mono font-bold uppercase">
                Profile Tips
              </span>
            </div>
            <div className="space-y-3 text-[10px] font-mono text-primary/70 uppercase leading-relaxed">
              <p>Your username appears in shared notes and collaborative sessions.</p>
              <div className="pt-3 border-t border-primary/10 space-y-2">
                <p className="flex items-center gap-2 italic">
                  <BadgeCheck className="size-3.5 shrink-0" /> Current password required for any changes
                </p>
                <p className="flex items-center gap-2 italic">
                  <BadgeCheck className="size-3.5 shrink-0" /> Username must be unique across the platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

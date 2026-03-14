"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  User,
  Mail,
  Shield,
  Save,
  Fingerprint,
  BadgeCheck,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useCheckProfile, useUpdateProfile } from "@/hooks/use-admin";
import { useUploadFile, IUpload } from "@/hooks/use-upload";
import { toast } from "sonner";
import { useRef } from "react";

export default function ProfilePage() {
  const { user, isSuperAdmin } = useAuth();
  const checkProfile = useCheckProfile();
  const updateProfile = useUpdateProfile();

  // Unified State
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedPicture, setUploadedPicture] = useState<IUpload | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile();

  // Real-time checks from the hook data
  const isChecking = checkProfile.isPending;
  const isUsernameTaken =
    checkProfile.data?.username?.exists && username !== user?.username;
  const isPasswordValid = checkProfile.data?.password?.valid;

  // Validation Debounce (Username)
  useEffect(() => {
    if (username && username !== user?.username) {
      const timer = setTimeout(() => {
        checkProfile.mutate({ username });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [username, user?.username, checkProfile.mutate]);

  // Validation (Current Password)
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

    // local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    try {
      const res = await uploadMutation.mutateAsync({ file, folder: "avatars" });
      setUploadedPicture(res);
    } catch (error) {
      toast.error("Failed to process image block");
      setLocalPreview(null);
    }
  };

  const handleUpdate = () => {
    if (!currentPassword) {
      toast.error(
        "Standard Security Protocol: Current password required for modification",
      );
      return;
    }
    if (username !== user?.username && isUsernameTaken) {
      toast.error("Username already requested by another node");
      return;
    }
    if (currentPassword && !isPasswordValid) {
      toast.error("Current security password is invalid");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Security password confirmation mismatch");
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
        onSuccess: () => {
          toast.success("Profile synchronized successfully");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  return (
    <div className="space-y-10">
      {/* Header - Aligned with Campaigns Page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.45 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
              Security
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
            Admin Profile
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase opacity-60">
            Node Configuration & Identity Management Layer
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Identity & Security Combined Card */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-none border-border/50 bg-card/40 shadow-none">
            <CardHeader className="border-b border-border/50 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  <CardTitle className="text-[10px] font-mono uppercase tracking-[0.2em]">
                    Core Identity Details
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
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 shrink-0 mt-2">
                  <Avatar className="size-24 border border-border/50 rounded-none bg-secondary/20 hover:border-primary/50 transition-colors">
                    <AvatarImage src={localPreview || uploadedPicture?.url || user?.profilePicture} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-transparent font-mono text-xl text-primary uppercase">
                       {user?.username?.substring(0, 2) || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-mono uppercase rounded-none px-4 w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending
                      ? "Uploading..."
                      : localPreview || uploadedPicture?.url || user?.profilePicture
                        ? "Change Image"
                        : "Upload Image"}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 w-full">
                {/* General Info */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Mail className="size-3" /> Registered Email
                    </label>
                    <div className="h-11 flex items-center px-4 bg-secondary/20 border border-border/50 font-mono text-xs text-muted-foreground/60 cursor-not-allowed uppercase truncate">
                      {user?.email || "internal@qz.engine"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Shield className="size-3" /> Access Permissions
                    </label>
                    <div className="h-11 flex items-center px-4 bg-secondary/10 border border-border/30 font-mono text-[11px] uppercase tracking-widest italic opacity-40">
                      {isSuperAdmin
                        ? "Level 0 // Superadmin"
                        : "Level 1 // Staff"}
                    </div>
                  </div>
                </div>

                {/* Username & Credentials */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="size-3" /> Username
                      </div>
                      {username !== user?.username && (
                        <div className="flex items-center gap-1">
                          {isChecking ? (
                            <LoaderCircle className="size-2 animate-spin" />
                          ) : isUsernameTaken ? (
                            <span className="text-[9px] text-destructive italic lowercase">
                              unavailable
                            </span>
                          ) : (
                            <span className="text-[9px] text-green-500 italic lowercase">
                              available
                            </span>
                          )}
                        </div>
                      )}
                    </label>
                    <Input
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value.toLowerCase().replace(/\s+/g, "_"),
                        )
                      }
                      placeholder="node_alias"
                      className={cn(
                        "rounded-none font-mono text-xs h-11 bg-background/50 transition-colors uppercase",
                        username !== user?.username &&
                          !isUsernameTaken &&
                          !isChecking &&
                          "border-green-500/50 bg-green-500/5",
                        username !== user?.username &&
                          isUsernameTaken &&
                          "border-destructive/50 bg-destructive/5",
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="size-3" /> Current security
                        password
                      </div>
                      {currentPassword && (
                        <div className="flex items-center gap-1">
                          {isChecking ? (
                            <LoaderCircle className="size-2 animate-spin" />
                          ) : isPasswordValid ? (
                            <span className="text-[9px] text-green-500 lowercase">
                              verified
                            </span>
                          ) : (
                            <span className="text-[9px] text-destructive lowercase">
                              invalid
                            </span>
                          )}
                        </div>
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
                        "rounded-none font-mono text-xs h-11 bg-background/50 uppercase",
                        currentPassword &&
                          isPasswordValid &&
                          "border-green-500/50 bg-green-500/5",
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-dashed border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      New security password
                    </label>
                    <Input
                      id="new-password"
                      name="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="SET NEW ACCESS KEY"
                      className="rounded-none font-mono text-xs h-11 bg-background/50 uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Confirm new password
                    </label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="REPEAT NEW ACCESS KEY"
                      className={cn(
                        "rounded-none font-mono text-xs h-11 bg-background/50 uppercase",
                        confirmPassword &&
                          newPassword === confirmPassword &&
                          "border-green-500/50 bg-green-500/5",
                        confirmPassword &&
                          newPassword !== confirmPassword &&
                          "border-destructive/50 bg-destructive/5",
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
              className="rounded-none font-mono text-xs tracking-[0.15em] uppercase gap-2 h-11 px-12 shadow-[0_0_15px_rgba(0,110,255,0.1)] hover:shadow-[0_0_25px_rgba(0,110,255,0.2)] transition-all"
            >
              {updateProfile.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {updateProfile.isPending
                ? "Synchronizing…"
                : "Synchronize Changes"}
            </Button>
          </div>
        </div>

        {/* Protocol & Scopes */}
        <div className="space-y-6">
          <Card className="rounded-none border-border/50 bg-card/40 shadow-none">
            <CardHeader className="py-3 border-b border-border/50 bg-secondary/5">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                Access Scopes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {[
                {
                  label: "Internal Systems",
                  status: "GRANTED",
                  color: "text-green-500",
                },
                {
                  label: "Mailing Engine",
                  status: "GRANTED",
                  color: "text-green-500",
                },
                {
                  label: "Global Database",
                  status: isSuperAdmin ? "GRANTED" : "DENIED",
                  color: isSuperAdmin ? "text-green-500" : "text-destructive",
                },
                {
                  label: "Financial Records",
                  status: isSuperAdmin ? "GRANTED" : "DENIED",
                  color: isSuperAdmin ? "text-green-500" : "text-destructive",
                },
              ].map((scope) => (
                <div
                  key={scope.label}
                  className="flex items-center justify-between border-b border-border/5 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-[9px] font-mono uppercase tracking-tight text-zinc-400">
                    {scope.label}
                  </span>
                  <span
                    className={cn(
                      "text-[8px] font-mono font-bold px-1.5 py-0.5 border uppercase",
                      scope.color === "text-green-500"
                        ? "border-green-500/30"
                        : "border-destructive/30",
                      scope.color,
                    )}
                  >
                    {scope.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="p-5 border border-blue-500/20 bg-blue-500/5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="size-4" />
              <span className="text-[10px] font-mono font-bold uppercase">
                Security Protocol
              </span>
            </div>
            <div className="space-y-4 text-[10px] font-mono text-blue-500/70 uppercase leading-relaxed">
              <p>
                All account modifications are logged and audited. Multi-factor
                authentication is enforced for super-admin level updates.
              </p>
              <div className="pt-3 border-t border-blue-500/10 space-y-2">
                <p className="flex items-center gap-2 italic">
                  <BadgeCheck className="size-3.5" /> Node uniqueness is audited
                </p>
                <p className="flex items-center gap-2 italic">
                  <BadgeCheck className="size-3.5" /> Password updates require
                  verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

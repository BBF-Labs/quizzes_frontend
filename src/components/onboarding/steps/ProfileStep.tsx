"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

interface ProfileStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

export default function ProfileStep({
  onComplete,
  initialData,
}: ProfileStepProps) {
  const { user } = useAuth();
  const [name, setName] = useState(
    (initialData?.name as string) || user?.name || "",
  );
  const [bio, setBio] = useState(
    (initialData?.bio as string) || user?.bio || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    onComplete({ name, bio });
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black tracking-[-0.04em] uppercase leading-tight">
          Let&apos;s start with you.
        </h1>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
          Tell us a bit about yourself.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 sm:space-y-6 w-full min-w-0"
      >
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
            Full Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full min-w-0 rounded-(--radius) font-mono bg-secondary/40 border-border focus-visible:ring-primary/50 h-11"
            placeholder="John Doe"
          />
        </div>
        {/* Bio */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <Label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Bio
            </Label>
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">
              {bio.length}/160
            </span>
          </div>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 160))}
            className="w-full min-w-0 rounded-(--radius) font-mono bg-secondary/40 border-border focus-visible:ring-primary/50 min-h-25 resize-none"
            placeholder="Computer Science student interested in AI and distributed systems..."
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !name}
          className="w-full rounded-(--radius) font-mono text-[11px] sm:text-xs tracking-[0.14em] sm:tracking-[0.2em] uppercase h-12 shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] transition-all"
        >
          {isSubmitting ? "Saving…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}

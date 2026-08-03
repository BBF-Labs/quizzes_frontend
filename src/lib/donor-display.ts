"use client";

import { Activity } from "lucide-react";

/**
 * Donor display helpers — shared between the donate page and the landing-page
 * donation section. The avatar palette mirrors the "Find your study people"
 * crew card so the same visual language reads across both pages.
 */

export const AVATAR_BG = [
  "bg-blue-200",
  "bg-violet-200",
  "bg-orange-200",
  "bg-emerald-200",
  "bg-rose-200",
  "bg-amber-200",
  "bg-sky-200",
] as const;

export function initialsOf(name?: string): string {
  const cleaned = (name ?? "").trim();
  if (!cleaned) return "AN";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "AN";
}

export function pickAvatarBg(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_BG[hash % AVATAR_BG.length];
}

/**
 * Treat anonymous donations, missing names, and the literal "Supporter"
 * placeholder as anonymous — i.e. not named donors worth highlighting in
 * the caption.
 */
export function isAnonymousDonation(name?: string, flagged?: boolean): boolean {
  if (flagged) return true;
  const cleaned = (name ?? "").trim().toLowerCase();
  return cleaned === "" || cleaned === "supporter";
}

export { Activity };

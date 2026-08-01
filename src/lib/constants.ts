// Central application constants & image asset definitions

export const LOGO_SRC = "/images/ba87688d-a946-4230-9f62-be5ec02540cd.png";
export const LANG_SRC = "/images/6051ddd2-acc9-4011-8498-70366ae9494d.png";
export const QUBI_WAVE_SRC = "/images/f6eed6ae-0e8b-4c1c-a516-a4ca787d4963.png";
export const QUBI_STUDY_SRC = "/images/bde53307-b0b5-4351-90ab-effc4618e33e.png";
export const QUBI_PEEK_SRC = "/images/6429cd24-eecd-4fe8-abb8-40d35adae68c.png";
export const QUBI_RUN_SRC = "/images/dcdc0a4b-27e0-4c41-8a13-ee21053d7511.png";
export const ICON_SRC = "/images/3896e786-6e43-4981-90fc-73d652de9bc1.png";

export const ASSET_IMAGES = {
  LOGO: LOGO_SRC,
  LANG: LANG_SRC,
  QUBI_WAVE: QUBI_WAVE_SRC,
  QUBI_STUDY: QUBI_STUDY_SRC,
  QUBI_PEEK: QUBI_PEEK_SRC,
  QUBI_RUN: QUBI_RUN_SRC,
  ICON: ICON_SRC,
} as const;

export const INSTITUTION_OPTIONS = [
  "University of Ghana",
  "KNUST",
  "University of Cape Coast",
  "Ashesi University",
  "GIMPA",
  "UPSA",
  "Other / not listed",
] as const;

export const FEATURE_PILLS = [
  {
    emoji: "🎯",
    tint: "bg-blue-50",
    title: "A clear next step",
    body: "Every time you open Qz",
  },
  {
    emoji: "🧠",
    tint: "bg-[#F5F3FF]",
    title: "Practice that adapts",
    body: "To what you know and forget",
  },
  {
    emoji: "📈",
    tint: "bg-[#F7FEE7]",
    title: "Progress you can trust",
    body: "Mastery, rank and exam readiness",
  },
] as const;

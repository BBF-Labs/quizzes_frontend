export const UI_PREFERENCES_KEY = "qz_ui_preferences";

export type UiPaletteId = "blue" | "violet" | "emerald" | "amber" | "custom";
export type UiFontPreset = "geist" | "system" | "serif" | "mono";

export interface UiCustomColors {
  primary: string;
  accent: string;
  ring: string;
}

export interface UiPreferences {
  radiusRem: number;
  palette: UiPaletteId;
  customColors: UiCustomColors;
  fontPreset: UiFontPreset;
  monoFontPreset: UiFontPreset;
}

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  radiusRem: 1.75,
  palette: "blue",
  customColors: {
    primary: "#0c60fc",
    accent: "#0c60fc",
    ring: "#0c60fc",
  },
  fontPreset: "geist",
  monoFontPreset: "mono",
};

export const UI_PALETTES: Record<UiPaletteId, any> = {
  blue: {},
  violet: {},
  emerald: {},
  amber: {},
  custom: {},
};

export function normalizeUiPreferences(value: unknown): UiPreferences {
  return DEFAULT_UI_PREFERENCES;
}

export function loadUiPreferences(): UiPreferences {
  return DEFAULT_UI_PREFERENCES;
}

export function saveUiPreferences(prefs: UiPreferences) {
  // No-op: UI preferences disabled
}

export function applyUiPreferences(prefs: UiPreferences, target?: HTMLElement) {
  // No-op: UI preferences disabled
}

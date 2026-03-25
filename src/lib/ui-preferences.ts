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

type PaletteTokens = {
  primary: string;
  accent: string;
  ring: string;
  sidebarPrimary: string;
  sidebarRing: string;
};

export const UI_PALETTES: Record<UiPaletteId, PaletteTokens> = {
  blue: {
    primary: "oklch(55.08% 0.24318 261.968)",
    accent: "oklch(55.08% 0.24318 261.968)",
    ring: "oklch(55.08% 0.24318 261.968)",
    sidebarPrimary: "oklch(55.08% 0.24318 261.968)",
    sidebarRing: "oklch(55.08% 0.24318 261.968)",
  },
  violet: {
    primary: "oklch(57% 0.23 300)",
    accent: "oklch(57% 0.23 300)",
    ring: "oklch(57% 0.23 300)",
    sidebarPrimary: "oklch(57% 0.23 300)",
    sidebarRing: "oklch(57% 0.23 300)",
  },
  emerald: {
    primary: "oklch(62% 0.2 157)",
    accent: "oklch(62% 0.2 157)",
    ring: "oklch(62% 0.2 157)",
    sidebarPrimary: "oklch(62% 0.2 157)",
    sidebarRing: "oklch(62% 0.2 157)",
  },
  amber: {
    primary: "oklch(75% 0.17 83)",
    accent: "oklch(75% 0.17 83)",
    ring: "oklch(75% 0.17 83)",
    sidebarPrimary: "oklch(75% 0.17 83)",
    sidebarRing: "oklch(75% 0.17 83)",
  },
  custom: {
    primary: "#006eff",
    accent: "#006eff",
    ring: "#006eff",
    sidebarPrimary: "#006eff",
    sidebarRing: "#006eff",
  },
};

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  radiusRem: 0,
  palette: "blue",
  customColors: {
    primary: "#006eff",
    accent: "#006eff",
    ring: "#006eff",
  },
  fontPreset: "geist",
  monoFontPreset: "mono",
};

const FONT_PRESET_VALUES: Record<UiFontPreset, string> = {
  geist: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  system:
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  serif: "ui-serif, Georgia, Cambria, Times New Roman, serif",
  mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

const MONO_PRESET_VALUES: Record<UiFontPreset, string> = {
  geist:
    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
  system: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  serif: "ui-serif, Georgia, Cambria, Times New Roman, serif",
  mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
};

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{6})$/;

function isValidHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR_REGEX.test(value);
}

function normalizeCustomColors(colors: unknown): UiCustomColors {
  const candidate = (colors as Partial<UiCustomColors> | undefined) ?? {};

  return {
    primary: isValidHexColor(candidate.primary)
      ? candidate.primary
      : DEFAULT_UI_PREFERENCES.customColors.primary,
    accent: isValidHexColor(candidate.accent)
      ? candidate.accent
      : DEFAULT_UI_PREFERENCES.customColors.accent,
    ring: isValidHexColor(candidate.ring)
      ? candidate.ring
      : DEFAULT_UI_PREFERENCES.customColors.ring,
  };
}

function normalizeFontPreset(value: unknown): UiFontPreset {
  if (typeof value === "string" && value in FONT_PRESET_VALUES) {
    return value as UiFontPreset;
  }

  return DEFAULT_UI_PREFERENCES.fontPreset;
}

function normalizeMonoFontPreset(value: unknown): UiFontPreset {
  if (typeof value === "string" && value in MONO_PRESET_VALUES) {
    return value as UiFontPreset;
  }

  return DEFAULT_UI_PREFERENCES.monoFontPreset;
}

export function normalizeUiPreferences(value: unknown): UiPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_UI_PREFERENCES;
  }

  const candidate = value as Partial<UiPreferences>;

  const palette: UiPaletteId =
    typeof candidate.palette === "string" && candidate.palette in UI_PALETTES
      ? (candidate.palette as UiPaletteId)
      : DEFAULT_UI_PREFERENCES.palette;

  const radiusRem =
    typeof candidate.radiusRem === "number" &&
    Number.isFinite(candidate.radiusRem) &&
    candidate.radiusRem >= 0 &&
    candidate.radiusRem <= 2
      ? candidate.radiusRem
      : DEFAULT_UI_PREFERENCES.radiusRem;

  const customColors = normalizeCustomColors(candidate.customColors);
  const fontPreset = normalizeFontPreset(candidate.fontPreset);
  const monoFontPreset = normalizeMonoFontPreset(candidate.monoFontPreset);

  return {
    radiusRem,
    palette,
    customColors,
    fontPreset,
    monoFontPreset,
  };
}

export function loadUiPreferences(): UiPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_UI_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(UI_PREFERENCES_KEY);
    if (!raw) {
      return DEFAULT_UI_PREFERENCES;
    }

    const parsed = normalizeUiPreferences(JSON.parse(raw));

    return parsed;
  } catch {
    return DEFAULT_UI_PREFERENCES;
  }
}

export function saveUiPreferences(prefs: UiPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    UI_PREFERENCES_KEY,
    JSON.stringify(normalizeUiPreferences(prefs)),
  );
}

export function applyUiPreferences(prefs: UiPreferences, target?: HTMLElement) {
  if (typeof document === "undefined") {
    return;
  }

  const root = target ?? document.documentElement;
  const palette =
    prefs.palette === "custom"
      ? {
          primary: prefs.customColors.primary,
          accent: prefs.customColors.accent,
          ring: prefs.customColors.ring,
          sidebarPrimary: prefs.customColors.primary,
          sidebarRing: prefs.customColors.ring,
        }
      : UI_PALETTES[prefs.palette];

  root.setAttribute("data-ui-customized", "true");
  root.style.setProperty("--radius", `${prefs.radiusRem.toFixed(2)}rem`);
  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--ring", palette.ring);
  root.style.setProperty("--sidebar-primary", palette.sidebarPrimary);
  root.style.setProperty("--sidebar-ring", palette.sidebarRing);
  root.style.setProperty("--font-sans", FONT_PRESET_VALUES[prefs.fontPreset]);
  root.style.setProperty(
    "--font-mono",
    MONO_PRESET_VALUES[prefs.monoFontPreset],
  );
}

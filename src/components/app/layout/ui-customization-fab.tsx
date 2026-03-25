"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Settings2, X, Circle, Palette, Type, Sparkles } from "lucide-react";
import tinycolor from "tinycolor2";
import {
  applyUiPreferences,
  DEFAULT_UI_PREFERENCES,
  loadUiPreferences,
  saveUiPreferences,
  type UiFontPreset,
  type UiPaletteId,
  type UiPreferences,
  UI_PALETTES,
} from "@/lib/ui-preferences";
import { useAuth } from "@/contexts/auth-context";
import { useUiPreferences } from "@/hooks";

const PALETTE_OPTIONS: Array<{ id: UiPaletteId; label: string }> = [
  { id: "blue", label: "Neon Blue" },
  { id: "violet", label: "Violet" },
  { id: "emerald", label: "Emerald" },
  { id: "amber", label: "Amber" },
  { id: "custom", label: "Custom" },
];

const FONT_OPTIONS: Array<{ id: UiFontPreset; label: string }> = [
  { id: "geist", label: "Geist" },
  { id: "system", label: "System" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
];

export function UiCustomizationFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uiPrefs, setUiPrefs] = useState<UiPreferences>(DEFAULT_UI_PREFERENCES);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedRemoteForUserRef = useRef<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const { remoteUiPreferences, saveRemoteUiPreferences } = useUiPreferences();

  useEffect(() => {
    const local = loadUiPreferences();
    setUiPrefs(local);
    applyUiPreferences(local);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      hydratedRemoteForUserRef.current = null;
      return;
    }

    if (!remoteUiPreferences) {
      return;
    }

    if (hydratedRemoteForUserRef.current === user.id) {
      return;
    }

    setUiPrefs(remoteUiPreferences);
    saveUiPreferences(remoteUiPreferences);
    applyUiPreferences(remoteUiPreferences);
    hydratedRemoteForUserRef.current = user.id;
  }, [isAuthenticated, user?.id, remoteUiPreferences]);

  const persistPreferences = (next: UiPreferences) => {
    saveUiPreferences(next);

    if (!isAuthenticated) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveRemoteUiPreferences(next);
      } catch {
      } finally {
        setIsSaving(false);
      }
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const selectedPalette = useMemo(
    () =>
      uiPrefs.palette === "custom"
        ? {
            primary: uiPrefs.customColors.primary,
            accent: uiPrefs.customColors.accent,
            ring: uiPrefs.customColors.ring,
          }
        : UI_PALETTES[uiPrefs.palette],
    [
      uiPrefs.customColors.accent,
      uiPrefs.customColors.primary,
      uiPrefs.customColors.ring,
      uiPrefs.palette,
    ],
  );

  const updatePrefs = (next: UiPreferences) => {
    setUiPrefs(next);
    applyUiPreferences(next);
    persistPreferences(next);
  };

  const generateCustomPalette = (
    mode: "analogous" | "complementary" | "triad" | "random",
  ) => {
    const base =
      mode === "random"
        ? tinycolor.random()
        : tinycolor(uiPrefs.customColors.primary || "#006eff");

    let primary = base.toHexString();
    let accent = base.clone().spin(18).saturate(8).toHexString();
    let ring = base.clone().lighten(10).toHexString();

    if (mode === "complementary") {
      accent = base.complement().toHexString();
      ring = base.clone().lighten(8).toHexString();
    }

    if (mode === "triad") {
      const triad = base.triad();
      primary = triad[0].toHexString();
      accent = triad[1].toHexString();
      ring = triad[2].toHexString();
    }

    if (mode === "analogous") {
      const analogous = base.analogous(3);
      primary = analogous[0].toHexString();
      accent = analogous[1].toHexString();
      ring = analogous[2].toHexString();
    }

    updatePrefs({
      ...uiPrefs,
      palette: "custom",
      customColors: { primary, accent, ring },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 z-110 -translate-y-1/2 border border-border/70 bg-card/95 backdrop-blur px-3 py-3 text-foreground hover:border-primary/60 transition-colors rounded-(--radius)"
        aria-label="Open UI customization"
      >
        <Settings2 className="size-4" />
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-115 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-label="Close panel overlay"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-120 h-full w-[92vw] max-w-md border-l border-border/60 bg-background/95 backdrop-blur transition-transform duration-200 rounded-l-(--radius) ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="h-14 border-b border-border/50 px-4 flex items-center justify-between font-sans">
          <div>
            <p className="text-[11px] font-sans uppercase tracking-widest text-primary">
              UI Customization
            </p>
            <p className="text-[10px] font-sans text-muted-foreground mt-0.5">
              {isAuthenticated
                ? isSaving
                  ? "Saving to profile..."
                  : "Saved to your profile"
                : "Saved locally on this device"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updatePrefs(DEFAULT_UI_PREFERENCES)}
              className="border border-border/70 px-2.5 py-2 text-[10px] font-sans uppercase tracking-widest text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors rounded-(--radius)"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="border border-border/70 p-2 hover:border-primary/60 transition-colors rounded-(--radius)"
              aria-label="Close UI customization"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-auto no-scrollbar h-[calc(100%-56px)] font-sans">
          <div className="border border-border/40 bg-card/30 px-4 py-4 rounded-(--radius)">
            <div className="flex gap-3 mb-3">
              <Type className="size-4 text-muted-foreground/70 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-sans font-semibold uppercase tracking-wide">
                  Typography
                </p>
                <p className="text-[11px] font-sans text-muted-foreground mt-0.5">
                  Apply fonts globally across the full interface.
                </p>
              </div>
            </div>

            <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-2">
              Main Font
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {FONT_OPTIONS.map((font) => {
                const isActive = uiPrefs.fontPreset === font.id;

                return (
                  <button
                    key={`main-${font.id}`}
                    type="button"
                    onClick={() =>
                      updatePrefs({ ...uiPrefs, fontPreset: font.id })
                    }
                    className={`border px-3 py-2 text-left text-[10px] font-sans uppercase tracking-widest transition-colors rounded-(--radius) ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    {font.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-2">
              Mono Font
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((font) => {
                const isActive = uiPrefs.monoFontPreset === font.id;

                return (
                  <button
                    key={`mono-${font.id}`}
                    type="button"
                    onClick={() =>
                      updatePrefs({ ...uiPrefs, monoFontPreset: font.id })
                    }
                    className={`border px-3 py-2 text-left text-[10px] font-sans uppercase tracking-widest transition-colors rounded-(--radius) ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    {font.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-border/40 bg-card/30 px-4 py-4 rounded-(--radius)">
            <div className="flex gap-3 mb-3">
              <Circle className="size-4 text-muted-foreground/70 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-sans font-semibold uppercase tracking-wide">
                  Corner Radius
                </p>
                <p className="text-[11px] font-sans text-muted-foreground mt-0.5">
                  Choose how rounded your interface components should be.
                </p>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={uiPrefs.radiusRem}
              onChange={(event) =>
                updatePrefs({
                  ...uiPrefs,
                  radiusRem: Number(event.target.value),
                })
              }
              className="w-full accent-primary"
              aria-label="Corner radius"
            />
            <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mt-2 text-right">
              {uiPrefs.radiusRem.toFixed(2)}rem
            </p>
          </div>

          <div className="border border-border/40 bg-card/30 px-4 py-4 rounded-(--radius)">
            <div className="flex gap-3 mb-3">
              <Palette className="size-4 text-muted-foreground/70 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-sans font-semibold uppercase tracking-wide">
                  Accent Palette
                </p>
                <p className="text-[11px] font-sans text-muted-foreground mt-0.5">
                  Select your preferred primary highlight color.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PALETTE_OPTIONS.map((palette) => {
                const swatch = UI_PALETTES[palette.id];
                const isActive = uiPrefs.palette === palette.id;

                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() =>
                      updatePrefs({ ...uiPrefs, palette: palette.id })
                    }
                    className={`border px-3 py-2 text-left transition-colors rounded-(--radius) ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-sans uppercase tracking-widest">
                        {palette.label}
                      </span>
                      <span
                        className="size-3 border border-border/60"
                        style={{
                          backgroundColor:
                            palette.id === "custom"
                              ? uiPrefs.customColors.primary
                              : swatch.primary,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {uiPrefs.palette === "custom" && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => generateCustomPalette("analogous")}
                    className="border border-border/60 px-2 py-2 text-[10px] font-sans uppercase tracking-widest hover:border-primary/50 transition-colors rounded-(--radius)"
                  >
                    Analogous
                  </button>
                  <button
                    type="button"
                    onClick={() => generateCustomPalette("complementary")}
                    className="border border-border/60 px-2 py-2 text-[10px] font-sans uppercase tracking-widest hover:border-primary/50 transition-colors rounded-(--radius)"
                  >
                    Complement
                  </button>
                  <button
                    type="button"
                    onClick={() => generateCustomPalette("triad")}
                    className="border border-border/60 px-2 py-2 text-[10px] font-sans uppercase tracking-widest hover:border-primary/50 transition-colors rounded-(--radius)"
                  >
                    Triad
                  </button>
                  <button
                    type="button"
                    onClick={() => generateCustomPalette("random")}
                    className="border border-border/60 px-2 py-2 text-[10px] font-sans uppercase tracking-widest hover:border-primary/50 transition-colors flex items-center justify-center gap-1 rounded-(--radius)"
                  >
                    <Sparkles className="size-3" />
                    Random
                  </button>
                </div>

                <label className="flex items-center justify-between border border-border/60 px-3 py-2 rounded-(--radius)">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
                    Primary
                  </span>
                  <input
                    type="color"
                    value={uiPrefs.customColors.primary}
                    onChange={(event) =>
                      updatePrefs({
                        ...uiPrefs,
                        palette: "custom",
                        customColors: {
                          ...uiPrefs.customColors,
                          primary: event.target.value,
                        },
                      })
                    }
                    className="h-7 w-12 cursor-pointer border border-border/60 bg-transparent p-0"
                    aria-label="Custom primary color"
                  />
                </label>

                <label className="flex items-center justify-between border border-border/60 px-3 py-2 rounded-(--radius)">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
                    Accent
                  </span>
                  <input
                    type="color"
                    value={uiPrefs.customColors.accent}
                    onChange={(event) =>
                      updatePrefs({
                        ...uiPrefs,
                        palette: "custom",
                        customColors: {
                          ...uiPrefs.customColors,
                          accent: event.target.value,
                        },
                      })
                    }
                    className="h-7 w-12 cursor-pointer border border-border/60 bg-transparent p-0"
                    aria-label="Custom accent color"
                  />
                </label>

                <label className="flex items-center justify-between border border-border/60 px-3 py-2 rounded-(--radius)">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
                    Focus Ring
                  </span>
                  <input
                    type="color"
                    value={uiPrefs.customColors.ring}
                    onChange={(event) =>
                      updatePrefs({
                        ...uiPrefs,
                        palette: "custom",
                        customColors: {
                          ...uiPrefs.customColors,
                          ring: event.target.value,
                        },
                      })
                    }
                    className="h-7 w-12 cursor-pointer border border-border/60 bg-transparent p-0"
                    aria-label="Custom focus ring color"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="border border-border/40 bg-card/30 px-4 py-4 rounded-(--radius)">
            <p className="text-[12px] font-sans font-semibold uppercase tracking-wide mb-3">
              Preview
            </p>
            <div
              className="border border-border/60 bg-background/50 p-4"
              style={{ borderRadius: `${uiPrefs.radiusRem}rem` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-sans uppercase tracking-widest text-muted-foreground">
                  Sample Card
                </p>
                <span
                  className="px-2 py-1 text-[10px] font-sans uppercase tracking-widest rounded-(--radius)"
                  style={{
                    backgroundColor: selectedPalette.primary,
                    color: "oklch(0.98 0 0)",
                    borderRadius: `${Math.max(uiPrefs.radiusRem - 0.15, 0)}rem`,
                  }}
                >
                  Primary
                </span>
              </div>
              <div
                className="border border-border bg-card px-3 py-2 text-sm"
                style={{
                  borderRadius: `${Math.max(uiPrefs.radiusRem - 0.1, 0)}rem`,
                }}
              >
                This is how cards and controls will look with your current
                style.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

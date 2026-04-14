"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

const THEME_COLORS = {
  dark: "#131b27",
  light: "#f9f9fb",
};

export function PwaThemeColor() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const color =
      THEME_COLORS[(resolvedTheme as keyof typeof THEME_COLORS) ?? "dark"] ??
      THEME_COLORS.dark;
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [resolvedTheme, pathname]);

  return null;
}

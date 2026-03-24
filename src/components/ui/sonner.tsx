"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-none border border-border bg-card text-card-foreground font-mono shadow-[6px_6px_0px_rgba(0,0,0,0.25)] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.06)]",
          title: "text-[11px] font-bold uppercase tracking-widest",
          description: "text-[11px] text-muted-foreground leading-relaxed",
          actionButton:
            "rounded-none border border-border bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3",
          cancelButton:
            "rounded-none border border-border bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-widest px-3",
          closeButton:
            "rounded-none border border-border bg-background text-foreground",
          success: "border-primary/60",
          error: "border-destructive/60 text-destructive",
          warning: "border-yellow-500/60 text-yellow-500",
          info: "border-primary/50",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg":
            "color-mix(in oklab, var(--card) 86%, var(--primary) 14%)",
          "--success-text": "var(--card-foreground)",
          "--success-border":
            "color-mix(in oklab, var(--primary) 60%, var(--border) 40%)",
          "--error-bg":
            "color-mix(in oklab, var(--card) 88%, var(--destructive) 12%)",
          "--error-text": "var(--card-foreground)",
          "--error-border":
            "color-mix(in oklab, var(--destructive) 60%, var(--border) 40%)",
          "--warning-bg":
            "color-mix(in oklab, var(--card) 86%, oklch(0.75 0.16 84) 14%)",
          "--warning-text": "var(--card-foreground)",
          "--warning-border":
            "color-mix(in oklab, oklch(0.75 0.16 84) 60%, var(--border) 40%)",
          "--info-bg":
            "color-mix(in oklab, var(--card) 86%, var(--primary) 14%)",
          "--info-text": "var(--card-foreground)",
          "--info-border":
            "color-mix(in oklab, var(--primary) 55%, var(--border) 45%)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

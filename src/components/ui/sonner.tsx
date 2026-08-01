"use client";

import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertTriangle,
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
            "group toast flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 text-slate-900 shadow-xl backdrop-blur-md px-4 py-3.5 font-sans transition-all",
          title: "text-xs font-bold text-slate-950 leading-tight",
          description: "text-[11px] font-semibold text-slate-500 leading-relaxed mt-0.5",
          actionButton:
            "rounded-xl bg-slate-950 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-[#0C60FC] transition",
          cancelButton:
            "rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition",
          closeButton:
            "rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition",
          success: "!border-emerald-200 !bg-emerald-50/90 !text-emerald-950",
          error: "!border-rose-200 !bg-rose-50/90 !text-rose-950",
          warning: "!border-amber-200 !bg-amber-50/90 !text-amber-950",
          info: "!border-blue-200 !bg-blue-50/90 !text-slate-950",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />,
        info: <Info className="h-4 w-4 shrink-0 text-[#0C60FC]" />,
        warning: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />,
        error: <XCircle className="h-4 w-4 shrink-0 text-rose-600" />,
        loading: <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#0C60FC]" />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#0f172a",
          "--normal-border": "#e2e8f0",
          "--border-radius": "16px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
  category: "waitlist" | "newsletter" | "system";
  type:
    | "update"
    | "promotional"
    | "security"
    | "general"
    | "welcome"
    | "confirmation";
  title: string;
  markdownBody?: string;
  links?: { label: string; url: string }[];
  name?: string;
  themeColor?: string;
  borderRadius?: number;
  className?: string;
}

const typeConfigs = {
  update: {
    label: "STATUS_UPDATE",
    color: "text-[#006eff]",
    border: "border-[#006eff]",
  },
  promotional: {
    label: "ANNOUNCEMENT",
    color: "text-[#006eff]",
    border: "border-[#006eff]",
  },
  security: {
    label: "SECURITY_ALERT",
    color: "text-red-500",
    border: "border-red-500",
  },
  general: {
    label: "GENERAL_INFO",
    color: "text-foreground",
    border: "border-foreground",
  },
  welcome: {
    label: "WELCOME",
    color: "text-[#006eff]",
    border: "border-[#006eff]",
  },
  confirmation: {
    label: "CONFIRMATION",
    color: "text-[#006eff]",
    border: "border-[#006eff]",
  },
};

export function EmailPreview({
  category,
  type,
  title,
  markdownBody,
  links = [],
  name,
  themeColor,
  borderRadius = 0,
  className,
}: EmailPreviewProps) {
  const config = typeConfigs[type] || typeConfigs.update;

  const currentThemeColor = themeColor || "#006eff";
  const radius = `${borderRadius}rem`;

  return (
    <div
      className={cn(
        "bg-[#f8fafc] dark:bg-zinc-950 p-4 sm:p-10 font-mono border border-border/50",
        className,
      )}
    >
      <div 
        className="w-full max-w-150 mx-auto bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.05)]"
        style={{ borderRadius: radius }}
      >
        <div className="p-5 sm:p-8">
          {/* Badge */}
          <div
            className={cn("border px-2 py-1 inline-block mb-6", !themeColor && config.border)}
            style={{ 
              borderColor: themeColor ? currentThemeColor : undefined,
              borderRadius: radius
            }}
          >
            <span
              className={cn(
                "text-[11px] font-mono font-bold tracking-widest uppercase",
                !themeColor && config.color,
              )}
              style={themeColor ? { color: currentThemeColor } : {}}
            >
              {category === "newsletter" ? "NEWSLETTER" : config.label}
            </span>
          </div>

          {/* Heading Block */}
          <div
            className={cn(
              "bg-[#f8fafc] dark:bg-zinc-800/50 border-l-4 p-4 mb-5",
              !themeColor && config.border,
            )}
            style={themeColor ? { borderLeftColor: currentThemeColor } : {}}
          >
            <h1 className="text-[22px] sm:text-[24px] font-black leading-[1.15] m-0 text-black dark:text-white uppercase tracking-tight">
              {title}
            </h1>
          </div>

          <div className="text-[13px] font-bold text-black dark:text-white mb-3 tracking-wide font-mono">
            Greetings{" "}
            <span 
              className={cn(!themeColor && "text-[#006eff]")}
              style={themeColor ? { color: currentThemeColor } : {}}
            >
              {name || "Subscriber"}
            </span>,
          </div>

          <div className="mb-5">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-[14px]
              font-mono
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white
              prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-[1.6]
              prose-a:no-underline hover:prose-a:underline
              prose-strong:text-black dark:prose-strong:text-white
              prose-li:text-zinc-700 dark:prose-li:text-zinc-300
              prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ children, href }) => (
                    <a 
                      href={href}
                      className="underline"
                      style={{ color: currentThemeColor }}
                    >
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-[22px] sm:text-[24px] font-black uppercase tracking-tight mb-2.5 text-black dark:text-white font-mono leading-[1.2]">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-[18px] sm:text-[20px] font-black uppercase tracking-tight mb-2 mt-4 text-black dark:text-white font-mono leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-[16px] sm:text-[17px] font-bold uppercase tracking-wide mb-1.5 mt-3 text-black dark:text-white font-mono leading-[1.3]">
                      {children}
                    </h3>
                  ),
                }}
              >
                {markdownBody || "_No body content generated yet._"}
              </ReactMarkdown>
            </div>
          </div>

          {links && links.length > 0 && (
            <div className="my-5 flex flex-col gap-2.5">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className={cn(
                    "text-white text-[13px] font-mono font-bold text-center block py-3 px-4 tracking-[0.15em] uppercase border-2 border-black dark:border-white/10 hover:translate-x-0.5 hover:translate-y-0.5 transition-transform",
                    !themeColor && "bg-[#006eff]"
                  )}
                  style={{ 
                    backgroundColor: currentThemeColor,
                    borderRadius: radius
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <hr className="border-t border-zinc-200 dark:border-zinc-800 my-5" />

          <div className="text-[10px] leading-relaxed text-zinc-500 mb-4 font-mono">
            <strong className="text-black dark:text-white font-mono uppercase tracking-widest">
              BF LABS // {category.toUpperCase()}
            </strong>
            <br />
            This communication is part of your status updates on the Qz
            platform.
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-col sm:flex-row justify-between gap-3 text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
            <span>
              © {new Date().getFullYear()} BF LABS. ALL RIGHTS RESERVED.
            </span>
            <div className="flex gap-4">
              <span className="underline cursor-pointer">Visit Qz</span>
              <span className="underline cursor-pointer">Unsubscribe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

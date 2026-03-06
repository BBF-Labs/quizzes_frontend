"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface EmailPreviewProps {
  category: "waitlist" | "newsletter" | "system";
  type: "update" | "promotional" | "security" | "general" | "welcome" | "confirmation";
  title: string;
  markdownBody?: string;
  links?: { label: string; url: string }[];
  name?: string;
  className?: string;
}

const typeConfigs = {
  update: { label: "STATUS_UPDATE", color: "text-[#006eff]", border: "border-[#006eff]" },
  promotional: { label: "ANNOUNCEMENT", color: "text-[#006eff]", border: "border-[#006eff]" },
  security: { label: "SECURITY_ALERT", color: "text-red-500", border: "border-red-500" },
  general: { label: "GENERAL_INFO", color: "text-foreground", border: "border-foreground" },
  welcome: { label: "WELCOME", color: "text-[#006eff]", border: "border-[#006eff]" },
  confirmation: { label: "CONFIRMATION", color: "text-[#006eff]", border: "border-[#006eff]" },
};

export function EmailPreview({
  category,
  type,
  title,
  markdownBody,
  links = [],
  name,
  className,
}: EmailPreviewProps) {
  const config = typeConfigs[type] || typeConfigs.update;

  return (
    <div className={cn("bg-[#f8fafc] dark:bg-zinc-950 p-4 sm:p-10 font-sans border border-border/50", className)}>
      <div className="w-full max-w-[1000px] mx-auto bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.05)]">
        <div className="p-6 sm:p-14">
          {/* Badge */}
          <div className={cn("border px-2 py-1 inline-block mb-6", config.border)}>
            <span className={cn("text-[11px] font-mono font-bold tracking-[0.1em] uppercase", config.color)}>
              {category === "newsletter" ? "NEWSLETTER" : config.label}
            </span>
          </div>

          {/* Heading Block */}
          <div className={cn("bg-[#f8fafc] dark:bg-zinc-800/50 border-l-4 p-6 mb-8", config.border)}>
            <h1 className="text-3xl sm:text-5xl font-black leading-[0.9] m-0 text-black dark:text-white uppercase tracking-tighter">
              {title}
            </h1>
          </div>

          <div className="text-base font-bold text-black dark:text-white mb-4 tracking-wide">
            Greetings <span className="text-[#006eff]">{name || "Subscriber"}</span>,
          </div>

          <div className="mb-8">
            <div className="prose prose-sm dark:prose-invert max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white
              prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-[#006eff] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-black dark:prose-strong:text-white
              prose-li:text-zinc-700 dark:prose-li:text-zinc-300
              prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3 mt-6 text-black dark:text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide mb-2 mt-4 text-black dark:text-white">{children}</h3>,
                }}
              >
                {markdownBody || "_No body content generated yet._"}
              </ReactMarkdown>
            </div>
          </div>

          {links && links.length > 0 && (
            <div className="my-8 flex flex-col gap-3">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className="bg-[#006eff] text-white text-sm font-mono font-bold text-center block py-4 px-6 tracking-[0.15em] uppercase border-2 border-black dark:border-white/10 hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <hr className="border-t border-zinc-200 dark:border-zinc-800 my-10" />

          <div className="text-[12px] leading-relaxed text-zinc-500 mb-8">
            <strong className="text-black dark:text-white font-mono uppercase tracking-widest">
              BF LABS // {category.toUpperCase()}
            </strong>
            <br />
            This communication is part of your status updates on the Qz platform.
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>© {new Date().getFullYear()} BF LABS. ALL RIGHTS RESERVED.</span>
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

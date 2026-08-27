"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  FileText,
  BookOpen,
  Map,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "danger" | "accent";
  badge?: string | number;
}

interface FloatingActionLauncherProps {
  items: FloatingActionItem[];
  className?: string;
}

export function FloatingActionLauncher({
  items,
  className,
}: FloatingActionLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative z-50", className)}>
      {/* Floating Main Trigger Icon */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md",
          isOpen
            ? "bg-slate-900 text-white shadow-slate-900/20"
            : "bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 hover:text-slate-950 hover:bg-white shadow-slate-200/50"
        )}
        title={isOpen ? "Close Menu" : "Session Tools"}
        aria-label="Toggle Session Actions"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Cascading Individual Floating Buttons (No Container Background) */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute left-0 top-13 pt-1 flex flex-col gap-2.5 items-start pointer-events-auto">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={{ opacity: 0, x: -16, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -12, scale: 0.9 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.04,
                    type: "spring",
                    stiffness: 380,
                    damping: 24,
                  }}
                  whileHover={{ scale: 1.03, x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer whitespace-nowrap border backdrop-blur-md",
                    item.variant === "danger"
                      ? "bg-rose-50/95 border-rose-200 text-rose-700 hover:bg-rose-100 hover:text-rose-900 shadow-rose-500/10"
                      : item.variant === "accent"
                      ? "bg-blue-50/95 border-blue-200 text-[#0C60FC] hover:bg-blue-100 shadow-blue-500/10"
                      : "bg-white/95 border-slate-200 text-slate-800 hover:bg-slate-50 hover:text-slate-950 shadow-slate-300/40"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-600 border border-slate-200/80">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

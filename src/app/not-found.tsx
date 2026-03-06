"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoveLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] size-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] size-96 bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 space-y-8"
      >
        <div className="space-y-2">
          <motion.div
            animate={{ 
              rotate: [0, -2, 2, -2, 0],
              opacity: [0.3, 1, 0.3, 1, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="flex justify-center mb-6"
          >
            <AlertTriangle className="size-12 text-primary/40" strokeWidth={1} />
          </motion.div>
          <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-foreground/10 select-none">
            404
          </h1>
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-primary font-bold">
            Resource Missing
          </p>
        </div>

        <div className="max-w-sm mx-auto space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed font-mono uppercase tracking-widest bg-secondary/20 border border-border/40 p-3">
            The requested path does not exist or has been moved to another quadrant.
          </p>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary/40 bg-primary/5 text-primary text-[10px] font-mono font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all group"
          >
            <MoveLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
            Return Home
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <span className="text-[9px] font-mono tracking-[0.5em] uppercase text-muted-foreground">
          Qz. // Experimental Study Platform
        </span>
      </div>
    </div>
  );
}

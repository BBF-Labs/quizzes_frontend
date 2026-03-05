"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTA() {
  const scrollToForm = () => {
    document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-24 md:py-32 bg-background border-b border-border/50 flex flex-col items-center justify-center min-h-[60vh] overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Neon glow center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      <div className="container mx-auto px-4 max-w-6xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Ready to Stop Cramming and Start Mastering?
          </h2>
          <p className="text-[15px] text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join the waitlist for private access. Qz is currently in private beta — be first to access AI-powered study tools built around your actual university curriculum.
          </p>
 
          <Button 
            onClick={scrollToForm}
            className="h-14 px-10 rounded-none font-mono text-sm font-bold tracking-[0.1em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,110,255,0.15)] hover:shadow-[0_0_40px_rgba(0,110,255,0.25)] mb-6"
          >
            JOIN WAITLIST
          </Button>
          
          <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest font-bold">
            Limited Spots Available • Waitlist Now Open
          </p>
        </motion.div>
      </div>
    </section>
  );
}

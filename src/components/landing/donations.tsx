"use client";

import { motion } from "framer-motion";
import { DonationWidget } from "./donation-widget";

export function Donations() {
  return (
    <section className="py-24 relative overflow-hidden bg-background border-t border-border/50">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-6">
                KEEP QZ FREE.
              </h2>
              <p className="text-sm md:text-base font-mono text-muted-foreground uppercase tracking-widest leading-relaxed max-w-xl mx-auto lg:mx-0">
                SUPPORT OUR MISSION TO BETTER EDUCATION THROUGH INTELLIGENT
                CAPABILITIES.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:block space-y-4"
            >
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded(--radius)" />
                <span>COVER API COSTS</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded(--radius)" />
                <span>FUND STUDENT ACCESS</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded(--radius)" />
                <span>BUILD BETTER MODELS</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[480px] shrink-0"
          >
            <div className="relative">
              {/* Decorative blocks behind widget */}
              <div className="absolute -inset-1 bg-primary/20 blur-2xl opacity-50 pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none -mt-4 -mr-4 rounded(--radius)">
                <div className="absolute top-0 right-0 w-[2px] h-full bg-primary" />
                <div className="absolute top-0 right-0 w-full h-[2px] bg-primary" />
              </div>
              <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none -mb-4 -ml-4 rounded(--radius)">
                <div className="absolute bottom-0 left-0 w-[2px] h-full bg-primary" />
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
              </div>

              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 p-2 shadow-2xl">
                <DonationWidget />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

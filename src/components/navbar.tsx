"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(11, 16, 26, 0)", "rgba(11, 16, 26, 0.95)"] // Matches dark background
  );

  const backdropBlur = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);
  const borderBottom = useTransform(
    scrollY,
    [0, 50],
    ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.05)"]
  );

  const scrollToHero = () => {
    document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <>
      <motion.header
        style={{ backgroundColor, backdropFilter: backdropBlur, borderBottom }}
        className="fixed top-0 left-0 right-0 z-50 transition-colors"
      >
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          <div className="flex items-end space-x-2">
            <span className="text-xl font-bold tracking-widest text-foreground uppercase leading-none">Qz.</span>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground/60 uppercase leading-none mb-[2px] hidden sm:inline-block">/ BetaForge Labs</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <span className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors uppercase">Features</span>
              <span className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors uppercase">Curriculum</span>
              <span className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors uppercase">Testimonies</span>
            </nav>
            <Button onClick={scrollToHero} variant="outline" className="rounded-none border-border/80 text-xs font-mono tracking-[0.15em] uppercase hover:bg-primary/10 hover:text-primary transition-colors bg-transparent">
              WAITLIST
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[88px] bg-background/95 backdrop-blur-lg border-b border-border z-40 md:hidden pb-6 pt-4 px-4 flex flex-col space-y-4"
          >
            <Button variant="ghost" className="w-full justify-start rounded-none font-mono tracking-widest uppercase">
              Features
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-none font-mono tracking-widest uppercase">
              Curriculum
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-none font-mono tracking-widest uppercase">
              Testimonies
            </Button>
            <Button className="w-full rounded-none font-mono tracking-widest uppercase" onClick={scrollToHero}>
              WAITLIST
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

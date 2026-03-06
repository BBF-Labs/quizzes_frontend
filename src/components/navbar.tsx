"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(var(--navbar-bg), 0)", "rgba(var(--navbar-bg), 0.7)"]
  );

  const backdropBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(16px)"]);
  const borderBottom = useTransform(
    scrollY,
    [0, 100],
    ["1px solid rgba(var(--navbar-border), 0)", "1px solid rgba(var(--navbar-border), 0.1)"]
  );

  const scrollToHero = () => {
    if (pathname !== "/") {
      router.push("/#waitlist-form");
    } else {
      document.getElementById("waitlist-form")?.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <>
      <motion.header
        style={{ backgroundColor, backdropFilter: backdropBlur, borderBottom }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          <Link href="/" className="flex items-end space-x-2 group">
            <span className="text-xl font-bold tracking-widest text-foreground uppercase leading-none group-hover:text-primary transition-colors">Qz.</span>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground/60 uppercase leading-none mb-[2px] hidden sm:inline-block">/ BetaForge Labs</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <span className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors uppercase">Features</span>
              <span className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors uppercase">Curriculum</span>
              <span className="text-xs font-mono font-medium tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors uppercase">Testimonies</span>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                onClick={scrollToHero} 
                variant="outline"
                className="rounded-none border-primary/40 bg-primary/5 text-primary text-xs font-mono tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_15px_rgba(0,110,255,0.1)]"
              >
                WAITLIST
              </Button>
            </div>
          </div>

          {/* Mobile Toggle & ThemeToggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
            <Button 
              variant="outline"
              className="w-full rounded-none border-primary/40 bg-primary/5 text-primary font-mono tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
              onClick={scrollToHero}
            >
              WAITLIST
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

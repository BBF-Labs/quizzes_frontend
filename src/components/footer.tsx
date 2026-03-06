"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useSubscribeNewsletter } from "@/hooks/use-newsletter";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { mutate, isPending } = useSubscribeNewsletter();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    mutate(email, {
      onSuccess: () => {
        setStatus("success");
        setEmail("");
      },
      onError: () => {
        setStatus("error");
      }
    });
  };

  return (
    <footer className="bg-background pt-20 pb-16 border-t border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start">
            <div className="flex items-end space-x-2 mb-6">
              <span className="text-xl font-bold tracking-widest text-foreground uppercase leading-none">Qz.</span>
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground/60 uppercase leading-none mb-[2px]">/ BetaForge Labs</span>
            </div>
            <p className="text-[13px] font-mono text-muted-foreground leading-relaxed max-w-[200px]">
              Providing the infrastructure for disciplined students to excel in their university curriculum.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-bold text-foreground tracking-widest uppercase mb-2">Platform</h4>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">Course Curriculum</Link>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">Study Journal</Link>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">Community Discord</Link>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-bold text-foreground tracking-widest uppercase mb-2">Company</h4>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">Statement of Purpose</Link>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link href="#" className="text-[13px] font-mono text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>

          {/* Column 4: Subscribe */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-bold text-foreground tracking-widest uppercase mb-2">Subscribe</h4>
            <form onSubmit={handleSubscribe} className="flex flex-col w-full mt-2">
              <div className="flex w-full">
                <input 
                  type="email" 
                  placeholder={status === "success" ? "THANK YOU" : "ENTER EMAIL"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  required
                  className="flex-1 bg-secondary/80 border-none text-xs font-mono uppercase px-4 py-3 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded-none disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <ArrowRight className={`w-4 h-4 ${status === "loading" ? "animate-pulse" : ""}`} />
                </button>
              </div>
              {status === "success" && (
                <p className="text-[10px] font-mono text-primary mt-2 uppercase tracking-widest animate-pulse">
                  Check your inbox to confirm
                </p>
              )}
              {status === "error" && (
                <p className="text-[10px] font-mono text-red-500 mt-2 uppercase tracking-widest">
                  Something went wrong. Try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 bg-secondary/30 mt-16">
        <div className="container mx-auto px-4 max-w-6xl h-10 flex items-center overflow-hidden">
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-muted-foreground overflow-x-auto no-scrollbar w-full">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="uppercase tracking-widest text-foreground whitespace-nowrap">System Status: Active</span>
            </div>
            <span className="uppercase tracking-widest whitespace-nowrap"><span className="text-foreground">GPT-4O</span> 0.00 MS</span>
            <span className="uppercase tracking-widest whitespace-nowrap"><span className="text-foreground">CURRICULUM SYNC</span> LIVE</span>
            <span className="uppercase tracking-widest whitespace-nowrap"><span className="text-foreground">DB LOAD</span> 1%</span>
            
            <div className="md:ml-auto uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">
              © {new Date().getFullYear()} <a href="https://bflabs.tech" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">BetaForge Labs</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

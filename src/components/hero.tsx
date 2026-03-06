"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Variants } from "framer-motion";
import confetti from "canvas-confetti";
import { useJoinWaitlist } from "@/hooks/use-waitlist";
import { useUniversities } from "@/hooks/use-universities";
import { ArrowRight } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.8 } },
};

export function Hero() {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0); // 0: Email, 1: Name, 2: University
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    universityId: "",
  });
  const [showUniSelect, setShowUniSelect] = useState(false);

  const { data: universitiesData } = useUniversities();
  const { mutate, isPending, isError, error } = useJoinWaitlist();

  const universities = universitiesData?.data || [];

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Simple validation before moving
    if (step === 0 && !formData.email.includes("@")) return;
    if (step === 1 && formData.name.length < 2) return;
    
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    mutate(formData, {
      onSuccess: () => {
        setSubmitted(true);
        // Trigger neon blue confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#006eff", "#ffffff", "#00c3ff"],
          zIndex: 999
        });
      }
    });
  };

  const filteredUnis = universities.filter((u: any) => 
    u.name.toLowerCase().includes(formData.university.toLowerCase())
  );

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <section className="relative mt-6 pt-8 md:pt-12 lg:pt-16 pb-10 md:pb-16 border-b border-border/50 bg-background overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
      >
        {/* Left col — text content */}
        <div className="flex flex-col items-start text-left w-full">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] sm:text-xs text-primary font-bold uppercase tracking-[0.15em] mb-10 shadow-[0_0_15px_rgba(0,110,255,0.1)]"
          >
            <div className="w-1.5 h-1.5 bg-primary" />
            <span>WAITLIST NOW OPEN</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.04em] text-foreground mb-6 uppercase leading-[0.95] sm:leading-[0.9]"
          >
            Study Smarter.<br />
            Know your rank.<br />
            <span className="text-primary">Master it all.</span>
          </motion.h1>

          <motion.div variants={itemVariants} className="pl-5 border-l-2 border-primary mb-12">
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed font-light">
              Z is your AI study companion — built for university students who want to master their curriculum, ace their exams, and stay ahead of the class without the guesswork.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full max-w-lg scroll-mt-32" id="waitlist-form">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                      {step === 0 ? (
                        <motion.div 
                          key="form-step-0"
                          variants={stepVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex gap-2"
                        >
                          <Input
                            type="email"
                            placeholder="EXAMPLE@MAIL.COM"
                            required
                            autoFocus
                            value={formData.email}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, email: val }));
                            }}
                            className="flex-1 bg-transparent border-border/50 rounded-none uppercase font-mono text-xs placeholder:text-muted-foreground/40 h-14 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary tracking-wider"
                          />
                          <motion.button 
                            type="button" 
                            onClick={() => handleNext()}
                            disabled={!formData.email.includes("@")}
                            whileHover={formData.email.includes("@") ? { scale: 1.05 } : {}}
                            whileTap={formData.email.includes("@") ? { scale: 0.95 } : {}}
                            className="w-14 h-14 rounded-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background flex items-center justify-center transition-all duration-300 disabled:opacity-30 group cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowRight className="w-6 h-6 stroke-[3px] transition-transform duration-300 group-hover:translate-x-1" />
                          </motion.button>
                        </motion.div>
                      ) : step === 1 ? (
                        <motion.div 
                          key="form-step-1"
                          variants={stepVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex gap-2"
                        >
                          <Input
                            type="text"
                            placeholder="FULL NAME"
                            required
                            autoFocus
                            value={formData.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, name: val }));
                            }}
                            className="flex-1 bg-transparent border-border/50 rounded-none uppercase font-mono text-xs placeholder:text-muted-foreground/40 h-14 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary tracking-wider"
                          />
                          <motion.button 
                            type="button"
                            onClick={() => handleNext()}
                            disabled={formData.name.length < 2}
                            whileHover={formData.name.length >= 2 ? { scale: 1.05 } : {}}
                            whileTap={formData.name.length >= 2 ? { scale: 0.95 } : {}}
                            className="w-14 h-14 rounded-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background flex items-center justify-center transition-all duration-300 disabled:opacity-30 group cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowRight className="w-6 h-6 stroke-[3px] transition-transform duration-300 group-hover:translate-x-1" />
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="form-step-2"
                          variants={stepVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex gap-2"
                        >
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              placeholder={isPending ? "SYNCING..." : "UNIVERSITY (SELECT OR TYPE)"}
                              value={isPending ? "" : formData.university}
                              autoFocus
                              disabled={isPending}
                              onFocus={() => setShowUniSelect(true)}
                              onBlur={() => setTimeout(() => setShowUniSelect(false), 200)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({ ...prev, university: val, universityId: "" }));
                              }}
                              className={`w-full bg-transparent border-border/50 rounded-none uppercase font-mono text-xs placeholder:text-muted-foreground/40 h-14 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary tracking-wider ${isPending ? "animate-pulse border-primary/50" : ""}`}
                            />
                            {showUniSelect && !isPending && filteredUnis.length > 0 && (
                              <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border z-50 max-h-48 overflow-y-auto">
                                {filteredUnis.map((uni: any) => (
                                  <div 
                                    key={uni._id || uni.id || uni.name}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        university: uni.name, 
                                        universityId: uni._id || uni.id 
                                      }));
                                      setShowUniSelect(false);
                                    }}
                                    className="px-4 py-3 text-[10px] font-mono hover:bg-primary/10 hover:text-primary cursor-pointer border-b border-border/50 last:border-0 uppercase tracking-wider transition-colors"
                                  >
                                    {uni.name}
                                  </div>
                                ))}
                              </div>
                            )}
                            {isPending && (
                              <div className="absolute inset-0 flex items-center px-4">
                                <span className="text-[10px] font-mono tracking-[0.2em] text-primary animate-pulse">SYNCING DATA...</span>
                              </div>
                            )}
                          </div>
                          <motion.button 
                            type="button"
                            onClick={() => handleNext()}
                            disabled={formData.university.length < 2 || isPending}
                            whileHover={formData.university.length >= 2 && !isPending ? { scale: 1.05 } : {}}
                            whileTap={formData.university.length >= 2 && !isPending ? { scale: 0.95 } : {}}
                            className="w-14 h-14 rounded-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background flex items-center justify-center transition-all duration-300 disabled:opacity-30 group cursor-pointer disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,110,255,0.2)]"
                          >
                            <ArrowRight className="w-6 h-6 stroke-[3px] transition-transform duration-300 group-hover:translate-x-1" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-1 mt-2">
                       {[0, 1, 2].map((i) => (
                         <div 
                           key={`step-dot-${i}`} 
                           className={`h-0.5 transition-all duration-300 ${i <= step ? "bg-primary w-8" : "bg-muted w-4"}`}
                         />
                       ))}
                    </div>

                    {isError && (
                      <p className="text-[10px] font-mono text-red-500 uppercase tracking-wider">
                        {(error as any)?.response?.data?.message || "Something went wrong. Please try again."}
                      </p>
                    )}
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/20 text-primary px-6 py-6 rounded-none font-mono text-sm tracking-wider uppercase font-bold text-center"
                >
                  <div className="text-2xl mb-2 tracking-tighter">ACCESS GRANTED.</div>
                  <p className="mb-4">You're on the list. Z will be in touch when access is available.</p>
                  <div className="text-[10px] p-3 bg-primary/10 border border-primary/20 animate-pulse text-primary/80 font-normal">
                    NOTE: IF YOU DON'T SEE A CONFIRMATION EMAIL, CHECK YOUR SPAM FOLDER OR WAIT A FEW MINUTES.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 sm:gap-10 mt-10 font-mono">
            <div>
              <div className="text-foreground font-bold text-lg sm:text-xl uppercase tracking-wider mb-0.5">100%</div>
              <div className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase">Curriculum Sync</div>
            </div>
            <div className="w-px h-8 bg-border/80" />
            <div>
              <div className="text-foreground font-bold text-lg sm:text-xl uppercase tracking-wider mb-0.5">REAL-TIME</div>
              <div className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase">AI Insights</div>
            </div>
            <div className="w-px h-8 bg-border/80" />
            <div>
              <div className="text-foreground font-bold text-lg sm:text-xl uppercase tracking-wider mb-0.5">0%</div>
              <div className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase">Guesswork</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="hidden lg:block relative w-full h-full"
        >
          <div className="relative w-full h-full min-h-[600px]">
            <Image
              src="/students.png"
              alt="Students studying with Qz"
              fill
              className="object-cover -scale-x-100 translate-x-10"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

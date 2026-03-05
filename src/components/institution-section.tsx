"use client";

import { motion } from "framer-motion";
import { Building2, Shield, GitBranch, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Variants } from "framer-motion";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function InstitutionSection() {
  return (
    <section className="py-20 md:py-32 bg-background border-b border-border/50 flex items-center">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 uppercase">
                System Integration
              </h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                Qz integrates directly with your institution's infrastructure.
              </p>
            </div>
            <div className="text-primary font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              Institution Tools
            </div>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        <motion.div
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full text-left"
         >
           <motion.div variants={itemVariants} className="border border-border/50 bg-card p-8 md:p-10 hover:border-primary transition-colors relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <div className="w-10 h-10 border border-border/80 bg-background flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                 <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground uppercase tracking-widest mb-3">Multi-campus</h3>
              <p className="text-[15px] text-muted-foreground font-light leading-relaxed">Deploy across multiple sub-campuses seamlessly with unified but segregated central governance.</p>
           </motion.div>
           
           <motion.div variants={itemVariants} className="border border-border/50 bg-card p-8 md:p-10 hover:border-primary transition-colors relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <div className="w-10 h-10 border border-border/80 bg-background flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                 <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground uppercase tracking-widest mb-3">Role-based</h3>
              <p className="text-[15px] text-muted-foreground font-light leading-relaxed">Granular permission controls for administrators, faculty leaders, lecturers, and students.</p>
           </motion.div>
 
           <motion.div variants={itemVariants} className="border border-border/50 bg-card p-8 md:p-10 hover:border-primary transition-colors relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <div className="w-10 h-10 border border-border/80 bg-background flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                 <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground uppercase tracking-widest mb-3">Approvals</h3>
              <p className="text-[15px] text-muted-foreground font-light leading-relaxed">Multi-stage content verification and structured sign-off workflows prior to institutional distribution.</p>
           </motion.div>
 
           <motion.div variants={itemVariants} className="border border-border/50 bg-card p-8 md:p-10 hover:border-primary transition-colors relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <div className="w-10 h-10 border border-border/80 bg-background flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                 <Share2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground uppercase tracking-widest mb-3">Resource sharing</h3>
              <p className="text-[15px] text-muted-foreground font-light leading-relaxed">Cross-pollinate top materials automatically across related departments or aligned faculties.</p>
           </motion.div>
         </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-16"
        >
          Are you a university administrator? <a href="#" className="flex items-center justify-center gap-2 mt-2 text-primary hover:text-primary/80 transition-colors font-bold group inline-flex">Get in touch <span className="transform group-hover:translate-x-1 transition-transform">→</span></a>
        </motion.p>
      </div>
    </section>
  );
}

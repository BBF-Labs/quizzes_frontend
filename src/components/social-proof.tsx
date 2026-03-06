"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } },
};

export function SocialProof() {
  return (
    <section className="py-20 md:py-32 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 uppercase">
                Testimonials
              </h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                Real results from real students.
              </p>
            </div>
            <button className="text-primary font-mono text-xs font-bold uppercase tracking-widest hover:text-primary/80 transition-colors flex items-center gap-2">
              View All Reviews <span>→</span>
            </button>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="h-full border border-border/50 bg-card/60 rounded-none hover:border-primary hover:bg-card hover:shadow-[0_0_20px_rgba(var(--navbar-border),0.05)] transition-all duration-300 flex flex-col relative pt-6 group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <CardContent className="p-8 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-primary text-lg">★</span>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Sep 2023</span>
                </div>
                <blockquote className="flex-1 text-[15px] text-muted-foreground mb-8 leading-relaxed font-light">
                  "Z caught that I always struggled with recursion before I even knew it. The curriculum framework stripped all the noise away. It taught me that my edge isn't in guessing, it's in my discipline. I'm finally mastering my courses."
                </blockquote>
                <div className="pt-6 border-t border-border/50 flex items-center gap-4 mt-auto">
                  <div className="w-8 h-8 rounded-none border border-border/80 bg-secondary flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Jonathan D.</h4>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">BSc Computer Science</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full border border-border/50 bg-card/60 rounded-none hover:border-primary hover:bg-card hover:shadow-[0_0_20px_rgba(var(--navbar-border),0.05)] transition-all duration-300 flex flex-col relative pt-6 group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <CardContent className="p-8 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-primary text-lg">★</span>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Oct 2023</span>
                </div>
                <blockquote className="flex-1 text-[15px] text-muted-foreground mb-8 leading-relaxed font-light">
                  "The community here is different. No hype, no shortcuts. Just serious people refining a craft. The focus on stewardship of my study time changed my entire life perspective."
                </blockquote>
                <div className="pt-6 border-t border-border/50 flex items-center gap-4 mt-auto">
                  <div className="w-8 h-8 rounded-none border border-border/80 bg-secondary flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
                    MR
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Marcus R.</h4>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">BSc Electrical Engineering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full border border-border/50 bg-card/60 rounded-none hover:border-primary hover:bg-card hover:shadow-[0_0_20px_rgba(var(--navbar-border),0.05)] transition-all duration-300 flex flex-col relative pt-6 group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <CardContent className="p-8 flex flex-col h-full relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-primary text-lg">★</span>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Aug 2023</span>
                </div>
                <blockquote className="flex-1 text-[15px] text-muted-foreground mb-8 leading-relaxed font-light">
                  "Structured. Authoritative. Necessary. If you need someone to hold your hand, go elsewhere. If you want a platform that systematically forces you to understand your curriculum, this is it."
                </blockquote>
                <div className="pt-6 border-t border-border/50 flex items-center gap-4 mt-auto">
                  <div className="w-8 h-8 rounded-none border border-border/80 bg-secondary flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
                    SK
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Sarah K.</h4>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">MBChB Medicine</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

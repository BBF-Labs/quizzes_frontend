"use client";

import { motion } from "framer-motion";
import { Compass, Youtube, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function RecommendationsPreview() {
  return (
    <section className="py-20 md:py-32 bg-secondary/10 border-b border-border/50 flex items-center">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 uppercase">
                Adaptive Insights
              </h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                Z analyzes your performance to predict what you need to study next.
              </p>
            </div>
            <div className="text-primary font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              AI Recommendations
            </div>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full mx-auto"
        >
          <div className="border border-border/50 bg-card rounded-none overflow-hidden font-mono text-xs">
            <div className="p-4 border-b border-border/50 bg-background/80 flex flex-row items-center gap-4">
              <div className="w-6 h-6 border border-primary/40 bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                Z
              </div>
              <div className="font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-primary block animate-pulse" />
                Task: Recommend Optimal Next Steps
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — Course */}
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <Card className="h-full flex flex-col border-border bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-colors rounded-none">
              <div className="h-2 w-full bg-primary/20"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-border rounded-none">
                    Recommended course
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground">DCIT 301 — Advanced Algorithms</h3>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pb-6">
                <p className="text-[15px] text-muted-foreground mb-6 flex-1 font-light">
                  Based on your strong performance in Sorting and your interest in Complexity.
                </p>
                <Button className="w-full gap-2 group rounded-none" variant="secondary">
                  <span>View Course</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2 — External Resource */}
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <Card className="h-full flex flex-col border-border bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-colors rounded-none">
              <div className="h-2 w-full bg-primary/50"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-border rounded-none">
                    From YouTube
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground line-clamp-2">Big-O Notation Explained — MIT OpenCourseWare</h3>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pb-6">
                <p className="text-[15px] text-primary/80 mb-6 flex-1 font-light leading-relaxed">
                  Matches your weak area: Complexity Analysis.
                </p>
                <Button className="w-full gap-2 group text-primary-foreground hover:bg-primary/90 rounded-none">
                  <span>Watch Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3 — Study Partner */}
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <Card className="h-full flex flex-col border-border bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-colors rounded-none">
              <div className="h-2 w-full bg-primary/80"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-border rounded-none">
                    Study Partner Match
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground">Kwame A.</h3>
                <p className="text-xs text-muted-foreground mt-1">Dept of CS · 91% compatibility</p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pb-6">
                <p className="text-[15px] text-muted-foreground mb-6 flex-1 font-light">
                  Strong in Complexity — your current weak area.
                </p>
                <Button className="w-full gap-2 group rounded-none" variant="outline">
                  <span>Connect</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

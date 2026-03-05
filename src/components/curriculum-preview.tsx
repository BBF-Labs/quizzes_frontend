"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SquareLoader } from "@/components/ui/square-loader";

import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const coreCourses = [
  { code: "DCIT 201", name: "Data Structures", credits: 3, status: "complete" },
  { code: "DCIT 203", name: "Computer Architecture", credits: 3, status: "complete" },
  { code: "DCIT 205", name: "Algorithms", credits: 3, status: "in-progress" },
  { code: "DCIT 207", name: "Operating Systems", credits: 3, status: "pending" },
];

const electives = [
  { code: "MATH 221", name: "Linear Algebra", credits: 2, status: "complete" },
  { code: "MATH 223", name: "Statistics", credits: 2, status: "pending" },
  { code: "DCIT 209", name: "Web Development", credits: 2, status: "pending" },
  { code: "DCIT 211", name: "Mobile Development", credits: 2, status: "pending" },
];

export function CurriculumPreview() {
  return (
    <section className="py-16 md:py-24 border-b border-border/50 bg-secondary/10 flex items-center">
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
                Curriculum Mapping
              </h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest text-[10px] md:text-xs">
                Qz maps to your university's program structure. Nothing goes untracked.
              </p>
            </div>
            <div className="text-primary font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              Course Coverage
            </div>
          </div>
          <div className="h-px w-full bg-border/50" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }}
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
                BSc Computer Science _ Year 2, Semester 1 [UG]
              </div>
            </div>
            <div className="p-6 md:p-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Core Courses</h4>
                <div className="space-y-4 mb-8">
                  {coreCourses.map((course, i) => (
                    <motion.div key={i} variants={itemVariants} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        {course.status === "complete" && (
                          <div className="w-5 h-5 border border-primary bg-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        {course.status === "in-progress" && (
                          <SquareLoader size={20} strokeWidth={2} />
                        )}
                        {course.status === "pending" && (
                          <div className="w-5 h-5 border border-muted-foreground/40 shrink-0" />
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className={`font-mono text-sm ${course.status === "pending" ? "text-muted-foreground" : "font-semibold text-foreground"}`}>
                            {course.code}
                          </span>
                          <span className={`text-[13px] sm:text-sm ${course.status === "pending" ? "text-muted-foreground" : course.status === "in-progress" ? "text-primary font-medium" : "text-foreground"}`}>
                            {course.name} {course.status === "in-progress" && <span className="text-[10px] ml-1 opacity-80 uppercase tracking-widest font-mono">← in progress</span>}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground uppercase">{course.credits} credit hours</span>
                    </motion.div>
                  ))}
                </div>

                <div className="my-6 border-b border-border/50 w-full" />

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Electives <span className="lowercase normal-case font-normal">(pick 2 of 4)</span></h4>
                <div className="space-y-4 mb-8">
                  {electives.map((course, i) => (
                    <motion.div key={i} variants={itemVariants} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        {course.status === "complete" && (
                          <div className="w-5 h-5 border border-primary bg-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        {course.status === "pending" && (
                          <div className="w-5 h-5 border border-muted-foreground/40 shrink-0" />
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className={`font-mono text-sm ${course.status === "pending" ? "text-muted-foreground" : "font-semibold text-foreground"}`}>
                            {course.code}
                          </span>
                          <span className={`text-[13px] sm:text-sm ${course.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                            {course.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground uppercase">{course.credits} cr</span>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4 mt-8">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>12 / 18 credits complete</span>
                    <span className="text-primary font-medium">GPA 3.4</span>
                  </div>
                  <div className="h-2 bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "66%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

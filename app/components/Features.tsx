"use client";

import React from "react";
import { motion } from "framer-motion";
// import { Button } from '@/components/ui/button';
import { Brain, Target, Timer, Trophy, Grid, Zap, Upload } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Lecture-Specific Quizzes",
      description:
        "Practice with questions tailored to your exact lecture content",
    },
    {
      icon: Target,
      title: "Interim Assessments",
      description: "Comprehensive tests to gauge your understanding",
    },
    {
      icon: Timer,
      title: "Custom Timers",
      description: "Set your own pace with customizable quiz durations",
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics",
    },
    {
      icon: Grid,
      title: "Offline Access",
      description: "Study anywhere with downloaded quizzes",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get immediate feedback and explanations",
    },
  ];

  return (
    <section className="bg-gray-950 py-20 px-4 border-b border-gray-800">
      <div className="container mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          What You'll <span className="text-emerald-400">Get</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-emerald-500/50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <feature.icon className="w-10 h-10 text-white mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

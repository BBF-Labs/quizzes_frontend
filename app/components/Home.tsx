"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock,
  Users,
  FileCheck,
  BarChart3,
  Brain,
  Target,
  Timer,
  Trophy,
  Grid,
  Zap,
  Upload,
} from "lucide-react";
import FeaturesSection from "./Features";

const ShareMaterials = () => {
  return (
    <section className="bg-gray-950 py-20 px-4">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Upload className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Have Questions to Share?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Contribute to our quiz database by uploading your own questions.
            Help others learn while earning credits.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
          >
            Upload Questions <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const stats = [
    { icon: BarChart3, value: "95%", label: "Success Rate" },
    { icon: Clock, value: "24/7", label: "Access" },
    { icon: FileCheck, value: "1000+", label: "Quizzes" },
    { icon: Users, value: "50k+", label: "Students" },
  ];

  return (
    <>
      {/* Hero Section - 100vh */}
      <div className="h-screen bg-gray-950 text-white flex flex-col">
        <nav className="container mx-auto px-4 py-4 lg:py-6 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              className="text-gray-300 bg- hover:text-white hidden sm:inline-flex"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hidden sm:inline-flex"
            >
              Pricing
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white text-sm lg:text-base"
            >
              Log In
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-sm lg:text-base">
              Join Now
            </Button>
          </div>
        </nav>

        <main className="flex-1 container mx-auto px-4 flex flex-col justify-center items-center">
          <motion.div
            className="text-center max-w-4xl"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 lg:mb-6">
              Make Your Learning{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                Exceptional
              </span>
            </h1>

            <motion.p
              className="text-gray-400 text-base sm:text-lg md:text-xl mb-8 max-w-3xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Master your courses with lecture-specific quizzes and
              comprehensive assessments. Experience up to 95% improvement in
              exam performance.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-sm sm:text-base"
              >
                Start Learning{" "}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 hover:bg-gray-900 text-sm sm:text-base"
              >
                View Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-3 sm:p-4 lg:p-6 rounded-lg  backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {/* <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mx-auto mb-2 lg:mb-3 text-emerald-400" /> */}
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 bg-gradient-to-r from-emerald-400 to-blue-400 text-transparent bg-clip-text">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </main>

        <div className="h-6 md:h-8 lg:h-10" />
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* Questions Section */}
      <ShareMaterials />
    </>
  );
};

export default LandingPage;

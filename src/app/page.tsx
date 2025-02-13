"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Grid,
  Brain,
  Target,
  Clock,
  Trophy,
  Upload,
} from "lucide-react";
import Link from "next/link";
import {
  QuizCard,
  PricingCard,
  FeatureCard,
  Stat,
  LandingHeader,
} from "@/components";

// Data arrays for mapping
const stats = [
  { number: "95%", label: "Success Rate" },
  { number: "24/7", label: "Access" },
  { number: "1000+", label: "Quizzes" },
  { number: "50k+", label: "Students" },
];

const features = [
  {
    icon: <Brain className="w-10 h-10" />,
    title: "Lecture-Specific Quizzes",
    description:
      "Practice with questions tailored to your exact lecture content",
  },
  {
    icon: <Target className="w-10 h-10" />,
    title: "Interim Assessments",
    description: "Comprehensive tests to gauge your understanding",
  },
  {
    icon: <Clock className="w-10 h-10" />,
    title: "Custom Timers",
    description: "Set your own pace with customizable quiz durations",
  },
  {
    icon: <Trophy className="w-10 h-10" />,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed analytics",
  },
  {
    icon: <Grid className="w-10 h-10" />,
    title: "Offline Access",
    description: "Study anywhere with downloaded quizzes",
  },
  {
    icon: <Brain className="w-10 h-10" />,
    title: "Instant Results",
    description: "Get immediate feedback and explanations",
  },
];

const pricingPlans = [
  {
    title: "Starter",
    price: "Free",
    description: "Perfect for trying out BBF Quizzes",
    features: [
      "2 free quiz accesses",
      "Basic course coverage",
      "24-hour access",
      "Limited features",
    ],
    buttonText: "Get Started",
  },
  {
    title: "Sem",
    price: "₵9.00",
    period: "/month",
    description: "Most popular for serious students",
    features: [
      "Unlimited quiz accesses",
      "Full course coverage",
      "Progress tracking",
      "Custom timers",
      "Offline access",
      "Priority support",
    ],
    buttonText: "Get Sem",
    highlighted: true,
  },
  {
    title: "Quiz Credits",
    price: "₵1.00",
    period: "/100 credits",
    description: "Pay as you go",
    features: [
      "Buy credits as needed",
      "Full feature access",
      "Credits expire when exhausted",
      "Basic support",
    ],
    buttonText: "Buy Credits",
  },
];

const quizzes = [
  {
    title: "Introduction to Economics",
    category: "Economics",
    duration: "45 mins",
    questions: 30,
    completions: 1234,
    id: "",
  },
  {
    title: "Advanced Calculus",
    category: "Mathematics",
    duration: "60 mins",
    questions: 40,
    completions: 856,
    id: "",
  },
  {
    title: "World History: Modern Era",
    category: "History",
    duration: "30 mins",
    questions: 25,
    completions: 2156,
    id: "",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <LandingHeader />

      <main>
        <section className="min-h-screen flex items-center justify-center relative pt-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-7xl font-bold mb-6"
            >
              Make Your Learning{" "}
              <span className="text-gradient-brand">Exceptional</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12"
            >
              Master your courses with lecture-specific quizzes and
              comprehensive assessments. Experience up to 95% improvement in
              exam performance.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/quizzes"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-12 px-4 py-3"
              >
                Start Learning
                <ArrowRight className="ml-2" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <Stat key={index} number={stat.number} label={stat.label} />
              ))}
            </motion.div>
          </div>
        </section>

        <section id="features" className="min-h-screen py-32 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
              What You&apos;ll <span className="text-gradient-brand">Get</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="min-h-screen py-32 relative">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Simple <span className="text-gradient-brand">Pricing</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect plan for your learning journey. All plans
                include access to our core features.
              </p>
            </div>
            <div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {pricingPlans.map((plan, index) => (
                  <PricingCard key={index} {...plan} />
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-12 px-4 py-3 mt-4"
                  href="/packages"
                >
                  View Pricing
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="quizzes" className="py-32 relative">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Available <span className="text-gradient-brand">Quizzes</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore our collection of carefully crafted quizzes designed to
                enhance your learning experience.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {quizzes.map((quiz, index) => (
                <QuizCard key={index} {...quiz} />
              ))}
            </div>
            <div className="w-full items-center flex justify-center mt-6">
              <Link
                href="/quizzes"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-12 px-4 py-3 text-xl w-full md:w-1/4"
              >
                View all
                <ArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        <section
          id="upload"
          className="py-32 relative bg-gradient-to-br from-primary/5 to-secondary/5"
        >
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block p-3 rounded-full bg-primary/10 text-primary mb-8">
                <Upload className="w-8 h-8" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Have Questions to Share?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Contribute to our quiz database by uploading your own questions.
                Help others learn while earning credits.
              </p>
              <Link
                href="/user/quiz/upload"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-12 px-4 py-3 text-xl"
              >
                Upload Question Materials
                <ArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

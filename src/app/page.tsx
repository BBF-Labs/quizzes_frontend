"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Grid,
  Brain,
  Target,
  Clock,
  Trophy,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PricingCard, FeatureCard, Stat, LandingHeader } from "@/components";
import { UGLogo, AshesiLogo, UCCLogo } from "@/assets";

// Carousel slides data
const carouselSlides = [
  {
    id: 1,
    schoolName: "University of Ghana",
    tagline: "Master Your Learning Journey",
    description:
      "Join thousands of students improving their grades with our lecture-specific quizzes and assessments.",
    brandColor: "blue",
    stats: { students: "50k+", courses: "100+" },
    logo: UGLogo,
  },
  {
    id: 2,
    schoolName: "Ashesi University",
    tagline: "Study Smarter, Not Harder",
    description:
      "Get instant feedback, track your progress, and achieve up to 95% improvement in exam performance.",
    brandColor: "maroon",
    stats: { successRate: "95%", quizzes: "1000+" },
    logo: AshesiLogo,
  },
  {
    id: 3,
    schoolName: "UCC",
    tagline: "Your Success Starts Here",
    description:
      "Access comprehensive quizzes anytime, anywhere. Be the first to know when new features launch.",
    brandColor: "gold",
    stats: { access: "24/7", support: "Priority" },
    logo: UCCLogo,
  },
];

// Brand color mappings for the wave gradient
const brandColorMap: Record<string, { start: string; mid: string; end: string; glow: string }> = {
  blue: {
    start: "rgb(37, 99, 235)",    // blue-600
    mid: "rgb(29, 78, 216)",      // blue-700
    end: "rgb(30, 64, 175)",      // blue-800
    glow: "rgb(59, 130, 246)",    // blue-500
  },
  maroon: {
    start: "rgb(157, 23, 77)",    // pink-800
    mid: "rgb(136, 19, 55)",      // rose-900
    end: "rgb(76, 5, 25)",        // darker maroon
    glow: "rgb(190, 24, 93)",     // pink-600
  },
  gold: {
    start: "rgb(234, 179, 8)",    // yellow-500
    mid: "rgb(202, 138, 4)",      // yellow-600
    end: "rgb(161, 98, 7)",       // yellow-700
    glow: "rgb(250, 204, 21)",    // yellow-400
  },
  teal: {
    start: "rgb(20, 184, 166)",   // teal-500
    mid: "rgb(13, 148, 136)",     // teal-600
    end: "rgb(15, 118, 110)",     // teal-700
    glow: "rgb(45, 212, 191)",    // teal-400
  },
};

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
  },
  {
    title: "Advanced Calculus",
    category: "Mathematics",
    duration: "60 mins",
    questions: 40,
    completions: 856,
  },
  {
    title: "World History: Modern Era",
    category: "History",
    duration: "30 mins",
    questions: 25,
    completions: 2156,
  },
];

export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    );
  }, []);

  // Auto-slide every 15 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 15000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  const currentColors = brandColorMap[carouselSlides[currentSlide].brandColor] || brandColorMap.teal;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <LandingHeader />
      {/* Hero Carousel */}
      <main>
        <section className="min-h-screen flex items-center justify-center relative pt-16 lg:pt-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 pt-16 lg:pt-20"
            >
              {/* Diagonal Wavy Background - Top on mobile, Left on desktop */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Mobile: Horizontal wave at top */}
                <svg
                  className="absolute left-0 top-0 w-full h-[100%] lg:hidden"
                  viewBox="0 0 800 500"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id={`waveGradientMobile-${currentSlide}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={currentColors.start} />
                      <stop offset="50%" stopColor={currentColors.mid} />
                      <stop offset="100%" stopColor={currentColors.end} />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M0 0 L800 0 L800 380 Q700 420 600 400 Q480 370 380 420 Q260 480 140 440 Q40 400 0 450 Z"
                    fill={`url(#waveGradientMobile-${currentSlide})`}
                  />
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
                    d="M0 0 L800 0 L800 300 Q650 340 500 320 Q350 300 200 350 Q100 380 0 340 Z"
                    fill="rgba(255,255,255,0.1)"
                  />
                </svg>

                {/* Desktop: Vertical wave on left */}
                <svg
                  className="absolute left-0 top-0 h-full w-2/3 hidden lg:block"
                  viewBox="0 0 600 800"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id={`waveGradient-${currentSlide}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={currentColors.start} />
                      <stop offset="50%" stopColor={currentColors.mid} />
                      <stop offset="100%" stopColor={currentColors.end} />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M0 0 L0 800 L350 800 Q400 700 380 600 Q350 480 420 380 Q500 260 450 140 Q400 40 350 0 Z"
                    fill={`url(#waveGradient-${currentSlide})`}
                  />
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
                    d="M0 100 Q100 200 80 350 Q60 500 120 650 Q180 780 100 800 L0 800 Z"
                    fill="rgba(255,255,255,0.1)"
                  />
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.2 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                    d="M200 0 Q250 100 220 250 Q180 400 250 550 Q320 700 280 800 L200 800 L200 0 Z"
                    fill="rgba(255,255,255,0.08)"
                  />
                </svg>
              </div>

              {/* Content Container */}
              <div className="relative h-full container mx-auto px-4 flex items-start lg:items-center pt-4 lg:pt-0">
                <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 items-center w-full py-2 lg:py-0">
                  {/* Left Side - Info & Waitlist Form (appears first on mobile, first on desktop) */}
                  <div className="z-10 text-white lg:pl-8 order-1 lg:order-1 mt-0">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    >
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                        {carouselSlides[currentSlide].tagline}
                      </h1>
                      <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 lg:mb-8 max-w-lg">
                        {carouselSlides[currentSlide].description}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-6 lg:gap-8 mb-6 lg:mb-8">
                        {Object.entries(carouselSlides[currentSlide].stats).map(
                          ([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-2xl lg:text-3xl font-bold">{value}</div>
                              <div className="text-xs lg:text-sm text-white/70 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Waitlist Form */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 max-w-md">
                        <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3">
                          Join the Waitlist
                        </h3>
                        <p className="text-xs lg:text-sm text-white/80 mb-3 lg:mb-4">
                          Be the first to access new features and exclusive content.
                        </p>
                        <form
                          onSubmit={handleWaitlistSubmit}
                          className="flex flex-col sm:flex-row gap-3"
                        >
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 px-3 lg:px-4 py-2 lg:py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm lg:text-base"
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-white font-semibold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm lg:text-base"
                            style={{ color: currentColors.mid }}
                          >
                            {isSubmitting ? (
                              <div 
                                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" 
                                style={{ borderColor: currentColors.mid, borderTopColor: 'transparent' }}
                              />
                            ) : submitted ? (
                              "Subscribed! ✓"
                            ) : (
                              <>
                                Join Now
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Side - Animated Logo (hidden on mobile, visible on desktop) */}
                  <div className="relative z-10 items-center justify-center order-2 lg:order-2 mt-2 lg:mt-0 hidden lg:flex">
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 50,
                        damping: 20,
                        duration: 1.5,
                      }}
                      className="relative lg:hidden"
                    >
                      {/* Mobile Logo Container */}
                      <div className="relative">
                        <div 
                          className="absolute inset-0 blur-2xl rounded-full scale-125 transition-colors duration-500" 
                          style={{ backgroundColor: `${currentColors.glow}4D` }}
                        />
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-xl">
                          <Image
                            src={carouselSlides[currentSlide].logo}
                            alt={carouselSlides[currentSlide].schoolName}
                            width={120}
                            height={120}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-xl rounded-xl"
                          />
                          <div className="text-center mt-3">
                            <h2 className="text-lg sm:text-xl font-bold text-white">
                              {carouselSlides[currentSlide].schoolName}
                            </h2>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Desktop Logo */}
                    <motion.div
                      initial={{ x: "100vw", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 50,
                        damping: 20,
                        duration: 1.5,
                      }}
                      className="relative hidden lg:block"
                    >
                      {/* Logo Container with Glow Effect */}
                      <div className="relative">
                        <div 
                          className="absolute inset-0 blur-3xl rounded-full scale-150 transition-colors duration-500" 
                          style={{ backgroundColor: `${currentColors.glow}4D` }}
                        />
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
                          <Image
                            src={carouselSlides[currentSlide].logo}
                            alt={carouselSlides[currentSlide].schoolName}
                            width={280}
                            height={280}
                            className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain drop-shadow-2xl rounded-2xl"
                          />
                          <div className="text-center mt-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                              {carouselSlides[currentSlide].schoolName}
                            </h2>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Navigation */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index
                      ? "bg-white scale-125"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Section Below Carousel */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 hidden lg:block"
          >
            <div className="grid grid-cols-4 gap-8 bg-background/80 backdrop-blur-sm rounded-2xl px-8 py-4 border border-border/50">
              {stats.map((stat, index) => (
                <Stat key={index} number={stat.number} label={stat.label} />
              ))}
            </div>
          </motion.div> */}
        </section>

        <section id="features" className="min-h-screen py-32 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
              What You&apos;ll <span className="text-teal-500">Get</span>
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
                Simple <span className="text-teal-500">Pricing</span>
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
                Available <span className="text-teal-500">Quizzes</span>
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

import { BookOpen, Users } from "lucide-react";

function QuizCard({
  title,
  category,
  duration,
  questions,
  completions,
}: {
  title: string;
  category: string;
  duration: string;
  questions: number;
  completions: number;
}) {
  return (
    <Link href={`/quizzes`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
      >
        <div className="aspect-video w-full overflow-hidden bg-teal-500 p-6 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-white text-center group-hover:scale-105 transition-transform duration-300 flex-wrap">
            {title}
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {category}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">
              {duration} mins
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-500 transition-all duration-300">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {questions} questions
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {completions} completions
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-teal-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      </motion.div>
    </Link>
  );
}

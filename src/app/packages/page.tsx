"use client";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Book,
  FileText,
  Zap,
  AlertTriangle,
  Check,
  Sparkles,
  Star,
  ArrowRight,
  Gift,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  LandingHeader,
} from "@/components";
import Link from "next/link";

export default function PackagesPage() {
  const standardPackages = [
    {
      icon: Calendar,
      id: "67ad57ba0628c9cc6546ab27",
      name: "Semester Access",
      price: 9,
      description: "Full access for the entire semester",
      features: ["Unlimited quizzes", "All courses included", "Progress tracking", "Priority support"],
      popular: true,
    },
    {
      icon: Clock,
      id: "67ad57cc0628c9cc6546ab2d",
      name: "Weekly Access",
      price: 4,
      description: "Access for a full week",
      features: ["Unlimited quizzes", "All courses included", "Progress tracking"],
      popular: false,
    },
    {
      icon: Clock,
      id: "67ad57ea0628c9cc6546ab33",
      name: "Daily Access",
      price: 1.5,
      description: "Perfect for quick study sessions",
      features: ["Unlimited quizzes", "All courses included"],
      popular: false,
    },
  ];

  const coursePackages = [
    {
      id: "67ad58830628c9cc6546ab39",
      icon: Book,
      name: "1 Credit Hour",
      price: 2,
      credits: 1,
    },
    {
      id: " 67ad58a00628c9cc6546ab3f",
      icon: Book,
      name: "2 Credit Hours",
      price: 2.5,
      credits: 2,
    },
    {
      id: "67ad58af0628c9cc6546ab45",
      icon: Book,
      name: "3 Credit Hours",
      price: 3,
      credits: 3,
    },
  ];

  const quizPackages = [
    {
      icon: FileText,
      id: "67ad59370628c9cc6546ab57",
      name: "1 Credit Hour Quiz",
      price: 1.5,
      originalPrice: 1.76,
      discount: "15% OFF",
    },
    {
      icon: FileText,
      id: "67ad59250628c9cc6546ab51",
      name: "2 Credit Hours Quiz",
      price: 2.25,
      originalPrice: 2.65,
      discount: "15% OFF",
    },
    {
      icon: FileText,
      id: "67ad58fe0628c9cc6546ab4b",
      name: "3 Credit Hours Quiz",
      price: 2.75,
      originalPrice: 4.23,
      discount: "35% OFF",
    },
    {
      icon: Zap,
      name: "Quiz Trial",
      price: 1,
      description: "Try before commitment",
      trial: true,
    },
    {
      icon: Gift,
      id: "67ad5adf0628c9cc6546ab64",
      name: "Bulk Quiz Purchase",
      price: 5,
      description: "25% OFF when buying 5+ quizzes",
      example: "5 quizzes = ₵5 → ₵3.75",
      bulk: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <LandingHeader />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-16 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-20 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2" />
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-500 text-sm font-semibold mb-4">
                Flexible Pricing
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
                Choose Your <span className="text-teal-600 dark:text-teal-500">Learning Plan</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Affordable packages designed to fit every student&apos;s budget and study needs. Start learning today.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Standard Packages - Featured */}
        <section className="py-16 relative">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                Time-Based Access
              </h2>
              <p className="text-muted-foreground">
                Unlimited access to all quizzes for a set period
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {standardPackages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`relative h-full transition-all duration-300 ${
                    pkg.popular 
                      ? "bg-teal-500 text-white border-teal-500 scale-105 shadow-2xl shadow-teal-500/25" 
                      : "bg-card border-border shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-lg hover:border-teal-500/50"
                  }`}>
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold bg-white text-teal-600 shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                        pkg.popular ? "bg-white/20" : "bg-teal-500/10"
                      }`}>
                        <pkg.icon className={`h-6 w-6 ${pkg.popular ? "text-white" : "text-teal-600 dark:text-teal-500"}`} />
                      </div>
                      <CardTitle className={`text-xl ${pkg.popular ? "text-white" : "text-foreground"}`}>
                        {pkg.name}
                      </CardTitle>
                      <CardDescription className={pkg.popular ? "text-white/80" : "text-muted-foreground"}>
                        {pkg.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className={`pb-6 border-b ${pkg.popular ? "border-white/20" : "border-border"}`}>
                        <span className={`text-4xl font-bold ${pkg.popular ? "text-white" : "text-teal-600 dark:text-teal-500"}`}>
                          ₵{pkg.price}
                        </span>
                      </div>
                      
                      <ul className="space-y-3">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <div className={`rounded-full p-1 ${pkg.popular ? "bg-white/20" : "bg-teal-500/10"}`}>
                              <Check className={`w-3 h-3 ${pkg.popular ? "text-white" : "text-teal-600 dark:text-teal-500"}`} />
                            </div>
                            <span className={`text-sm ${pkg.popular ? "text-white/90" : "text-muted-foreground"}`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <Link href={`/user/pay?amount=${pkg.price}&id=${pkg.id}`} className="block">
                        <Button className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                          pkg.popular 
                            ? "bg-white text-teal-600 hover:bg-white/90" 
                            : "bg-teal-500 text-white hover:bg-teal-600"
                        }`}>
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Course-Based Packages */}
        <section className="py-16 bg-muted/30 dark:bg-zinc-900/30">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                Course-Based Packages
              </h2>
              <p className="text-muted-foreground">
                Pay per course based on credit hours
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {coursePackages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-lg hover:border-teal-500/50 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10 group-hover:bg-teal-500 transition-colors duration-300">
                          <pkg.icon className="h-6 w-6 text-teal-600 dark:text-teal-500 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(pkg.credits)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2">{pkg.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">Full course access by credit hours</p>
                      
                      <div className="flex items-end justify-between pt-4 border-t border-border">
                        <div>
                          <span className="text-3xl font-bold text-teal-600 dark:text-teal-500">₵{pkg.price}</span>
                          <span className="text-muted-foreground text-sm ml-1">/course</span>
                        </div>
                        <Link href={`/user/pay?amount=${pkg.price}&id=${pkg.id}`}>
                          <Button variant="outline" className="border-teal-500 text-teal-600 dark:text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300">
                            Select
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quiz Participation Packages */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-3 text-foreground">
                Quiz Credits
              </h2>
              <p className="text-muted-foreground">
                Pay-per-quiz options with special discounts
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizPackages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`h-full transition-all duration-300 ${
                    pkg.bulk 
                      ? "bg-teal-500/5 border-teal-500/30 hover:border-teal-500" 
                      : pkg.trial 
                        ? "bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500"
                        : "bg-card border-border hover:border-teal-500/50"
                  } shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-lg`}>
                    <CardContent className="p-6">
                      {pkg.discount && (
                        <span className="inline-block px-2 py-1 rounded-full bg-teal-500 text-white text-xs font-semibold mb-3">
                          {pkg.discount}
                        </span>
                      )}
                      {pkg.trial && (
                        <span className="inline-block px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold mb-3">
                          Try First
                        </span>
                      )}
                      {pkg.bulk && (
                        <span className="inline-block px-2 py-1 rounded-full bg-teal-500 text-white text-xs font-semibold mb-3">
                          Best Value
                        </span>
                      )}
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                          pkg.bulk ? "bg-teal-500/20" : pkg.trial ? "bg-yellow-500/20" : "bg-teal-500/10"
                        }`}>
                          <pkg.icon className={`h-5 w-5 ${
                            pkg.bulk ? "text-teal-600 dark:text-teal-500" : pkg.trial ? "text-yellow-600 dark:text-yellow-500" : "text-teal-600 dark:text-teal-500"
                          }`} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-teal-600 dark:text-teal-500">₵{pkg.price}</span>
                          {pkg.originalPrice && (
                            <span className="text-muted-foreground line-through text-sm">₵{pkg.originalPrice}</span>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="text-muted-foreground text-sm mt-2">{pkg.description}</p>
                        )}
                        {pkg.example && (
                          <p className="text-teal-600 dark:text-teal-500 text-sm mt-2 font-medium">{pkg.example}</p>
                        )}
                      </div>
                      
                      <Link href={`/user/pay?amount=${pkg.price}&id=${pkg.id}&type=credits`} className="block">
                        <Button className={`w-full transition-all duration-300 ${
                          pkg.bulk 
                            ? "bg-teal-500 text-white hover:bg-teal-600" 
                            : pkg.trial 
                              ? "bg-yellow-500 text-white hover:bg-yellow-600"
                              : "bg-teal-500 text-white hover:bg-teal-600"
                        }`}>
                          Purchase
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Alert className="bg-yellow-500/10 border-yellow-500/50">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <AlertTitle className="text-yellow-700 dark:text-yellow-500 font-semibold">Important Note</AlertTitle>
                <AlertDescription className="text-yellow-700/80 dark:text-yellow-500/80">
                  Quiz credit packages are consumed upon use and not saved to your account. 
                  Time-based and course-based packages save your access for future use.
                </AlertDescription>
              </Alert>
            </motion.div>
          </div>
        </section>

        {/* Bonus Section */}
        <section className="py-16 bg-muted/30 dark:bg-zinc-900/30">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card border-border overflow-hidden relative">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                
                <CardContent className="p-8 md:p-12 relative">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <Gift className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        Active Participant Discount
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Earn exclusive discounts by actively participating in quizzes and contributing to our community. 
                        The more you learn, the more you save!
                      </p>
                      <Link href="/quizzes">
                        <Button className="bg-teal-500 text-white hover:bg-teal-600">
                          Start Earning Rewards
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Footer spacer */}
        <div className="h-16" />
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import OtherPackagesPage from "../components/OtherPackages";
import { motion, AnimatePresence } from "framer-motion";

interface Package {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
  timeFrame: string;
  access: string;
}

const mockPackages: Package[] = [
  {
    id: "1",
    name: "Semester Access",
    price: 9,
    duration: "6 months",
    timeFrame: "/semester",
    description: "Perfect for dedicated students",
    access: "Full semester",
    features: [
      "Full semester access",
      "All course materials",
      "Progress tracking",
      "Basic support",
      "Study materials download",
    ],
  },
  {
    id: "2",
    name: "Pro Weekly",
    price: 4,
    duration: "7 days",
    timeFrame: "/week",
    description: "Most popular for exam prep",
    access: "7-day full",
    popular: true,
    features: [
      "7-day full access",
      "All course materials",
      "Progress tracking",
      "Priority support",
      "Custom study plans",
      "Live tutoring sessions",
    ],
  },
  {
    id: "3",
    name: "Daily Pass",
    price: 1.5,
    duration: "24 hours",
    timeFrame: "/day",
    description: "Perfect for quick review",
    access: "24-hour",
    features: [
      "24-hour access",
      "All course materials",
      "Basic features",
      "Standard support",
      "Quick assessments",
    ],
  },
];

const PackagesPage = () => {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showOtherPlans, setShowOtherPlans] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setPackages(mockPackages);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    // Navigate to payment page
    router.push(`/payment/${packageId}`);
  };

  const handleShowOtherPlans = () => {
    setShowOtherPlans(true);
    // Smooth scroll to other plans section
    setTimeout(() => {
      const otherPlansSection = document.getElementById("other-plans");
      if (otherPlansSection) {
        window.scrollTo({
          top: otherPlansSection.offsetTop - 90,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen py-12 bg-gray-950">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Select a package that best fits your learning journey. All plans
            include access to our core features.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto"
        >
          {loading
            ? [...Array(3)].map((_, i) => (
                <Card key={i} className="relative">
                  <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-1/3 mb-4" />
                    <div className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            : packages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: pkg.popular ? 1.02 : 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`relative h-full ${
                      pkg.popular
                        ? "border-blue-500 shadow-lg scale-105"
                        : "hover:shadow-md"
                    } ${
                      selectedPackage === pkg.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    {/* ... (rest of the card content remains the same) ... */}
                    {pkg.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 to-blue-600">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">
                        {pkg.name}
                      </CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{pkg.price}</span>
                        <span className="text-gray-500 ml-2">
                          cedis{pkg.timeFrame}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-teal-500" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleSelectPackage(pkg.id)}
                        className={`w-full ${
                          pkg.popular
                            ? "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                            : ""
                        }`}
                      >
                        Select Plan
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleShowOtherPlans}
          className="mx-auto block mt-12 text-center py-4 underline hover:text-blue-500 transition-colors"
        >
          See Other Plans
        </motion.button>

        <AnimatePresence>
          {showOtherPlans && (
            <motion.div
              id="other-plans"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <OtherPackagesPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PackagesPage;

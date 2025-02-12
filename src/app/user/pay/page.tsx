"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Check } from "lucide-react";
import {
  Card,
  Button,
  Input,
  Label,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components";

const standardPackages = [
  {
    id: "semester",
    name: "Semester Access",
    price: 9,
    period: "/semester",
    description: "Perfect for dedicated students",
    features: [
      "Full semester access",
      "All course materials",
      "Progress tracking",
      "Basic support",
    ],
  },
  {
    id: "weekly",
    name: "Pro Weekly",
    price: 4,
    period: "/week",
    description: "Most popular for exam prep",
    features: [
      "7-day full access",
      "All course materials",
      "Progress tracking",
      "Priority support",
      "Custom study plans",
    ],
    highlighted: true,
  },
  {
    id: "daily",
    name: "Daily Pass",
    price: 1.5,
    period: "/day",
    description: "Perfect for quick review",
    features: [
      "24-hour access",
      "All course materials",
      "Basic features",
      "Standard support",
    ],
  },
];

export default function PayPage() {
  const [selectedPackage, setSelectedPackage] = useState("");
  const [email, setEmail] = useState("");

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const getSelectedPackageAmount = () => {
    const selected = standardPackages.find((pkg) => pkg.id === selectedPackage);
    return selected ? selected.price : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment submission
    console.log("Payment initiated", {
      email,
      packageId: selectedPackage,
      amount: getSelectedPackageAmount(),
    });
  };

  return (
    <div className="min-h-screen bg-background mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Pay</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select your preferred package to continue
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12 mt-8">
            {standardPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {pkg.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium bg-gradient-brand text-white">
                    Most Popular
                  </div>
                )}
                <Card
                  className={`h-full transition-all duration-300 ${
                    selectedPackage === pkg.id
                      ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                      : pkg.highlighted
                      ? "shadow-xl bg-card/60 backdrop-blur-sm"
                      : ""
                  } ${pkg.highlighted ? "mt-4" : ""}`}
                >
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold">
                      {pkg.name}
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="flex items-baseline text-3xl font-bold">
                      <span className="text-gradient-brand">
                        {pkg.price} cedis
                      </span>
                      <span className="ml-1 text-base font-normal text-muted-foreground">
                        {pkg.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div
                            className={`mr-3 rounded-full p-1 ${
                              pkg.highlighted
                                ? "bg-primary/10"
                                : "bg-secondary/10"
                            }`}
                          >
                            <Check
                              className={`w-4 h-4 ${
                                pkg.highlighted
                                  ? "text-primary"
                                  : "text-secondary"
                              }`}
                            />
                          </div>
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={pkg.highlighted ? "gradient" : "outline"}
                      className="w-full"
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      {selectedPackage === pkg.id ? "Selected" : "Select Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Payment Details
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          icon={
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Amount to Pay</Label>
                        <div className="text-2xl font-bold text-gradient-brand">
                          {getSelectedPackageAmount()} cedis
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="gradient">
                  Pay Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/other-packages"
            className="text-primary hover:text-primary/80 hover:underline"
          >
            View other package options
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Check, Coins } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components";
import { useRouter } from "next/navigation";
import type { RootState } from "@/lib";
import { useSelector } from "react-redux";
import { createPayment } from "@/controllers";
import { useAppDispatch } from "@/hooks";

const standardPackages = [
  {
    id: "67ad57ba0628c9cc6546ab27",
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
    id: "67ad57cc0628c9cc6546ab2d",
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
    id: "67ad57ea0628c9cc6546ab33",
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

const Packages = [
  {
    id: "67ad57ba0628c9cc6546ab27",
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
    id: "67ad57cc0628c9cc6546ab2d",
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
    id: "67ad57ea0628c9cc6546ab33",
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
  { id: "67ad58830628c9cc6546ab39", name: "1 Credit Hour Course", price: 2 },
  {
    id: " 67ad58a00628c9cc6546ab3f",
    name: "2 Credit Hours Course",
    price: 2.5,
  },
  { id: "67ad58af0628c9cc6546ab45", name: "3 Credit Hours Course", price: 3 },

  {
    id: "67ad59370628c9cc6546ab57",
    name: "1 Credit Hour Quiz",
    price: 1.5,
    discount: "15% discount applied",
  },
  {
    id: "67ad59250628c9cc6546ab51",
    name: "2 Credit Hours Quiz",
    price: 2.25,
    discount: "15% discount applied",
  },
  {
    id: "67ad58fe0628c9cc6546ab4b",
    name: "3 Credit Hours Quiz",
    price: 2.75,
    discount: "35% discount applied",
  },
  {
    id: "67ad5adf0628c9cc6546ab64",
    name: "Bulk Quiz Purchase",
    amount: 5,
    description: "25% OFF when buying 5+ quizzes",
    example: "Example: 5 quizzes = 5 cedis → 3.75 cedis after discount",
  },
];

function PayPageContent() {
  const dispatch = useAppDispatch();
  const { credentials } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmountInput, setCustomAmountInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const amount = searchParams.get("amount");
  const id = searchParams.get("id");
  const isQuizCredits = searchParams.get("type") === "credits";

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setIsCustomAmount(false);
  };

  const getSelectedPackageAmount = () => {
    if (isCustomAmount) {
      return Number.parseFloat(customAmount) || 0;
    }

    if (amount && id) {
      const selected = Packages.find((pkg) => pkg.id === id);
      setSelectedPackage(selected!.id);
      return;
    }
    const selected = standardPackages.find((pkg) => pkg.id === selectedPackage);
    return selected ? selected.price : 0;
  };

  const getQuizCredits = (amount: number) => {
    return Math.floor(amount * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && id) {
      const data = {
        amount: amount,
        packageId: id,
      };
      const res = await dispatch(createPayment(data, credentials.accessToken));

      router.push(res);
    } else {
      const data = {
        packageId: selectedPackage ? selectedPackage : "",
        amount: getSelectedPackageAmount(),
      };

      const res = await dispatch(createPayment(data, credentials.accessToken));
      router.push(res);
    }
  };

  const [selectedPackage, setSelectedPackage] = useState("");

  const handleCustomAmountSubmit = useCallback(() => {
    if (customAmountInput) {
      setCustomAmount(customAmountInput);
      setIsCustomAmount(true);
      setSelectedPackage("");
      setIsDialogOpen(false);
    }
  }, [customAmountInput]);
  useEffect(() => {
    const urlAmount = searchParams.get("amount");
    if (urlAmount) {
      if (isQuizCredits) {
        setCustomAmount(urlAmount);
        setIsCustomAmount(true);
      } else {
        setCustomAmountInput(urlAmount);
        handleCustomAmountSubmit();
      }
    }
  }, [searchParams, isQuizCredits, handleCustomAmountSubmit]);

  if (amount && id) {
    return (
      <div className="min-h-screen bg-background mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">{`${
              Packages.find((e) => e.id === id)!.name
            }`}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete your purchase
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto mt-8"
          >
            <Card className="p-6">
              <CardHeader>
                <CardTitle>{`${
                  Packages.find((e) => e.id === id)!.name
                }`}</CardTitle>
                <CardDescription>Package Details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-gradient-brand">
                    Amount: {amount} cedis
                  </div>
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail className="h-5 w-5 text-muted-foreground" />}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  className="w-full"
                  variant="gradient"
                  onClick={handleSubmit}
                >
                  Pay Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

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
              {isQuizCredits
                ? "Purchase quiz credits or select a package"
                : "Select your preferred package or enter a custom amount"}
            </p>
          </motion.div>

          {!isQuizCredits && (
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
                        {selectedPackage === pkg.id
                          ? "Selected"
                          : "Select Plan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {isQuizCredits && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto mt-8"
            >
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Quiz Credits</CardTitle>
                  <CardDescription>
                    Enter amount to get quiz credits (1 cedi = 100 credits)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customAmount">Amount (cedis)</Label>
                      <Input
                        id="customAmount"
                        type="number"
                        min="0.5"
                        step="0.1"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setIsCustomAmount(true);
                          setSelectedPackage("");
                        }}
                        icon={
                          <Coins className="h-5 w-5 text-muted-foreground" />
                        }
                      />
                    </div>
                    {isCustomAmount && customAmount && (
                      <div className="text-sm text-muted-foreground">
                        You&apos;ll receive{" "}
                        <span className="font-bold text-primary">
                          {getQuizCredits(Number(customAmount))} quiz credits
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {(selectedPackage || (isCustomAmount && customAmount)) && (
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
                      <div className="space-y-2">
                        <Label>Amount to Pay</Label>
                        <div className="text-2xl font-bold text-gradient-brand">
                          {getSelectedPackageAmount()} cedis
                        </div>
                        {isQuizCredits && (
                          <div className="text-sm text-muted-foreground">
                            You&apos;ll receive{" "}
                            {getQuizCredits(getSelectedPackageAmount()!)} quiz
                            credits
                          </div>
                        )}
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

        <div className="text-center mt-8 space-y-4">
          <Button onClick={() => setIsDialogOpen(true)} variant="outline">
            Pay Custom Amount
          </Button>
          <div>
            <Link
              href="/packages"
              className="text-primary hover:text-primary/80 hover:underline"
            >
              View other package options
            </Link>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pay Custom Amount</DialogTitle>
              <DialogDescription>
                Enter a custom amount to pay. You&apos;ll see the equivalent in
                quiz credits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customAmountInput">Amount (cedis)</Label>
                <Input
                  id="customAmountInput"
                  type="number"
                  min="0.5"
                  step="0.1"
                  value={customAmountInput}
                  onChange={(e) => setCustomAmountInput(e.target.value)}
                  placeholder="Enter custom amount"
                />
              </div>
              {customAmountInput && (
                <div className="text-sm text-muted-foreground">
                  You&apos;ll receive{" "}
                  <span className="font-bold text-primary">
                    {getQuizCredits(Number(customAmountInput))} quiz credits
                  </span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomAmountSubmit}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayPageContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  Loader2,
  CheckCircle2,
  GraduationCap,
  X,
  CreditCard,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Lock,
  UserCheck,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import {
  usePackages,
  useCreditBundles,
  useStudentVerifyStatus,
  useInitiatePlanPayment,
  useInitiateCreditPayment,
  useValidatePromoCode,
  type BillingPackage,
  type CreditBundle,
} from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import { Loader } from "@/components/common/loader";
import { toast } from "sonner";
import {
  LOGO_SRC,
  QUBI_STUDY_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

const TIER_LABELS: Record<string, string> = {
  cooked: "Cooked Plan",
  cruising: "Cruising Plan",
  locked_in: "Locked In Plan",
};

const TIER_TAGLINES: Record<string, string> = {
  cooked: "All-nighter mode. Quick turnaround and focused study.",
  cruising: "Steady grind. Complete access for mid-semester flow.",
  locked_in: "Unlimited power. Peak productivity with zero limits.",
};

const DURATION_LABELS: Record<string, string> = {
  daily: "Daily pass",
  weekly: "Weekly pass",
  semester: "Semester pass",
};

const DURATION_SUFFIX: Record<string, string> = {
  daily: "/ day",
  weekly: "/ week",
  semester: "/ semester",
};

function buildKeyEntitlements(pkg: BillingPackage): string[] {
  const f: string[] = [];
  f.push(
    pkg.limits.tutorSessionsPerDay === null
      ? "Unlimited Z AI tutor sessions"
      : `${pkg.limits.tutorSessionsPerDay} Z sessions / day`,
  );
  f.push(
    pkg.limits.quizGenerationsPerDay === null
      ? "Unlimited AI quiz generations"
      : `${pkg.limits.quizGenerationsPerDay} quiz generations / day`,
  );
  f.push(
    pkg.limits.flashcardSetsPerDay === null
      ? "Unlimited flashcards & mind maps"
      : `${pkg.limits.flashcardSetsPerDay} flashcard sets / day`,
  );
  f.push(
    pkg.limits.materialUploadsPerDay === null
      ? "Unlimited lecture slide & PDF uploads"
      : `${pkg.limits.materialUploadsPerDay} uploads / day`,
  );
  if (pkg.limits.pdfExport) f.push("PDF & summary export");
  if (pkg.tier === "locked_in") f.push("Priority processing & instant support");
  if (pkg.limits.bonusCreditsOnSignup > 0)
    f.push(`${pkg.limits.bonusCreditsOnSignup} bonus generation credits`);
  return f;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const bundleId = searchParams.get("bundleId");

  const { user } = useAuth();
  const { data: allPackages = [], isLoading: packagesLoading } = usePackages();
  const { data: creditBundles = [], isLoading: bundlesLoading } = useCreditBundles();
  const { data: studentStatus, isLoading: studentStatusLoading } = useStudentVerifyStatus();

  const selectedPackage: BillingPackage | undefined = packageId
    ? allPackages.find((p) => p._id === packageId)
    : undefined;

  const selectedBundle: CreditBundle | undefined = bundleId
    ? creditBundles.find((b) => b._id === bundleId)
    : undefined;

  const isCredits = !!bundleId && !packageId;
  const basePrice = selectedPackage?.priceGHS ?? selectedBundle?.priceGHS ?? 0;

  // Promo and Referral States
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  const validatePromo = useValidatePromoCode();
  const initiatePlan = useInitiatePlanPayment();
  const initiateCredits = useInitiateCreditPayment();

  // Track all applicable discounts from validation result
  const [discountResult, setDiscountResult] = useState<any>(null);

  const isStudentVerified = user && studentStatus?.status === "verified";

  // Auto-fetch discounts from backend on load and parameter changes
  useEffect(() => {
    if (!packageId && !bundleId) return;

    let isMounted = true;
    async function calculateDiscounts() {
      try {
        const result: any = await validatePromo.mutateAsync({
          code: appliedPromo?.code || undefined,
          referralCode: appliedReferral?.code || undefined,
          packageId: packageId || undefined,
          bundleId: bundleId || undefined,
        });
        if (isMounted) {
          setDiscountResult(result);
        }
      } catch {
        // Handled silently
      }
    }

    if (user) {
      calculateDiscounts();
    }

    return () => {
      isMounted = false;
    };
  }, [packageId, bundleId, appliedPromo?.code, appliedReferral?.code, isStudentVerified, user]);

  // Compute final price with full fallback support and rounded percentages
  const { finalPrice, totalDiscountPercentage, totalSavings, hasDiscount, activeDiscounts } = useMemo(() => {
    if (discountResult?.finalAmountGHS != null) {
      const finalAmount = Number(discountResult.finalAmountGHS);
      const discountPct = Math.round(Number(discountResult.totalDiscountPercentage || 0));
      const savings = Math.max(0, Number((basePrice - finalAmount).toFixed(2)));
      return {
        finalPrice: finalAmount,
        totalDiscountPercentage: discountPct,
        totalSavings: savings,
        hasDiscount: finalAmount < basePrice,
        activeDiscounts: (discountResult.discounts || []).map((d: any) => ({
          ...d,
          percentage: Math.round(Number(d.percentage || 0)),
        })),
      };
    }

    // Fallback calculation while validating or offline / guest
    let fallbackPct = 0;
    const fallbackList: Array<{ type: string; label: string; percentage: number }> = [];

    if (isStudentVerified) {
      fallbackPct += 10;
      fallbackList.push({ type: "student", label: "Student discount", percentage: 10 });
    }
    if (appliedPromo) {
      const promoPct = Math.round(appliedPromo.discountPercent);
      fallbackPct += promoPct;
      fallbackList.push({
        type: "promo",
        label: `Promo: ${appliedPromo.code}`,
        percentage: promoPct,
      });
    }
    if (appliedReferral) {
      const refPct = Math.round(appliedReferral.discountPercent);
      fallbackPct += refPct;
      fallbackList.push({
        type: "referral",
        label: "Referral discount",
        percentage: refPct,
      });
    }

    const cappedPct = Math.min(Math.round(fallbackPct), 80);
    const computedFinal = cappedPct > 0 ? Number((basePrice * (1 - cappedPct / 100)).toFixed(2)) : basePrice;
    const savings = Math.max(0, Number((basePrice - computedFinal).toFixed(2)));

    return {
      finalPrice: computedFinal,
      totalDiscountPercentage: cappedPct,
      totalSavings: savings,
      hasDiscount: computedFinal < basePrice,
      activeDiscounts: fallbackList,
    };
  }, [discountResult, basePrice, isStudentVerified, appliedPromo, appliedReferral]);

  const isLoading = initiatePlan.isPending || initiateCredits.isPending;

  // Auto-detect promo or referral codes from query parameters on mount
  useEffect(() => {
    const urlPromo = searchParams.get("promo") || searchParams.get("code");
    const urlRef = searchParams.get("ref") || searchParams.get("referral");
    if (urlPromo && !appliedPromo) {
      setPromoCode(urlPromo.toUpperCase());
      setShowPromoInput(true);
    }
    if (urlRef && !appliedReferral) {
      setReferralCode(urlRef.toUpperCase());
      setShowReferralInput(true);
    }
  }, [searchParams, appliedPromo, appliedReferral]);

  // Current full URL for redirecting back after login
  const currentCheckoutUrl = typeof window !== "undefined"
    ? `${window.location.pathname}${window.location.search}`
    : `/checkout?${searchParams.toString()}`;

  async function handleApplyCodes(type: "promo" | "referral") {
    const currentPromo = type === "promo" ? promoCode.trim().toUpperCase() : appliedPromo?.code;
    const currentReferral =
      type === "referral" ? referralCode.trim().toUpperCase() : appliedReferral?.code;

    if (!packageId && !bundleId) return;

    // If guest, calculate locally and notify
    if (!user) {
      if (type === "promo") {
        if (promoCode.trim()) {
          setAppliedPromo({
            code: promoCode.trim().toUpperCase(),
            discountPercent: 10,
          });
          toast.success(`Promo code applied. Sign in to finalize checkout.`);
        }
      } else if (type === "referral") {
        if (referralCode.trim()) {
          setAppliedReferral({
            code: referralCode.trim().toUpperCase(),
            discountPercent: 15,
          });
          toast.success(`Referral code applied. Sign in to finalize checkout.`);
        }
      }
      return;
    }

    try {
      const result: any = await validatePromo.mutateAsync({
        code: currentPromo || undefined,
        referralCode: currentReferral || undefined,
        packageId: packageId || undefined,
        bundleId: bundleId || undefined,
      });

      const promoDiscount = result.discounts?.find((d: any) => d.type === "promo");
      const referralDiscount = result.discounts?.find(
        (d: any) => d.type === "referral" && d.label.toLowerCase().includes("signup")
      );

      if (type === "promo") {
        if (promoDiscount) {
          const roundedPromo = Math.round(Number(promoDiscount.percentage || 0));
          setAppliedPromo({
            code: promoCode.trim().toUpperCase(),
            discountPercent: roundedPromo,
          });
          toast.success(`Promo applied: ${roundedPromo}% off`);
        } else {
          toast.error("Invalid or expired promo code");
        }
      } else if (type === "referral") {
        if (referralDiscount) {
          const roundedRef = Math.round(Number(referralDiscount.percentage || 0));
          setAppliedReferral({
            code: referralCode.trim().toUpperCase(),
            discountPercent: roundedRef,
          });
          toast.success(`Referral applied: ${roundedRef}% off`);
        } else {
          toast.error("Invalid or already used referral code");
        }
      }

      setDiscountResult(result);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to validate code";
      toast.error(msg);
    }
  }

  async function handleRemoveCode(toRemove: "promo" | "referral") {
    const nextPromo = toRemove === "promo" ? undefined : appliedPromo?.code;
    const nextReferral =
      toRemove === "referral" ? undefined : appliedReferral?.code;

    if (toRemove === "promo") {
      setAppliedPromo(null);
      setPromoCode("");
    } else {
      setAppliedReferral(null);
      setReferralCode("");
    }

    if (user) {
      try {
        const result: any = await validatePromo.mutateAsync({
          code: nextPromo,
          referralCode: nextReferral,
          packageId: packageId || undefined,
          bundleId: bundleId || undefined,
        });
        setDiscountResult(result);
      } catch {
        setDiscountResult(null);
      }
    }
  }

  async function handleCheckout() {
    if (!user) {
      toast.info("Please log in to complete your checkout.");
      router.push(`/login?redirect=${encodeURIComponent(currentCheckoutUrl)}`);
      return;
    }

    try {
      let result;
      if (isCredits && bundleId) {
        result = await initiateCredits.mutateAsync({
          bundleId,
          email: user.email,
          promoCode: appliedPromo?.code,
          referralCode: referralCode.trim() || undefined,
        });
      } else if (packageId) {
        result = await initiatePlan.mutateAsync({
          packageId,
          email: user.email,
          promoCode: appliedPromo?.code,
          referralCode: referralCode.trim() || undefined,
        });
      } else {
        return;
      }

      if (result?.authorizationUrl) {
        if (finalPrice === 0) {
          toast.success("Activating your free plan…");
        } else {
          toast.success("You will be redirected to Paystack to complete payment.");
        }
        window.location.href = result.authorizationUrl;
      } else {
        toast.error("Could not obtain checkout URL.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment. Please try again.");
    }
  }

  if (packagesLoading || bundlesLoading || (user && studentStatusLoading)) {
    return <Loader message="Loading checkout..." />;
  }

  if (!selectedPackage && !selectedBundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F7F9FC]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-slate-200 bg-white p-8 max-w-md w-full shadow-lg shadow-slate-100 text-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QUBI_RUN_SRC}
            alt="Qubi"
            className="h-24 w-24 mx-auto object-contain mb-4"
          />
          <h2 className="display text-2xl font-bold text-slate-950 mb-2">
            No plan selected
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Please select a study plan or credit pack to continue to checkout.
          </p>
          <Link
            href="/pricing"
            className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 block"
          >
            View Pricing &amp; Plans →
          </Link>
        </motion.div>
      </div>
    );
  }

  const features = selectedPackage ? buildKeyEntitlements(selectedPackage) : [];

  return (
    <div className="min-h-screen text-slate-900 bg-[#F7F9FC] flex flex-col justify-between selection:bg-[#0C60FC] selection:text-white">
      {/* Minimal Stripe-style Brand Bar (No full header/footer) */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={LOGO_SRC}
                alt="Qz Logo"
                width={28}
                height={28}
                className="rounded-lg object-contain"
              />
              <span className="display font-black text-lg text-slate-950 tracking-tight">
                Qz
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                {user.email}
              </span>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(currentCheckoutUrl)}`}
                className="text-xs font-extrabold text-[#0C60FC] hover:underline flex items-center gap-1"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 border border-slate-200/60">
              <Lock className="h-3 w-3 text-emerald-600" /> Encrypted Checkout
            </span>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="flex-1 px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Stripe-like Combined Checkout Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[32px] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 overflow-hidden"
            style={{ borderRadius: "32px" }}
          >
            <div className="grid lg:grid-cols-[1.1fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Left Column: Plan & Entitlements Overview */}
              <div className="p-7 sm:p-10 lg:p-12 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  {/* Plan Title & Duration */}
                  <h1 className="display text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                    {selectedPackage
                      ? `${TIER_LABELS[selectedPackage.tier] ?? selectedPackage.tier}`
                      : selectedBundle
                        ? `${selectedBundle.name} Credits`
                        : "Order"}
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                    {selectedPackage
                      ? `${DURATION_LABELS[selectedPackage.durationType]} · ${TIER_TAGLINES[selectedPackage.tier]}`
                      : selectedBundle
                        ? `${selectedBundle.credits} generation credits for AI study tools.`
                        : ""}
                  </p>

                  {/* Strikethrough & New Price Display */}
                  <div className="mt-6 flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-400">GHS</span>
                    {hasDiscount && (
                      <span className="display text-2xl sm:text-3xl font-bold text-slate-400 line-through whitespace-nowrap">
                        {basePrice.toFixed(2)}
                      </span>
                    )}
                    <span className="display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0C60FC] whitespace-nowrap">
                      {finalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {selectedPackage
                        ? DURATION_SUFFIX[selectedPackage.durationType]
                        : "one-time"}
                    </span>
                    {hasDiscount && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap">
                        {Math.round(totalDiscountPercentage)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Feature Entitlements List */}
                  <div className="mt-8 space-y-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      What&apos;s included
                    </p>
                    <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                      {selectedPackage &&
                        features.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      {selectedBundle && (
                        <>
                          <li className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{selectedBundle.credits} generation credits for your account</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Usable across AI Tutor, Mind Maps, and Quizzes</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Credits never expire</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Instant Activation Mascot Note */}
                <div className="mt-10 pt-6 border-t border-slate-200/70 flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={QUBI_STUDY_SRC}
                    alt="Qubi"
                    className="h-11 w-11 object-contain shrink-0"
                  />
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-900 font-bold">Instant activation:</strong> Your study privileges unlock automatically as soon as payment is confirmed.
                  </p>
                </div>
              </div>

              {/* Right Column: Order Breakdown, Discounts & Pay Button */}
              <div className="p-7 sm:p-10 lg:p-12 bg-white flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                    <h2 className="display text-xl font-bold text-slate-950">
                      Order Summary
                    </h2>
                    <span className="text-xs font-semibold text-slate-400">
                      Paystack
                    </span>
                  </div>

                  {/* Account state banner if not logged in */}
                  {!user && (
                    <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">Have a Qz account?</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Sign in to link your subscription and student discount.
                          </p>
                        </div>
                        <Link
                          href={`/login?redirect=${encodeURIComponent(currentCheckoutUrl)}`}
                          className="rounded-xl bg-[#0C60FC] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-blue-700 shrink-0"
                        >
                          Sign in
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Summary Card Details with Strikethrough Item Row */}
                  <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-slate-700 gap-2">
                      <span className="font-semibold truncate">
                        {selectedPackage
                          ? `${TIER_LABELS[selectedPackage.tier]} (${DURATION_LABELS[selectedPackage.durationType]})`
                          : `${selectedBundle?.name} Credits`}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through whitespace-nowrap">
                            GHS {basePrice.toFixed(2)}
                          </span>
                        )}
                        <span className="font-bold text-slate-950 whitespace-nowrap">
                          GHS {finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Active Discounts Breakdown */}
                    {activeDiscounts.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60 space-y-2">
                        {activeDiscounts.map((d: any, i: number) => {
                          const pct = Math.round(Number(d.percentage || 0));
                          const discountVal = Number(((basePrice * d.percentage) / 100).toFixed(2));
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between text-emerald-700 bg-emerald-50/80 rounded-xl p-2.5 px-3 font-semibold text-xs border border-emerald-100 gap-2"
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                {d.type === "student" ? (
                                  <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Tag className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                )}
                                <span className="truncate">{d.label} ({pct}% OFF)</span>
                              </span>
                              <span className="font-bold shrink-0 whitespace-nowrap">
                                − GHS {discountVal.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Promo Code & Referral Code Section (Enabled for both Plans & Credit Bundles) */}
                  <div className="mt-5 space-y-2">
                    {appliedPromo ? (
                      <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>PROMO: {appliedPromo.code} ({Math.round(appliedPromo.discountPercent)}% OFF)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCode("promo")}
                          className="text-xs text-rose-600 hover:text-rose-800 font-extrabold flex items-center gap-0.5 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    ) : showPromoInput ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApplyCodes("promo");
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="PROMO CODE"
                          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none focus:bg-white focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                          type="submit"
                          disabled={!promoCode.trim() || validatePromo.isPending}
                          className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:opacity-50 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                          {validatePromo.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowPromoInput(true)}
                        className="text-xs font-bold text-[#0C60FC] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        + Add promo code
                      </button>
                    )}

                    {/* Referral code trigger */}
                    {!showReferralInput && !appliedReferral ? (
                      <button
                        type="button"
                        onClick={() => setShowReferralInput(true)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer block"
                      >
                        Have a friend&apos;s referral code?
                      </button>
                    ) : appliedReferral ? (
                      <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">
                        <span>REFERRAL: {appliedReferral.code} ({Math.round(appliedReferral.discountPercent)}% OFF)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCode("referral")}
                          className="text-xs text-rose-600 hover:text-rose-800 font-extrabold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApplyCodes("referral");
                        }}
                        className="flex gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          placeholder="REFERRAL CODE"
                          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none focus:bg-white focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                          type="submit"
                          disabled={!referralCode.trim() || validatePromo.isPending}
                          className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:opacity-50 cursor-pointer"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Final Total Amount with Strikethrough & Savings Tag */}
                  <div className="mt-8 pt-5 border-t border-slate-200 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Total due today
                      </span>
                      {hasDiscount && (
                        <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                          Saved GHS {totalSavings.toFixed(2)} ({Math.round(totalDiscountPercentage)}% OFF)
                        </span>
                      )}
                    </div>
                    <div className="text-right flex items-baseline gap-2 shrink-0 whitespace-nowrap">
                      {hasDiscount && (
                        <span className="text-base sm:text-lg font-bold text-slate-400 line-through whitespace-nowrap">
                          GHS {basePrice.toFixed(2)}
                        </span>
                      )}
                      <span className="display text-3xl sm:text-4xl font-extrabold text-[#0C60FC] whitespace-nowrap">
                        GHS {finalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pay Button and Payment Channels */}
                <div className="space-y-4 pt-4">
                  {user ? (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full rounded-2xl bg-[#0C60FC] py-4 px-6 text-sm font-extrabold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{finalPrice === 0 ? "Activating plan…" : "Redirecting to Paystack…"}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {finalPrice === 0
                              ? "Activate Plan (Free)"
                              : `Pay GHS ${finalPrice.toFixed(2)} with Paystack`}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={`/login?redirect=${encodeURIComponent(currentCheckoutUrl)}`}
                      className="w-full rounded-2xl bg-[#0C60FC] py-4 px-6 text-sm font-extrabold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600 flex items-center justify-center gap-2 text-center"
                    >
                      <span>Sign in to Pay GHS {finalPrice.toFixed(2)}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  {/* Supported Payment Channels */}
                  {finalPrice > 0 ? (
                    <div className="text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1">
                          <Smartphone className="h-3 w-3 text-slate-700" /> MoMo / Telecel / AT
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1">
                          <CreditCard className="h-3 w-3 text-slate-700" /> Visa / Mastercard
                        </span>
                      </div>
                      <p className="mt-2.5 text-[11px] font-medium text-slate-400">
                        Powered by Paystack
                      </p>
                    </div>
                  ) : (
                    <p className="text-center text-[11px] font-medium text-emerald-600">
                      100% Free · Instant activation with no payment required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/50">
        <p>
          Secure payment processed by Paystack · Need help?{" "}
          <Link href="/contact" className="text-slate-600 font-bold hover:underline">
            Contact Support
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default function PublicCheckoutPage() {
  return (
    <Suspense fallback={<Loader message="Loading checkout..." />}>
      <CheckoutContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  Flame,
  Zap,
  ShieldCheck,
  Check,
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
  QUBI_WAVE_SRC,
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
    <div className="qz-auth min-h-screen w-full bg-[#F7F9FC] antialiased selection:bg-[#0C60FC] selection:text-white">
      {/* Full-width, Full-height Grid Layout matching Auth / Login Page */}
      <main className="grid min-h-screen lg:grid-cols-[1.08fr_.92fr]">
        {/* Left Brand Banner: Royal Blue Theme matching Login Page with Back button at top */}
        <section className="relative overflow-hidden bg-[#0C60FC] p-8 sm:p-12 lg:p-14 xl:p-16 text-white flex flex-col justify-between">
          {/* Decorative geometric blur orbs matching auth banner */}
          <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full border-[70px] border-white/5 pointer-events-none" />
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#DFFF61]/15 blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

          {/* Top Back Navigation with Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex items-center justify-between z-10 mb-8 sm:mb-12"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-white/20 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_SRC} alt="Qz" className="h-8 w-8 object-contain" />
              </span>
              <span className="display text-xl font-bold text-white tracking-tight">Qz</span>
            </Link>
          </motion.div>

          {/* Product / Plan Title, Price & Entitlements */}
          <div className="relative z-10 max-w-xl">
            {/* Cycle / Tier Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-md px-3.5 py-1.5 text-xs font-extrabold text-[#DFFF61] border border-white/10"
            >
              <Flame className="h-3.5 w-3.5 text-[#DFFF61]" />
              <span>
                {selectedPackage
                  ? `${DURATION_LABELS[selectedPackage.durationType]} · ${selectedPackage.tier.toUpperCase()}`
                  : "CREDIT PACK"}
              </span>
            </motion.div>

            {/* Plan Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-balance text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white"
            >
              {selectedPackage
                ? `${TIER_LABELS[selectedPackage.tier] ?? selectedPackage.tier}`
                : selectedBundle
                  ? `${selectedBundle.name} Credits`
                  : "Checkout"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-3 max-w-lg text-base sm:text-lg leading-relaxed text-blue-100"
            >
              {selectedPackage
                ? TIER_TAGLINES[selectedPackage.tier]
                : selectedBundle
                  ? `${selectedBundle.credits} generation credits for AI study tools with no expiration.`
                  : ""}
            </motion.p>

            {/* Hero Price Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-baseline gap-3"
            >
              <span className="text-sm font-bold text-blue-200">GHS</span>
              {hasDiscount && (
                <span className="display text-2xl sm:text-3xl font-bold text-blue-200/70 line-through whitespace-nowrap">
                  {basePrice.toFixed(2)}
                </span>
              )}
              <span className="display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white whitespace-nowrap">
                {finalPrice.toFixed(2)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-200">
                {selectedPackage
                  ? DURATION_SUFFIX[selectedPackage.durationType]
                  : "one-time"}
              </span>
              {hasDiscount && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[#DFFF61] text-slate-950 px-3 py-1 text-xs font-black whitespace-nowrap shadow-sm">
                  {Math.round(totalDiscountPercentage)}% OFF
                </span>
              )}
            </motion.div>

            {/* Entitlements Checklist */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="mt-8 space-y-3"
            >
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
                Included with this {isCredits ? "pack" : "pass"}
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-blue-50">
                {selectedPackage &&
                  features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#DFFF61]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                {selectedBundle && (
                  <>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#DFFF61]" />
                      </div>
                      <span>{selectedBundle.credits} generation credits added to your balance</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#DFFF61]" />
                      </div>
                      <span>Usable across AI Tutor, Mind Maps, and Quiz Generator</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#DFFF61]" />
                      </div>
                      <span>Credits never expire</span>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* Mascot Qubi Speech Bubble matching Auth Page */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="mt-8 flex items-end gap-3.5"
            >
              <div className="qubi-cycle h-20 w-20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_WAVE_SRC}
                  alt="Qubi"
                  className="qubi-bob h-20 w-20 object-contain"
                />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white/15 backdrop-blur-md border border-white/20 px-4 py-3 text-white shadow-xl">
                <p className="hand text-xl text-[#DFFF61]">Instant Access</p>
                <p className="text-xs font-medium text-blue-100">
                  Privileges &amp; credits unlock automatically on payment.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Footer Note in Left Pane */}
          <p className="relative z-10 text-xs text-blue-200 mt-8 pt-4 border-t border-white/10">
            Study smarter. Know your rank. Master it all.
          </p>
        </section>

        {/* Right Column: Interactive Checkout Form & Pay Actions */}
        <section className="bg-white p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between min-h-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="max-w-md w-full mx-auto my-auto space-y-6"
          >
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <h2 className="display text-xl sm:text-2xl font-bold text-slate-950">
                Order Summary
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Lock className="h-3.5 w-3.5 text-emerald-600" /> Paystack
              </span>
            </div>

            {/* Account Info Card / Sign-in Prompt */}
            {user ? (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Account
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate block">
                    {user.email}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                  <CheckCircle2 className="h-3 w-3" /> Signed In
                </span>
              </div>
            ) : (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">Have a Qz account?</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Sign in to apply student discounts and link access.
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

            {/* Order Item Summary */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
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
              <AnimatePresence>
                {activeDiscounts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 border-t border-slate-200/60 space-y-2 overflow-hidden"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Promo Code & Referral Code Section */}
            <div className="space-y-2">
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
            <div className="pt-5 border-t border-slate-200 flex items-end justify-between gap-4">
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

            {/* Pay Button & Payment Channels */}
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
                  <p className="mt-2 text-[11px] font-medium text-slate-400">
                    Powered by Paystack
                  </p>
                </div>
              ) : (
                <p className="text-center text-[11px] font-medium text-emerald-600">
                  100% Free · Instant activation with no payment required
                </p>
              )}
            </div>
          </motion.div>

          {/* Subtle bottom note */}
          <div className="pt-8 text-center text-[11px] text-slate-400 max-w-md w-full mx-auto">
            <span>Guaranteed safe &amp; secure checkout · </span>
            <Link href="/contact" className="hover:underline text-slate-500 font-semibold">
              Contact support
            </Link>
          </div>
        </section>
      </main>
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

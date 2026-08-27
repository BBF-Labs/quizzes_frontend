"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  Zap,
  Loader2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  X,
  CreditCard,
  Smartphone,
  ChevronDown,
  ChevronUp,
  UserCheck,
  HelpCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  usePackages,
  useCreditBundles,
  useBillingStatus,
  useStudentVerifyStatus,
  useInitiatePlanPayment,
  useInitiateCreditPayment,
  useValidatePromoCode,
  type BillingPackage,
  type CreditBundle,
  type PlanTier,
  type PlanDuration,
} from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import { Loader } from "@/components/common/loader";
import { toast } from "sonner";
import {
  QUBI_STUDY_SRC,
  QUBI_RUN_SRC,
  QUBI_WAVE_SRC,
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
  semester: "Full Semester access",
};

function buildPackageFeatures(pkg: BillingPackage): string[] {
  const f: string[] = [];
  f.push(
    pkg.limits.tutorSessionsPerDay === null
      ? "Unlimited Z tutor sessions"
      : `${pkg.limits.tutorSessionsPerDay} Z session${pkg.limits.tutorSessionsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.quizGenerationsPerDay === null
      ? "Unlimited quiz generations"
      : `${pkg.limits.quizGenerationsPerDay} quiz generation${pkg.limits.quizGenerationsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.flashcardSetsPerDay === null
      ? "Unlimited flashcards"
      : `${pkg.limits.flashcardSetsPerDay} flashcard set${pkg.limits.flashcardSetsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.mindMapsPerDay === null
      ? "Unlimited mind maps"
      : `${pkg.limits.mindMapsPerDay} mind map${pkg.limits.mindMapsPerDay !== 1 ? "s" : ""} / day`,
  );
  f.push(
    pkg.limits.materialUploadsPerDay === null
      ? "Unlimited study uploads"
      : `${pkg.limits.materialUploadsPerDay} upload${pkg.limits.materialUploadsPerDay !== 1 ? "s" : ""} / day`,
  );
  if (pkg.limits.pdfExport) f.push("PDF & Summary export");
  if (pkg.tier === "locked_in") f.push("Priority processing & instant support");
  if (pkg.limits.bonusCreditsOnSignup > 0)
    f.push(`${pkg.limits.bonusCreditsOnSignup} bonus credits included`);
  return f;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackageId = searchParams.get("packageId");
  const initialBundleId = searchParams.get("bundleId");

  const { user } = useAuth();
  const { data: allPackages = [], isLoading: packagesLoading } = usePackages();
  const { data: creditBundles = [], isLoading: bundlesLoading } = useCreditBundles();
  const { data: billingStatus } = useBillingStatus();
  const { data: studentStatus } = useStudentVerifyStatus();

  const [activePackageId, setActivePackageId] = useState<string | null>(initialPackageId);
  const [activeBundleId, setActiveBundleId] = useState<string | null>(initialBundleId);

  // Sync state if search params change
  useEffect(() => {
    if (initialPackageId) setActivePackageId(initialPackageId);
    if (initialBundleId) setActiveBundleId(initialBundleId);
  }, [initialPackageId, initialBundleId]);

  const selectedPackage: BillingPackage | undefined = activePackageId
    ? allPackages.find((p) => p._id === activePackageId)
    : undefined;

  const selectedBundle: CreditBundle | undefined = activeBundleId
    ? creditBundles.find((b) => b._id === activeBundleId)
    : undefined;

  const isCredits = !!activeBundleId && !activePackageId;

  // Sibling packages of the same tier for seamless duration switching right on checkout
  const tierPackages = useMemo(() => {
    if (!selectedPackage) return [];
    return allPackages.filter((p) => p.tier === selectedPackage.tier);
  }, [allPackages, selectedPackage]);

  // Sibling tiers for switching tier
  const otherTiers = useMemo(() => {
    if (!selectedPackage) return [];
    const tiers: PlanTier[] = ["cooked", "cruising", "locked_in"];
    return tiers.filter((t) => t !== selectedPackage.tier);
  }, [selectedPackage]);

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
  const [showReferralInput, setShowReferralInput] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validatePromo = useValidatePromoCode();
  const initiatePlan = useInitiatePlanPayment();
  const initiateCredits = useInitiateCreditPayment();

  const basePrice = selectedPackage?.priceGHS ?? selectedBundle?.priceGHS ?? 0;

  // Track all applicable discounts from validation result
  const [discountResult, setDiscountResult] = useState<any>(null);
  const finalPrice = discountResult?.finalAmountGHS ?? basePrice;
  const totalSavings = basePrice > finalPrice ? basePrice - finalPrice : 0;

  const isLoading = initiatePlan.isPending || initiateCredits.isPending;

  // Auto-detect promo or referral codes from query parameters on mount
  useEffect(() => {
    const urlPromo = searchParams.get("promo") || searchParams.get("code");
    const urlRef = searchParams.get("ref") || searchParams.get("referral");
    if (urlPromo && !appliedPromo) {
      setPromoCode(urlPromo.toUpperCase());
    }
    if (urlRef && !appliedReferral) {
      setReferralCode(urlRef.toUpperCase());
      setShowReferralInput(true);
    }
  }, [searchParams, appliedPromo, appliedReferral]);

  // Re-validate discounts when active package changes
  useEffect(() => {
    if (appliedPromo || appliedReferral) {
      handleValidate(appliedPromo?.code, appliedReferral?.code);
    } else {
      setDiscountResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePackageId, activeBundleId]);

  async function handleValidate(promo?: string, referral?: string) {
    if (!activePackageId && !activeBundleId) return;
    try {
      const result: any = await validatePromo.mutateAsync({
        code: promo || undefined,
        referralCode: referral || undefined,
        packageId: activePackageId || undefined,
        bundleId: activeBundleId || undefined,
      });
      setDiscountResult(result);
      return result;
    } catch {
      setDiscountResult(null);
      return null;
    }
  }

  async function handleApplyCodes(type: "promo" | "referral") {
    const currentPromo = type === "promo" ? promoCode.trim().toUpperCase() : appliedPromo?.code;
    const currentReferral =
      type === "referral" ? referralCode.trim().toUpperCase() : appliedReferral?.code;

    if (!activePackageId && !activeBundleId) return;

    try {
      const result: any = await validatePromo.mutateAsync({
        code: currentPromo || undefined,
        referralCode: currentReferral || undefined,
        packageId: activePackageId || undefined,
        bundleId: activeBundleId || undefined,
      });

      const promoDiscount = result.discounts?.find((d: any) => d.type === "promo");
      const referralDiscount = result.discounts?.find(
        (d: any) => d.type === "referral" && d.label.toLowerCase().includes("signup")
      );

      if (type === "promo") {
        if (promoDiscount) {
          setAppliedPromo({
            code: promoCode.trim().toUpperCase(),
            discountPercent: promoDiscount.percentage,
          });
          toast.success(`Promo applied: ${promoDiscount.percentage}% discount`);
        } else {
          toast.error("Invalid or expired promo code");
        }
      } else if (type === "referral") {
        if (referralDiscount) {
          setAppliedReferral({
            code: referralCode.trim().toUpperCase(),
            discountPercent: referralDiscount.percentage,
          });
          toast.success(`Referral applied: ${referralDiscount.percentage}% discount`);
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

    if (!nextPromo && !nextReferral) {
      setDiscountResult(null);
      return;
    }

    await handleValidate(nextPromo, nextReferral);
  }

  const handleDurationChange = (pkg: BillingPackage) => {
    setActivePackageId(pkg._id);
    router.replace(`/app/billing/checkout?packageId=${pkg._id}`, { scroll: false });
  };

  const handleTierSwitch = (targetTier: PlanTier) => {
    const matching = allPackages.find(
      (p) => p.tier === targetTier && p.durationType === (selectedPackage?.durationType || "weekly")
    ) || allPackages.find((p) => p.tier === targetTier);

    if (matching) {
      setActivePackageId(matching._id);
      router.replace(`/app/billing/checkout?packageId=${matching._id}`, { scroll: false });
      toast.info(`Switched to ${TIER_LABELS[targetTier]}`);
    }
  };

  const handleBundleChange = (bundle: CreditBundle) => {
    setActiveBundleId(bundle._id);
    router.replace(`/app/billing/checkout?bundleId=${bundle._id}`, { scroll: false });
  };

  async function handleCheckout() {
    try {
      let result;
      if (isCredits && activeBundleId) {
        result = await initiateCredits.mutateAsync({
          bundleId: activeBundleId,
          email: user?.email || "",
        });
      } else if (activePackageId) {
        result = await initiatePlan.mutateAsync({
          packageId: activePackageId,
          email: user?.email || "",
          promoCode: appliedPromo?.code,
          referralCode: referralCode.trim() || undefined,
        });
      } else {
        return;
      }

      if (result?.authorizationUrl) {
        toast.success("Redirecting to Paystack checkout…");
        window.location.href = result.authorizationUrl;
      } else {
        toast.error("Could not obtain checkout URL.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment. Please try again.");
    }
  }

  if (packagesLoading || bundlesLoading) {
    return <Loader message="Preparing your order..." />;
  }

  if (!selectedPackage && !selectedBundle) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[32px] border border-slate-200 bg-white p-8 max-w-md w-full shadow-lg shadow-slate-100 text-center"
          style={{ borderRadius: "32px" }}
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
            Please choose a study plan or generation credit pack to proceed to checkout.
          </p>
          <Link
            href="/app/billing"
            className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 block"
          >
            Browse Plans &amp; Pricing →
          </Link>
        </motion.div>
      </div>
    );
  }

  const features = selectedPackage ? buildPackageFeatures(selectedPackage) : [];
  const isStudentVerified = studentStatus?.status === "verified";

  return (
    <div className="min-h-full px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-16 text-slate-900 bg-[#F7F9FC]">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <Link
          href="/app/billing"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0C60FC] transition mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" /> Back to plans
        </Link>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#0C60FC] shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Paystack Checkout
            </div>
            <h1 className="display text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mt-3">
              Review &amp; Complete Order
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Instant activation for all study tools and personalized AI assistance.
            </p>
          </div>

          {/* Account Identity Chip */}
          {user && (
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 px-3.5 shadow-sm text-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-[#0C60FC] font-extrabold">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-tight">
                  {user.name || "Logged in"}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {user.email}
                </p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-1 shrink-0" />
            </div>
          )}
        </motion.div>

        {/* Main 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* Left Column: Plan Configuration & Perks */}
          <div className="space-y-6">
            {/* Selected Plan / Bundle Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
              style={{ borderRadius: "28px" }}
            >
              {selectedPackage && (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-extrabold text-[#0C60FC] mb-2">
                        <Sparkles className="h-3 w-3" />
                        {TIER_LABELS[selectedPackage.tier] ?? selectedPackage.tier}
                      </span>
                      <h2 className="display text-2xl font-bold text-slate-950">
                        {DURATION_LABELS[selectedPackage.durationType] ?? selectedPackage.durationType}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {TIER_TAGLINES[selectedPackage.tier] ?? "Comprehensive study access."}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">Price</span>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-xs font-bold text-slate-500">GHS</span>
                        <span className="display text-3xl font-extrabold text-slate-950">
                          {selectedPackage.priceGHS.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duration Switcher Right on Checkout (UX Upgrade!) */}
                  {tierPackages.length > 1 && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-2.5">
                        Choose billing duration:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {tierPackages.map((pkg) => {
                          const isSelected = pkg._id === selectedPackage._id;
                          return (
                            <button
                              key={pkg._id}
                              type="button"
                              onClick={() => handleDurationChange(pkg)}
                              className={`rounded-2xl p-3 text-center transition flex flex-col items-center justify-center border cursor-pointer ${
                                isSelected
                                  ? "border-[#0C60FC] bg-blue-50/80 text-[#0C60FC] shadow-sm ring-1 ring-[#0C60FC]"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span className="text-xs font-bold capitalize">
                                {pkg.durationType}
                              </span>
                              <span className="text-[11px] font-semibold mt-0.5 opacity-80">
                                GHS {pkg.priceGHS.toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Included features list */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                      Included with your plan
                    </p>
                    <ul className="grid gap-2.5 sm:grid-cols-2 text-xs text-slate-600">
                      {features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick Switch to other Tiers */}
                  {otherTiers.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Explore other tiers:</span>
                      {otherTiers.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handleTierSwitch(tier)}
                          className="font-bold text-[#0C60FC] hover:underline cursor-pointer"
                        >
                          {TIER_LABELS[tier]} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedBundle && (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-500">
                        <Zap className="h-6 w-6 fill-current" />
                      </div>
                      <div>
                        <h2 className="display text-2xl font-bold text-slate-950 capitalize">
                          {selectedBundle.name}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {selectedBundle.credits} generation credits · Never expires
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">Price</span>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-xs font-bold text-slate-500">GHS</span>
                        <span className="display text-3xl font-extrabold text-slate-950">
                          {selectedBundle.priceGHS.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch to other credit bundles */}
                  {creditBundles.length > 1 && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-2.5">
                        Select credit package:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {creditBundles.map((b) => {
                          const isSelected = b._id === selectedBundle._id;
                          return (
                            <button
                              key={b._id}
                              type="button"
                              onClick={() => handleBundleChange(b)}
                              className={`rounded-2xl p-3 text-center transition flex flex-col items-center justify-center border cursor-pointer ${
                                isSelected
                                  ? "border-amber-500 bg-amber-50/80 text-amber-900 shadow-sm ring-1 ring-amber-500"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span className="text-xs font-bold capitalize">
                                {b.name}
                              </span>
                              <span className="text-[11px] font-semibold mt-0.5 opacity-80">
                                {b.credits} credits · GHS {b.priceGHS}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Usable for AI Tutor sessions, mind maps, and quiz generations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Credits never expire and remain safe in your account balance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Instant activation companion banner */}
              <div className="mt-6 flex items-center gap-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 p-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QUBI_STUDY_SRC}
                  alt="Qubi"
                  className="h-12 w-12 object-contain shrink-0"
                />
                <div>
                  <p className="hand text-base font-bold text-[#0C60FC]">
                    Instant activation!
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Your upgraded capabilities are applied immediately upon payment confirmation.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Promo & Referral Codes Card (Plans Only) */}
            {!isCredits && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
                style={{ borderRadius: "28px" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#0C60FC]" />
                    Promotional &amp; Referral Codes
                  </h3>
                </div>

                {/* Promo Code Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Promo Code
                  </label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>PROMO: {appliedPromo.code} ({appliedPromo.discountPercent}% OFF)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCode("promo")}
                        className="text-xs text-rose-600 hover:text-rose-800 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
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
                        placeholder="ENTER PROMO CODE"
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                      />
                      <button
                        type="submit"
                        disabled={!promoCode.trim() || validatePromo.isPending}
                        className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {validatePromo.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Referral Code */}
                <div className="pt-2 border-t border-slate-100">
                  {!showReferralInput && !appliedReferral ? (
                    <button
                      type="button"
                      onClick={() => setShowReferralInput(true)}
                      className="text-xs font-bold text-[#0C60FC] hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      + Have a friend&apos;s referral code?
                    </button>
                  ) : appliedReferral ? (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>REFERRAL: {appliedReferral.code} ({appliedReferral.discountPercent}% OFF)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCode("referral")}
                        className="text-xs text-rose-600 hover:text-rose-800 font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Referral Code
                      </label>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApplyCodes("referral");
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          placeholder="ENTER REFERRAL CODE"
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0C60FC] focus:ring-4 focus:ring-blue-100"
                        />
                        <button
                          type="submit"
                          disabled={!referralCode.trim() || validatePromo.isPending}
                          className="rounded-2xl bg-slate-950 px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#0C60FC] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {validatePromo.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Student & Discounts Notice */}
            {isStudentVerified ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Student Discount Active (10% OFF)
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Your institutional student status is verified. Student savings are automatically deducted from your plan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-[#0C60FC] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Are you a tertiary student?
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Verify your institutional student email in{" "}
                    <Link href="/app/settings?tab=verification" className="text-[#0C60FC] font-bold hover:underline">
                      Settings → Verification
                    </Link>{" "}
                    to receive 10% off all future subscriptions.
                  </p>
                </div>
              </div>
            )}

            {/* Peace of Mind FAQ Accordion */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-3" style={{ borderRadius: "28px" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Frequently Asked Questions
              </h3>

              {[
                {
                  q: "When will my plan or credits activate?",
                  a: "Instant! As soon as your payment is completed on Paystack, all limits, features, and credits are immediately applied to your account.",
                },
                {
                  q: "What payment methods are supported?",
                  a: "You can pay using MTN Mobile Money, Telecel Cash, AT Money, or any Visa and Mastercard debit/credit card.",
                },
                {
                  q: "Can I cancel or switch my plan later?",
                  a: "Yes, you have full control. You can manage, upgrade, or pause your subscriptions at any time in your Billing settings.",
                },
              ].map((item, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-[#0C60FC] transition py-1 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1.5 text-xs text-slate-500 leading-relaxed overflow-hidden"
                      >
                        {item.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Sticky Order Summary & Payment */}
          <div className="lg:sticky lg:top-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
              style={{ borderRadius: "28px" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="display text-xl font-bold text-slate-950">
                  Order Summary
                </h2>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Secure
                </span>
              </div>

              {/* Line Items */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between text-slate-700">
                  <div>
                    <p className="font-bold text-slate-900">
                      {selectedPackage
                        ? `${TIER_LABELS[selectedPackage.tier] ?? selectedPackage.tier}`
                        : selectedBundle
                          ? `${selectedBundle.name}`
                          : "Item"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedPackage
                        ? DURATION_LABELS[selectedPackage.durationType]
                        : selectedBundle
                          ? `${selectedBundle.credits} Generation Credits`
                          : ""}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">GHS {basePrice.toFixed(2)}</span>
                </div>

                {/* Discounts breakdown */}
                {discountResult?.discounts && discountResult.discounts.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {discountResult.discounts.map((d: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-emerald-600 text-xs font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5" />
                          {d.label} ({d.percentage}%)
                        </span>
                        <span>− GHS {((basePrice * d.percentage) / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    {discountResult.totalDiscountPercentage > 0 && (
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        Total {discountResult.totalDiscountPercentage}% discount applied
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final Total */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                      Total due today
                    </span>
                    {totalSavings > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 block">
                        You save GHS {totalSavings.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    {totalSavings > 0 && (
                      <span className="text-xs font-semibold text-slate-400 line-through mr-2">
                        GHS {basePrice.toFixed(2)}
                      </span>
                    )}
                    <span className="display text-3xl font-extrabold text-[#0C60FC]">
                      GHS {finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full rounded-2xl bg-[#0C60FC] px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to Paystack…</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay GHS {finalPrice.toFixed(2)}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Accepted Payment Channels */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mb-2.5">
                  Supported Payment Channels
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-600">
                  <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                    <Smartphone className="h-3 w-3 text-amber-600" /> MTN MoMo
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                    <Smartphone className="h-3 w-3 text-rose-600" /> Telecel Cash
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                    <Smartphone className="h-3 w-3 text-blue-600" /> AT Money
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                    <CreditCard className="h-3 w-3 text-slate-700" /> Visa / Master
                  </span>
                </div>
              </div>

              {/* Trust & Guarantee */}
              <div className="text-center space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>256-bit Bank Grade SSL Encryption</span>
                </div>
                <p className="text-[10px]">
                  Processed securely by Paystack Payments.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Sticky Checkout Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 lg:hidden shadow-lg">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total
            </span>
            <span className="display text-xl font-extrabold text-[#0C60FC]">
              GHS {finalPrice.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading}
            className="flex-1 rounded-2xl bg-[#0C60FC] px-5 py-3.5 text-xs font-extrabold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Pay with Paystack</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loader message="Loading checkout..." />}>
      <CheckoutContent />
    </Suspense>
  );
}

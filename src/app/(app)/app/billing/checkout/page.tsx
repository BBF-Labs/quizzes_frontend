"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Zap, Loader2, AlertCircle } from "lucide-react";
import {
  usePackages,
  useCreditBundles,
  useBillingStatus,
  useInitiatePlanPayment,
  useInitiateCreditPayment,
  useValidatePromoCode,
  type BillingPackage,
} from "@/hooks";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIER_LABELS: Record<string, string> = {
  cooked: "Cooked",
  cruising: "Cruising",
  locked_in: "Locked In",
};

const DURATION_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  semester: "Semester",
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const bundleId = searchParams.get("bundleId");

  const { user } = useAuth();
  const { data: allPackages = [] } = usePackages();
  const { data: creditBundles = [] } = useCreditBundles();
  const { data: billingStatus } = useBillingStatus();

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
  const [showReferral, setShowReferral] = useState(false);

  const validatePromo = useValidatePromoCode();
  const initiatePlan = useInitiatePlanPayment();
  const initiateCredits = useInitiateCreditPayment();

  const selectedPackage: BillingPackage | undefined = packageId
    ? allPackages.find((p) => p._id === packageId)
    : undefined;

  const selectedBundle = bundleId
    ? creditBundles.find((b) => b._id === bundleId)
    : undefined;

  const isCredits = !!bundleId && !packageId;

  const basePrice = selectedPackage?.priceGHS ?? selectedBundle?.priceGHS ?? 0;

  // Track all applicable discounts from the validation result
  const [discountResult, setDiscountResult] = useState<any>(null);

  const finalPrice = discountResult?.finalAmountGHS ?? basePrice;

  const isLoading = initiatePlan.isPending || initiateCredits.isPending;

  async function handleApplyCodes(type: "promo" | "referral") {
    const currentPromo = type === "promo" ? promoCode.trim() : appliedPromo?.code;
    const currentReferral =
      type === "referral" ? referralCode.trim() : appliedReferral?.code;

    if (!packageId && !bundleId) return;

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

      if (type === "promo" && promoDiscount) {
        setAppliedPromo({
          code: promoCode.trim(),
          discountPercent: promoDiscount.percentage,
        });
        toast.success(`Promo applied: ${promoDiscount.percentage}% off`);
      } else if (type === "referral" && referralDiscount) {
        setAppliedReferral({
          code: referralCode.trim(),
          discountPercent: referralDiscount.percentage,
        });
        toast.success(`Referral applied: ${referralDiscount.percentage}% off`);
      } else if (type === "promo") {
        toast.error("Invalid or expired promo code");
      } else if (type === "referral") {
        toast.error("Invalid or already used referral code");
      }

      setDiscountResult(result);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to validate code";
      toast.error(msg);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoCode("");
    // Re-validate with just referral if it exists
    if (appliedReferral) {
      handleRemoveCode("promo");
    } else {
      setDiscountResult(null);
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

  async function handleCheckout() {
    try {
      let result;
      if (isCredits && bundleId) {
        result = await initiateCredits.mutateAsync({
          bundleId,
          email: user?.email || "",
        });
      } else if (packageId) {
        result = await initiatePlan.mutateAsync({
          packageId,
          email: user?.email || "",
          promoCode: appliedPromo?.code,
          referralCode: referralCode.trim() || undefined,
        });
      } else {
        return;
      }

      if (result?.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
    }
  }

  if (!selectedPackage && !selectedBundle) {
    return (
      <div className="min-h-full px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-mono text-muted-foreground mb-4">
            No plan selected.
          </p>
          <button
            onClick={() => router.push("/app/billing")}
            className="text-xs font-mono text-primary underline underline-offset-2"
          >
            Back to plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="inline-block border border-primary/40 bg-primary/5 px-2 py-1 mb-4">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">
              Checkout
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter">
            Complete your order
          </h1>
        </motion.div>

        {/* Order summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-border/50 bg-card/40 p-5 mb-5"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
            Order summary
          </p>

          {selectedPackage && (
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">
                  {TIER_LABELS[selectedPackage.tier] ?? selectedPackage.tier}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  {DURATION_LABELS[selectedPackage.durationType] ??
                    selectedPackage.durationType}{" "}
                  plan
                </p>
              </div>
              <span className="text-sm font-mono">
                GHS {selectedPackage.priceGHS.toFixed(2)}
              </span>
            </div>
          )}

          {selectedBundle && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="size-3 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {selectedBundle.name} credits
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {selectedBundle.credits} credits
                  </p>
                </div>
              </div>
              <span className="text-sm font-mono">
                GHS {selectedBundle.priceGHS.toFixed(2)}
              </span>
            </div>
          )}

          {discountResult?.discounts && discountResult.discounts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
              {discountResult.discounts.map((d: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-primary"
                >
                  <span className="text-[10px] font-mono leading-none">
                    {d.label} ({d.percentage}%)
                  </span>
                  <span className="text-[10px] font-mono leading-none">
                    − GHS {((basePrice * d.percentage) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
              {discountResult.totalDiscountPercentage > 0 && (
                <div className="flex items-center justify-between text-muted-foreground/60 pt-1">
                  <span className="text-[9px] font-mono uppercase">
                    Total Discount
                  </span>
                  <span className="text-[9px] font-mono">
                    {discountResult.totalDiscountPercentage}%
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              Total
            </span>
            <span className="text-lg font-black tracking-tighter">
              GHS {finalPrice.toFixed(2)}
            </span>
          </div>
        </motion.div>

        {/* Promo code (plans only) */}
        {!isCredits && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
          >
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border border-border/50 bg-background px-3 gap-2">
                <Tag className="size-3 text-muted-foreground/50 shrink-0" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO CODE"
                  disabled={!!appliedPromo}
                  className="flex-1 py-2.5 text-xs font-mono bg-transparent outline-none placeholder:text-muted-foreground/40 uppercase"
                />
              </div>
              <button
                onClick={
                  appliedPromo
                    ? () => handleRemoveCode("promo")
                    : () => handleApplyCodes("promo")
                }
                disabled={
                  (!promoCode.trim() && !appliedPromo) ||
                  validatePromo.isPending
                }
                className={cn(
                  "px-4 text-[10px] font-mono uppercase tracking-[0.15em] border transition-colors",
                  appliedPromo
                    ? "border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10"
                    : "border-border hover:border-primary hover:text-primary",
                )}
              >
                {validatePromo.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : appliedPromo ? (
                  "Remove"
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Referral code (plans only) */}
        {!isCredits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            {!showReferral ? (
              <button
                onClick={() => setShowReferral(true)}
                className="text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-2"
              >
                Have a referral code?
              </button>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 flex items-center border border-border/50 bg-background px-3 gap-2">
                  <Tag className="size-3 text-muted-foreground/50 shrink-0" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="REFERRAL CODE"
                    disabled={!!appliedReferral}
                    className="flex-1 py-2.5 text-xs font-mono bg-transparent outline-none placeholder:text-muted-foreground/40 uppercase"
                  />
                </div>
                <button
                  onClick={
                    appliedReferral
                      ? () => handleRemoveCode("referral")
                      : () => handleApplyCodes("referral")
                  }
                  disabled={
                    (!referralCode.trim() && !appliedReferral) ||
                    validatePromo.isPending
                  }
                  className={cn(
                    "px-4 text-[10px] font-mono uppercase tracking-[0.15em] border transition-colors",
                    appliedReferral
                      ? "border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10"
                      : "border-border hover:border-primary hover:text-primary",
                  )}
                >
                  {validatePromo.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : appliedReferral ? (
                    "Remove"
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Student discount notice */}
        {billingStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22 }}
            className="mb-6 border border-border/30 bg-card/20 px-3 py-2 flex items-start gap-2"
          >
            <AlertCircle className="size-3 text-muted-foreground/50 mt-0.5 shrink-0" />
            <p className="text-[10px] font-mono text-muted-foreground">
              Any applicable student, referral, or loyalty discounts are applied
              automatically at checkout.
            </p>
          </motion.div>
        )}

        {/* Pay button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className={cn(
              "w-full py-3.5 text-xs font-mono uppercase tracking-[0.2em] border transition-colors flex items-center justify-center gap-2",
              isLoading
                ? "border-primary/30 bg-primary/10 text-primary/50 cursor-not-allowed"
                : "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Redirecting to Paystack...
              </>
            ) : (
              `Pay GHS ${finalPrice.toFixed(2)} with Paystack`
            )}
          </button>
          <p className="mt-3 text-[9px] font-mono text-center text-muted-foreground/40 uppercase tracking-widest">
            Secured by Paystack · GHS only
          </p>
        </motion.div>
      </div>
    </div>
  );
}

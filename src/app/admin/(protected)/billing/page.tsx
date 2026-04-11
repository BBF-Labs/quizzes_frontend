"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  X,
  Tag,
  CreditCard,
  Package2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminPromoCodes,
  useAdminCreatePromoCode,
  useAdminUpdatePromoCode,
  useAdminDeactivatePromoCode,
  useAdminPayments,
  useAdminPackages,
  type CreatePromoCodePayload,
  type AdminPackage,
  type PromoEligibility,
} from "@/hooks/admin/use-billing-admin";
import { PlanCard, PLAN_DURATION_LABELS } from "@/components/common";
import {
  type BillingPackage,
  type PlanDuration,
} from "@/hooks/common/use-billing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { PaginationController } from "@/components/common";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "promo", label: "Promo Codes", icon: Tag },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "packages", label: "Packages", icon: Package2 },
] as const;

type Tab = (typeof TABS)[number]["key"];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  success: "text-green-400 border-green-400/30 bg-green-400/10",
  failed: "text-red-400 border-red-400/30 bg-red-400/10",
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  processing: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  abandoned: "text-muted-foreground border-border/30 bg-card/30",
  reversed: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  ongoing: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  queued: "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

// ─── Promo Code Section ───────────────────────────────────────────────────────

function PromoCodeCard({
  code,
}: {
  code: import("@/hooks/admin/use-billing-admin").AdminPromoCode;
}) {
  const update = useAdminUpdatePromoCode();
  const deactivate = useAdminDeactivatePromoCode();

  const toggle = async () => {
    try {
      await update.mutateAsync({
        id: code._id,
        data: { isActive: !code.isActive },
      });
      toast.success(code.isActive ? "Code deactivated" : "Code activated");
    } catch {
      toast.error("Failed to update code");
    }
  };

  const remove = async () => {
    if (!confirm(`Deactivate promo code "${code.code}"?`)) return;
    try {
      await deactivate.mutateAsync(code._id);
      toast.success("Promo code deactivated");
    } catch {
      toast.error("Failed to deactivate code");
    }
  };

  const isExpired = code.expiresAt
    ? new Date(code.expiresAt) < new Date()
    : false;
  const eligibility = code.eligibility;
  const eligibilityBadges: string[] = [];
  if (eligibility?.newUsersOnly) eligibilityBadges.push("new users only");
  if (eligibility?.firstPurchaseOnly) eligibilityBadges.push("first purchase");
  if (eligibility?.includeCourseIds?.length) {
    eligibilityBadges.push(
      `${eligibility.requireAllCourseIds ? "all" : "any"} of ${eligibility.includeCourseIds.length} course(s)`,
    );
  }
  if (eligibility?.includeTiers?.length) {
    eligibilityBadges.push(`tiers: ${eligibility.includeTiers.join(", ")}`);
  }
  if (eligibility?.includeDurations?.length) {
    eligibilityBadges.push(
      `durations: ${eligibility.includeDurations.join(", ")}`,
    );
  }
  if (eligibility?.maxUsesPerUser) {
    eligibilityBadges.push(`max ${eligibility.maxUsesPerUser}/user`);
  }

  return (
    <div className="flex flex-col border border-border/30 bg-card/10 p-5 hover:border-border/60 transition-all group relative overflow-hidden">
      {/* Accent bar */}
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-1",
          code.isActive && !isExpired ? "bg-primary" : "bg-muted-foreground/30",
        )}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-mono font-bold text-lg tracking-widest text-primary flex items-center gap-2">
            <Tag className="size-4" />
            {code.code}
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mt-1">
            {code.type === "percentage"
              ? `${code.value}% Discount`
              : `GHS ${code.value} Flat`}
          </p>
        </div>
        <span
          className={cn(
            "text-[9px] font-mono uppercase tracking-widest px-2 py-1 border",
            code.isActive && !isExpired
              ? "text-green-400 border-green-400/30 bg-green-400/10"
              : "text-muted-foreground border-border/30 bg-card/30",
          )}
        >
          {code.isActive ? (isExpired ? "Expired" : "Active") : "Inactive"}
        </span>
      </div>

      <div className="space-y-2 mb-6 flex-1">
        <div className="flex items-center justify-between text-[11px] font-mono border-b border-border/10 pb-2">
          <span className="text-muted-foreground/50 uppercase">
            Redemptions
          </span>
          <span className="font-bold text-foreground/80">
            {code.usedCount} / {code.maxUses ?? "∞"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono border-b border-border/10 pb-2">
          <span className="text-muted-foreground/50 uppercase">
            Expiry Date
          </span>
          <span
            className={cn(
              "font-bold text-foreground/80",
              isExpired && "text-destructive",
            )}
          >
            {code.expiresAt
              ? new Date(code.expiresAt).toLocaleDateString()
              : "Never"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground/50 uppercase">Created By</span>
          <span className="font-bold text-foreground/80 truncate max-w-30">
            {code.createdBy || "System"}
          </span>
        </div>
        {eligibilityBadges.length > 0 && (
          <div className="pt-2 border-t border-border/10">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1.5">
              Eligibility
            </p>
            <div className="flex flex-wrap gap-1.5">
              {eligibilityBadges.map((badge) => (
                <span
                  key={badge}
                  className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border border-primary/20 text-primary/80 bg-primary/5"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 mt-auto border-t border-border/10">
        <button
          onClick={toggle}
          disabled={update.isPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors disabled:opacity-50"
        >
          {code.isActive ? (
            <>
              <ToggleRight className="size-3.5 text-primary/60" /> Disable
            </>
          ) : (
            <>
              <ToggleLeft className="size-3.5 text-muted-foreground" /> Enable
            </>
          )}
        </button>

        <button
          onClick={remove}
          disabled={deactivate.isPending}
          className="flex items-center justify-center p-2 border border-destructive/20 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
          title="Delete Promo Code"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function CreatePromoCodeForm({ onClose }: { onClose: () => void }) {
  const create = useAdminCreatePromoCode();
  const [form, setForm] = useState<CreatePromoCodePayload>({
    code: "",
    type: "percentage",
    value: 10,
    expiresAt: null,
    maxUses: null,
    eligibility: {},
  });
  const [courseIdsInput, setCourseIdsInput] = useState("");

  const [hasExpiry, setHasExpiry] = useState(false);
  const [hasMaxUses, setHasMaxUses] = useState(false);

  const toggleEligibilityListValue = (
    key: "includeTiers" | "includeDurations",
    value: string,
  ) => {
    setForm((prev) => {
      const current = (prev.eligibility?.[key] as string[] | undefined) || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        eligibility: {
          ...(prev.eligibility || {}),
          [key]: next,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedCourseIds = courseIdsInput
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const eligibility: PromoEligibility = {
        ...(form.eligibility || {}),
        includeCourseIds: parsedCourseIds.length ? parsedCourseIds : undefined,
      };

      await create.mutateAsync({
        ...form,
        code: form.code.toUpperCase(),
        expiresAt:
          hasExpiry && form.expiresAt
            ? new Date(form.expiresAt).toISOString()
            : null,
        maxUses:
          hasMaxUses && form.maxUses && form.maxUses > 0 ? form.maxUses : null,
        eligibility,
      });
      toast.success("Promo code created");
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to create promo code",
      );
    }
  };

  const fieldCls =
    "w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest font-bold">
          New Promo Code
        </p>
        <button
          onClick={onClose}
          className="text-muted-foreground/40 hover:text-muted-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Code *
          </label>
          <input
            required
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
            }
            placeholder="SUMMER20"
            className={fieldCls}
          />
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Type *
          </label>
          <Select
            value={form.type}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, type: v as "percentage" | "flat" }))
            }
          >
            <SelectTrigger className="w-full rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
              <SelectItem
                value="percentage"
                className="rounded-(--radius) font-mono text-xs uppercase"
              >
                Percentage (%)
              </SelectItem>
              <SelectItem
                value="flat"
                className="rounded-(--radius) font-mono text-xs uppercase"
              >
                Flat (GHS)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Value * {form.type === "percentage" ? "(%)" : "(GHS)"}
          </label>
          <input
            required
            type="number"
            min={1}
            max={form.type === "percentage" ? 100 : undefined}
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: +e.target.value }))}
            className={fieldCls}
          />
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Max Uses
          </label>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasMaxUses}
              onCheckedChange={(v) => setHasMaxUses(!!v)}
            />
            <input
              type="number"
              min={1}
              disabled={!hasMaxUses}
              value={form.maxUses ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxUses: +e.target.value }))
              }
              placeholder="Unlimited"
              className={cn(fieldCls, "flex-1", !hasMaxUses && "opacity-40")}
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Expiry Date
          </label>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasExpiry}
              onCheckedChange={(v) => setHasExpiry(!!v)}
            />
            <div
              className={cn(
                "flex flex-1 items-center gap-2",
                !hasExpiry && "opacity-40 pointer-events-none",
              )}
            >
              <DateTimePicker
                date={form.expiresAt ? new Date(form.expiresAt) : undefined}
                setDate={(d) =>
                  setForm((f) => ({ ...f, expiresAt: d.toISOString() }))
                }
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="col-span-2 border border-border/30 bg-card/20 p-3 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest font-bold text-primary/90">
            Eligibility Rules
          </p>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
              <Checkbox
                checked={!!form.eligibility?.newUsersOnly}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      newUsersOnly: !!v,
                    },
                  }))
                }
              />
              New users only
            </label>

            <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
              <Checkbox
                checked={!!form.eligibility?.firstPurchaseOnly}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      firstPurchaseOnly: !!v,
                    },
                  }))
                }
              />
              First purchase only
            </label>

            <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
              <Checkbox
                checked={!!form.eligibility?.hasCompletedOnboarding}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      hasCompletedOnboarding: !!v,
                    },
                  }))
                }
              />
              Onboarding completed
            </label>

            <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
              <Checkbox
                checked={!!form.eligibility?.hasPendingReferralReward}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      hasPendingReferralReward: !!v,
                    },
                  }))
                }
              />
              Pending referral reward
            </label>
          </div>

          <div>
            <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
              Eligible Course IDs (comma separated)
            </label>
            <input
              value={courseIdsInput}
              onChange={(e) => setCourseIdsInput(e.target.value)}
              placeholder="66f0...a01, 66f0...a02"
              className={fieldCls}
            />
            <label className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
              <Checkbox
                checked={!!form.eligibility?.requireAllCourseIds}
                onCheckedChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      requireAllCourseIds: !!v,
                    },
                  }))
                }
              />
              Require all listed courses
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1">
                Allowed Tiers
              </p>
              <div className="flex flex-wrap gap-2">
                {(["cooked", "cruising", "locked_in"] as const).map((tier) => (
                  <label
                    key={tier}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80"
                  >
                    <Checkbox
                      checked={!!form.eligibility?.includeTiers?.includes(tier)}
                      onCheckedChange={() =>
                        toggleEligibilityListValue("includeTiers", tier)
                      }
                    />
                    {tier}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1">
                Allowed Durations
              </p>
              <div className="flex flex-wrap gap-2">
                {(["daily", "weekly", "semester"] as const).map((duration) => (
                  <label
                    key={duration}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80"
                  >
                    <Checkbox
                      checked={
                        !!form.eligibility?.includeDurations?.includes(duration)
                      }
                      onCheckedChange={() =>
                        toggleEligibilityListValue("includeDurations", duration)
                      }
                    />
                    {duration}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                Min Order (GHS)
              </label>
              <input
                type="number"
                min={0}
                value={form.eligibility?.minOrderAmountGHS ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      minOrderAmountGHS: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
                className={fieldCls}
              />
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                Max Order (GHS)
              </label>
              <input
                type="number"
                min={0}
                value={form.eligibility?.maxOrderAmountGHS ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      maxOrderAmountGHS: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
                className={fieldCls}
              />
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                Max Uses / User
              </label>
              <input
                type="number"
                min={1}
                value={form.eligibility?.maxUsesPerUser ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      maxUsesPerUser: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
                className={fieldCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                Min Streak Days
              </label>
              <input
                type="number"
                min={0}
                value={form.eligibility?.minStreakDays ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      minStreakDays: e.target.value
                        ? Number(e.target.value)
                        : 0,
                    },
                  }))
                }
                className={fieldCls}
              />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                Inactive For (Days)
              </label>
              <input
                type="number"
                min={1}
                value={form.eligibility?.inactiveForDays ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      inactiveForDays: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
                className={fieldCls}
              />
            </div>
            <div>
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
                First N Days Signup
              </label>
              <input
                type="number"
                min={1}
                value={form.eligibility?.firstNDaysAfterSignup ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eligibility: {
                      ...(f.eligibility || {}),
                      firstNDaysAfterSignup: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
                className={fieldCls}
              />
            </div>
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {create.isPending ? "Creating…" : "Create Code"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function PromoCodesTab() {
  const { data: codes = [], isLoading } = useAdminPromoCodes();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">
          {codes.length} code{codes.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 bg-primary px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all"
        >
          <Plus className="size-3" />
          New Code
        </button>
      </div>

      {showCreate && (
        <CreatePromoCodeForm onClose={() => setShowCreate(false)} />
      )}

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse bg-card/40 border border-border/30"
            />
          ))}
        </div>
      )}

      {!isLoading && codes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center border border-border/20">
          <Tag className="size-5 text-muted-foreground/30" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
            No promo codes yet
          </p>
        </div>
      )}

      {!isLoading && codes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {codes.map((c) => (
            <PromoCodeCard key={c._id} code={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payments Section ─────────────────────────────────────────────────────────

const PAYMENTS_LIMIT = 20;

function PaymentsTab() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: paymentsData, isLoading } = useAdminPayments({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    page,
    limit: PAYMENTS_LIMIT,
  });

  const payments = paymentsData?.data ?? [];
  const total = paymentsData?.pagination?.total ?? 0;
  const totalPages = paymentsData?.pagination?.totalPages ?? 1;

  const handleFilterChange = (key: "status" | "type", value: string) => {
    setPage(1);
    if (key === "status") setStatusFilter(value === "all" ? "" : value);
    else setTypeFilter(value === "all" ? "" : value);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => handleFilterChange("status", v)}
        >
          <SelectTrigger className="w-auto min-w-35 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
            <SelectItem
              value="all"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              All Statuses
            </SelectItem>
            <SelectItem
              value="success"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Success
            </SelectItem>
            <SelectItem
              value="failed"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Failed
            </SelectItem>
            <SelectItem
              value="pending"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Pending
            </SelectItem>
            <SelectItem
              value="processing"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Processing
            </SelectItem>
            <SelectItem
              value="abandoned"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Abandoned
            </SelectItem>
            <SelectItem
              value="reversed"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Reversed
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter || "all"}
          onValueChange={(v) => handleFilterChange("type", v)}
        >
          <SelectTrigger className="w-auto min-w-30 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
            <SelectItem
              value="all"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              All Types
            </SelectItem>
            <SelectItem
              value="plan"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Plan
            </SelectItem>
            <SelectItem
              value="credits"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Credits
            </SelectItem>
            <SelectItem
              value="course"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Course
            </SelectItem>
            <SelectItem
              value="quiz"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Quiz
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] font-mono text-muted-foreground/40 ml-auto">
          {total} result{total !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse bg-card/40 border border-border/30"
            />
          ))}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 border border-border/20">
          <CreditCard className="size-5 text-muted-foreground/30" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
            No payments found
          </p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <div className="border border-border/30">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-1 border-b border-border/20">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 flex-1">
              Reference
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-20 text-right">
              Amount
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-16">
              Type
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-24">
              Date
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-24">
              Status
            </span>
          </div>
          <div className="divide-y divide-border/20">
            {payments.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-4 bg-card/30 px-4 py-2.5 hover:bg-card/50 transition-all"
              >
                <span className="font-mono text-[11px] text-foreground/80 flex-1 truncate">
                  {p.reference}
                </span>
                <span className="font-mono font-bold text-[12px] w-20 text-right">
                  GHS {(p.amount ?? 0).toFixed(2)}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 w-16">
                  {p.type}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/50 w-24">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border rounded-(--radius) w-24 text-center",
                    PAYMENT_STATUS_COLORS[p.status] ??
                      "text-muted-foreground border-border/30",
                  )}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
          <PaginationController
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

// ─── Packages Section ─────────────────────────────────────────────────────────

const DURATIONS: PlanDuration[] = ["daily", "weekly", "semester"];
const TIER_ORDER: Record<string, number> = {
  cooked: 0,
  cruising: 1,
  locked_in: 2,
};

function toCardPackage(pkg: AdminPackage): BillingPackage {
  return {
    _id: pkg._id,
    name: pkg.name,
    tier: pkg.tier!,
    durationType: pkg.durationType!,
    priceGHS: pkg.priceGHS ?? pkg.price,
    isActive: pkg.isActive,
    limits: {
      tutorSessionsPerDay: pkg.limits?.tutorSessionsPerDay ?? null,
      quizGenerationsPerDay: pkg.limits?.quizGenerationsPerDay ?? null,
      flashcardSetsPerDay: pkg.limits?.flashcardSetsPerDay ?? null,
      mindMapsPerDay: pkg.limits?.mindMapsPerDay ?? null,
      materialUploadsPerDay: pkg.limits?.materialUploadsPerDay ?? null,
      pdfExport: pkg.limits?.pdfExport ?? false,
      analyticsLevel: pkg.limits?.analyticsLevel ?? "basic",
      priorityProcessing: pkg.limits?.priorityProcessing ?? false,
      earlyFeatureAccess: pkg.limits?.earlyFeatureAccess ?? false,
      bonusCreditsOnSignup: pkg.limits?.bonusCreditsOnSignup ?? 0,
    },
  };
}

function PackagesTab() {
  const { data: packages = [], isLoading } = useAdminPackages();

  const subPackages = packages.filter((p) => p.tier && p.durationType);

  const grouped = DURATIONS.map((duration) => ({
    duration,
    pkgs: subPackages
      .filter((p) => p.durationType === duration)
      .sort((a, b) => (TIER_ORDER[a.tier!] ?? 0) - (TIER_ORDER[b.tier!] ?? 0))
      .map(toCardPackage),
  }));

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
        {subPackages.length} package{subPackages.length !== 1 ? "s" : ""} ·
        read-only
      </p>

      {isLoading && (
        <div className="space-y-6">
          {DURATIONS.map((d) => (
            <div key={d} className="space-y-2">
              <div className="h-3 w-16 animate-pulse bg-card/40" />
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse bg-card/40 border border-border/30"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && subPackages.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 border border-border/20">
          <Package2 className="size-5 text-muted-foreground/30" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
            No packages configured
          </p>
        </div>
      )}

      {!isLoading && subPackages.length > 0 && (
        <div className="space-y-8">
          {grouped.map(({ duration, pkgs }) =>
            pkgs.length === 0 ? null : (
              <div key={duration}>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
                  {PLAN_DURATION_LABELS[duration]}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pkgs.map((pkg, i) => (
                    <PlanCard
                      key={pkg._id}
                      pkg={pkg}
                      isPopular={pkg.tier === "cruising"}
                      delay={i * 0.04}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBillingPage() {
  const [tab, setTab] = useState<Tab>("promo");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-2 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Billing
          </span>
        </div>
        <h1 className="text-2xl font-mono font-bold tracking-widest uppercase">
          Billing & Payments
        </h1>
        <p className="text-[11px] font-mono text-muted-foreground/50 mt-1 uppercase tracking-widest">
          Promo codes, payments, and subscription packages
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-border/30 w-full">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList
            variant="line"
            className="bg-transparent w-auto min-w-full justify-start h-auto px-0 overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap shrink-0 border-none"
          >
            {TABS.map(({ key, label, icon: Icon }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="relative rounded-none! border-none bg-transparent data-[state=active]:bg-transparent px-6 pb-4 text-muted-foreground data-[state=active]:text-primary transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200"
              >
                <Icon className="size-3 mr-1.5" />
                {label.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {tab === "promo" && <PromoCodesTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "packages" && <PackagesTab />}
      </motion.div>
    </div>
  );
}

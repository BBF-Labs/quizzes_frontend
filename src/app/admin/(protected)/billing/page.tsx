"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, X, Tag, CreditCard, Package2, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminPromoCodes,
  useAdminCreatePromoCode,
  useAdminUpdatePromoCode,
  useAdminDeactivatePromoCode,
  useAdminPayments,
  useAdminPackages,
  type CreatePromoCodePayload,
} from "@/hooks/admin/use-billing-admin";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "promo", label: "Promo Codes", icon: Tag },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "packages", label: "Packages", icon: Package2 },
] as const;

type Tab = (typeof TABS)[number]["key"];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  success:    "text-green-400 border-green-400/30 bg-green-400/10",
  failed:     "text-red-400 border-red-400/30 bg-red-400/10",
  pending:    "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  processing: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  abandoned:  "text-muted-foreground border-border/30 bg-card/30",
  reversed:   "text-orange-400 border-orange-400/30 bg-orange-400/10",
  ongoing:    "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  queued:     "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

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

// ─── Promo Code Section ───────────────────────────────────────────────────────

function PromoCodeRow({
  code,
}: {
  code: import("@/hooks/admin/use-billing-admin").AdminPromoCode;
}) {
  const update = useAdminUpdatePromoCode();
  const deactivate = useAdminDeactivatePromoCode();

  const toggle = async () => {
    try {
      await update.mutateAsync({ id: code._id, data: { isActive: !code.isActive } });
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

  const isExpired = code.expiresAt ? new Date(code.expiresAt) < new Date() : false;

  return (
    <div className="flex items-center gap-4 border border-border/30 bg-card/30 px-4 py-3 hover:border-border/50 transition-all">
      {/* Code */}
      <span className="font-mono font-bold text-sm text-foreground min-w-[10rem]">
        {code.code}
      </span>

      {/* Type + value */}
      <span className="text-[10px] font-mono text-muted-foreground min-w-[6rem]">
        {code.type === "percentage" ? `${code.value}% off` : `GHS ${code.value} off`}
      </span>

      {/* Uses */}
      <span className="text-[10px] font-mono text-muted-foreground min-w-[5rem]">
        {code.usedCount} / {code.maxUses ?? "∞"} uses
      </span>

      {/* Expires */}
      <span className={cn("text-[10px] font-mono flex-1", isExpired ? "text-destructive/70" : "text-muted-foreground/60")}>
        {code.expiresAt
          ? `Expires ${new Date(code.expiresAt).toLocaleDateString()}`
          : "No expiry"}
        {isExpired && " · Expired"}
      </span>

      {/* Status + actions */}
      <div className="flex items-center gap-3">
        <span className={cn(
          "text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border",
          code.isActive && !isExpired
            ? "text-green-400 border-green-400/30 bg-green-400/10"
            : "text-muted-foreground border-border/30 bg-card/30",
        )}>
          {code.isActive && !isExpired ? "Active" : "Inactive"}
        </span>

        <button
          onClick={toggle}
          disabled={update.isPending}
          title={code.isActive ? "Deactivate" : "Activate"}
          className="text-muted-foreground/40 hover:text-primary transition-colors"
        >
          {code.isActive
            ? <ToggleRight className="size-4 text-primary/60" />
            : <ToggleLeft className="size-4" />}
        </button>

        <button
          onClick={remove}
          disabled={deactivate.isPending}
          className="text-muted-foreground/40 hover:text-destructive transition-colors"
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
  });

  const [hasExpiry, setHasExpiry] = useState(false);
  const [hasMaxUses, setHasMaxUses] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        ...form,
        code: form.code.toUpperCase(),
        expiresAt: hasExpiry ? form.expiresAt : null,
        maxUses: hasMaxUses ? form.maxUses : null,
      });
      toast.success("Promo code created");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create promo code");
    }
  };

  const fieldCls = "w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest font-bold">New Promo Code</p>
        <button onClick={onClose} className="text-muted-foreground/40 hover:text-muted-foreground">
          <X className="size-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Code *</label>
          <input
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="SUMMER20"
            className={fieldCls}
          />
        </div>

        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percentage" | "flat" }))}
            className={fieldCls}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat (GHS)</option>
          </select>
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
            <input
              type="checkbox"
              checked={hasMaxUses}
              onChange={(e) => setHasMaxUses(e.target.checked)}
              className="size-3"
            />
            <input
              type="number"
              min={1}
              disabled={!hasMaxUses}
              value={form.maxUses ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, maxUses: +e.target.value }))}
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
            <input
              type="checkbox"
              checked={hasExpiry}
              onChange={(e) => setHasExpiry(e.target.checked)}
              className="size-3"
            />
            <input
              type="date"
              disabled={!hasExpiry}
              value={form.expiresAt ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className={cn(fieldCls, "flex-1", !hasExpiry && "opacity-40")}
            />
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors">
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

      {showCreate && <CreatePromoCodeForm onClose={() => setShowCreate(false)} />}

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-card/40 border border-border/30" />
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
        <div className="space-y-1.5">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 min-w-[10rem]">Code</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 min-w-[6rem]">Discount</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 min-w-[5rem]">Uses</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 flex-1">Expiry</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40">Status</span>
          </div>
          {codes.map((c) => (
            <PromoCodeRow key={c._id} code={c} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payments Section ─────────────────────────────────────────────────────────

function PaymentsTab() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: payments = [], isLoading } = useAdminPayments({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const filterCls = "border border-border/50 bg-background/40 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterCls}>
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="abandoned">Abandoned</option>
          <option value="reversed">Reversed</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={filterCls}>
          <option value="">All Types</option>
          <option value="plan">Plan</option>
          <option value="credits">Credits</option>
          <option value="course">Course</option>
          <option value="quiz">Quiz</option>
        </select>
        <p className="text-[10px] font-mono text-muted-foreground/40 ml-auto">
          {payments.length} result{payments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-11 animate-pulse bg-card/40 border border-border/30" />
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
        <div className="space-y-1.5">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 flex-1">Reference</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-20 text-right">Amount</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-16">Type</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-24">Date</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/40 w-24">Status</span>
          </div>
          {payments.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-4 border border-border/30 bg-card/30 px-4 py-2.5 hover:border-border/50 transition-all"
            >
              <span className="font-mono text-[11px] text-foreground/80 flex-1 truncate">
                {p.reference}
              </span>
              <span className="font-mono font-bold text-[12px] w-20 text-right">
                GHS {(p.amount / 100).toFixed(2)}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 w-16">
                {p.type}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/50 w-24">
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
              <span className={cn(
                "text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border w-24 text-center",
                PAYMENT_STATUS_COLORS[p.status] ?? "text-muted-foreground border-border/30",
              )}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Packages Section ─────────────────────────────────────────────────────────

function PackagesTab() {
  const { data: packages = [], isLoading } = useAdminPackages();

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
        {packages.length} package{packages.length !== 1 ? "s" : ""} · read-only
      </p>

      {isLoading && (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse bg-card/40 border border-border/30" />
          ))}
        </div>
      )}

      {!isLoading && packages.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 border border-border/20">
          <Package2 className="size-5 text-muted-foreground/30" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
            No packages configured
          </p>
        </div>
      )}

      {!isLoading && packages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={cn(
                "border bg-card/30 p-4 space-y-3",
                pkg.isActive ? "border-border/40" : "border-border/20 opacity-50",
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono font-bold text-sm">
                    {pkg.tier ? TIER_LABELS[pkg.tier] : pkg.name}
                  </p>
                  {pkg.tier && pkg.durationType && (
                    <p className="text-[10px] font-mono text-muted-foreground/60">
                      {DURATION_LABELS[pkg.durationType]}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-lg">
                    GHS {pkg.priceGHS ?? pkg.price}
                  </p>
                  <span className={cn(
                    "text-[8px] font-mono uppercase tracking-widest px-1 py-0.5 border",
                    pkg.isActive
                      ? "text-green-400 border-green-400/30 bg-green-400/10"
                      : "text-muted-foreground border-border/30",
                  )}>
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {pkg.limits && (
                <div className="space-y-1 border-t border-border/20 pt-3">
                  {[
                    ["Tutor sessions/day", pkg.limits.tutorSessionsPerDay],
                    ["Quiz gen/day", pkg.limits.quizGenerationsPerDay],
                    ["Flashcard sets/day", pkg.limits.flashcardSetsPerDay],
                    ["Mind maps/day", pkg.limits.mindMapsPerDay],
                    ["Material uploads/day", pkg.limits.materialUploadsPerDay],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between">
                      <span className="text-[9px] font-mono text-muted-foreground/50">{label as string}</span>
                      <span className={cn(
                        "text-[9px] font-mono",
                        val === null ? "text-primary" : "text-foreground",
                      )}>
                        {val === null ? "∞" : (val ?? "–")}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-muted-foreground/50">PDF Export</span>
                    <span className="text-[9px] font-mono">{pkg.limits.pdfExport ? "✓" : "✗"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-mono text-muted-foreground/50">Analytics</span>
                    <span className="text-[9px] font-mono capitalize">{pkg.limits.analyticsLevel ?? "–"}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
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
      <div className="flex border-b border-border/30">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest border-b-2 transition-all",
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground/50 hover:text-muted-foreground",
            )}
          >
            <Icon className="size-3" />
            {label}
          </button>
        ))}
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

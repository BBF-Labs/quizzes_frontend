"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flag, Plus, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FeatureFlag,
  useFeatureFlags,
} from "@/hooks/admin/use-feature-flags";
import { useAuth } from "@/contexts/auth-context";
import { FeatureFlagRow } from "./feature-flag-row";
import { CreateFlagModal } from "./feature-flag-modal";
import { AuditModal } from "./audit-modal";

export default function FeatureFlagsPage() {
  const { data: flags, isLoading, refetch } = useFeatureFlags();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [createOpen, setCreateOpen] = React.useState(false);
  const [auditFlag, setAuditFlag] = React.useState<FeatureFlag | null>(null);

  const summary = React.useMemo(() => {
    const total = flags?.length ?? 0;
    const enabled = flags?.filter((f) => f.enabled).length ?? 0;
    const byType: Record<string, number> = {};
    flags?.forEach((f) => {
      byType[f.type] = (byType[f.type] ?? 0) + 1;
    });
    return { total, enabled, byType };
  }, [flags]);

  if (!isSuperAdmin) {
    return <ForbiddenNotice />;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            System
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              Feature Flags
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
              Runtime Toggles &amp; Rollouts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="rounded-none size-9"
              disabled={isLoading}
            >
              <RefreshCcw
                className={cn("size-4", isLoading && "animate-spin")}
              />
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 h-9 px-4"
            >
              <Plus className="size-3.5" />
              New Flag
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryStat
          label="Total Flags"
          value={summary.total}
          accent="text-foreground"
        />
        <SummaryStat
          label="Enabled"
          value={summary.enabled}
          accent="text-green-500"
        />
        <SummaryStat
          label="Disabled"
          value={summary.total - summary.enabled}
          accent="text-muted-foreground"
        />
        <SummaryStat
          label="Types"
          value={Object.keys(summary.byType).length}
          accent="text-primary"
        />
      </div>

      {/* Flag list */}
      {isLoading ? (
        <div className="border border-border/40 bg-card/40 p-12 text-center text-muted-foreground font-mono text-[10px] uppercase tracking-widest animate-pulse">
          Loading feature flags…
        </div>
      ) : !flags || flags.length === 0 ? (
        <Card className="rounded-none border-border/50 bg-card/40">
          <CardContent className="p-12 text-center space-y-3">
            <Flag className="size-10 text-muted-foreground/30 mx-auto" />
            <p className="font-mono text-xs uppercase tracking-widest text-foreground">
              No feature flags yet
            </p>
            <p className="font-mono text-[10px] text-muted-foreground max-w-sm mx-auto">
              Migration 049 seeds the starter flags. If you see zero rows,
              re-run the migration or create one manually.
            </p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="rounded-none font-mono text-[10px] uppercase tracking-widest mt-2"
            >
              <Plus className="size-3.5" />
              Create First Flag
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <FeatureFlagRow
              key={flag.key}
              flag={flag}
              onViewAudit={setAuditFlag}
            />
          ))}
        </div>
      )}

      <CreateFlagModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(created) => {
          setAuditFlag(created);
        }}
      />

      <AuditModal flag={auditFlag} onClose={() => setAuditFlag(null)} />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card className="rounded-none border-border/50 bg-card/40">
      <CardContent className="pt-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-2xl font-mono font-bold mt-2", accent)}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function ForbiddenNotice() {
  return (
    <div className="border border-destructive/40 bg-destructive/5 p-8 rounded-none flex items-start gap-3 max-w-2xl">
      <ShieldCheck className="size-5 text-destructive shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-mono text-sm uppercase tracking-widest font-bold text-destructive">
          Super Admin Only
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          The feature flag system can change runtime behaviour across the whole
          platform. It is gated to{" "}
          <code className="text-foreground">super_admin</code> by design. If
          you need access, ask a super admin to promote your role.
        </p>
      </div>
    </div>
  );
}
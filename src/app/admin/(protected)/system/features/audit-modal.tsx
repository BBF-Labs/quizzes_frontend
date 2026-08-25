"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  History,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  FeatureFlag,
  FeatureFlagAuditEntry,
  useFeatureFlagAudit,
} from "@/hooks/admin/use-feature-flags";

interface AuditModalProps {
  flag: FeatureFlag | null;
  onClose: () => void;
}

const ACTION_STYLES: Record<string, string> = {
  create: "border-green-500/40 text-green-500 bg-green-500/5",
  enable: "border-green-500/40 text-green-500 bg-green-500/5",
  disable: "border-yellow-500/40 text-yellow-500 bg-yellow-500/5",
  update: "border-blue-500/40 text-blue-500 bg-blue-500/5",
  delete: "border-destructive/40 text-destructive bg-destructive/5",
};

export function AuditModal({ flag, onClose }: AuditModalProps) {
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [flag?.key]);

  const audit = useFeatureFlagAudit(flag?.key ?? null, page, 20);

  return (
    <Dialog open={!!flag} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-none border-border/50 bg-card/95 backdrop-blur-xl sm:max-w-[680px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-mono text-base uppercase tracking-[0.2em]">
            Audit Log
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {flag ? (
              <>
                <code className="text-primary">{flag.key}</code> · {flag.name}
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {audit.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Loading audit history…
              </span>
            </div>
          ) : !audit.data || audit.data.data.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-3">
              <History className="size-8 text-muted-foreground/20 mx-auto" />
              <p className="font-mono text-[10px] uppercase tracking-widest">
                No audit entries yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {audit.data.data.map((entry) => (
                <AuditEntry key={entry._id} entry={entry} />
              ))}
            </div>
          )}
        </div>

        {audit.data && audit.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/30 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Page {audit.data.pagination.page} / {audit.data.pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || audit.isFetching}
                className="rounded-none size-8"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPage((p) =>
                    Math.min(audit.data!.pagination.totalPages, p + 1),
                  )
                }
                disabled={
                  page >= audit.data.pagination.totalPages || audit.isFetching
                }
                className="rounded-none size-8"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuditEntry({ entry }: { entry: FeatureFlagAuditEntry }) {
  const actionStyle =
    ACTION_STYLES[entry.action] ??
    "border-border text-muted-foreground bg-muted/20";

  return (
    <div className="border border-border/40 bg-background/40 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={cn(
            "px-2 py-0.5 text-[9px] font-bold border uppercase tracking-widest",
            actionStyle,
          )}
        >
          {entry.action}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {format(new Date(entry.performedAt), "MMM dd, yyyy HH:mm:ss")}
        </span>
      </div>

      {entry.reason && (
        <p className="font-mono text-[11px] text-foreground leading-relaxed">
          {entry.reason}
        </p>
      )}

      <p className="font-mono text-[10px] text-muted-foreground">
        By <code className="text-primary">{entry.performedBy}</code>
      </p>

      {entry.action === "update" && entry.after && (
        <details className="font-mono text-[10px] text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground uppercase tracking-widest">
            Show changes
          </summary>
          <pre className="mt-2 p-3 bg-background/60 border border-border/30 overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(
              diffBetween(entry.before ?? {}, entry.after ?? {}),
              null,
              2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

function diffBetween(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, { from: unknown; to: unknown }> {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  keys.forEach((k) => {
    const a = before[k];
    const b = after[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out[k] = { from: a, to: b };
    }
  });
  return out;
}
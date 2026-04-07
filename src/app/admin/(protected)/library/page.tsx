"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  X,
} from "lucide-react";
import {
  useAdminLibrary,
  useReviewLibraryItem,
  type AdminLibraryItem,
  type LibraryStatus,
} from "@/hooks/admin/use-admin-library";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeLabel(mime: string) {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("docx")) return "DOCX";
  if (mime.includes("presentation") || mime.includes("pptx")) return "PPTX";
  if (mime.includes("text")) return "TXT";
  return "FILE";
}

const STATUS_CONFIG = {
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    className: "text-amber-500 border-amber-500/30 bg-amber-500/5",
  },
  published: {
    label: "Published",
    icon: CheckCircle2,
    className: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "text-destructive border-destructive/30 bg-destructive/5",
  },
} satisfies Record<LibraryStatus, { label: string; icon: React.ElementType; className: string }>;

// ─── Reject Dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  item,
  onConfirm,
  onCancel,
  isPending,
}: {
  item: AdminLibraryItem;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md border border-destructive/40 bg-card p-6 shadow-xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-destructive mb-1">
              Reject Submission
            </p>
            <p className="font-mono font-bold text-sm truncate max-w-xs">{item.title}</p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground/40 hover:text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1.5">
            Reason <span className="text-muted-foreground/30">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Duplicate material, insufficient quality…"
            rows={3}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-destructive/50 resize-none transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 font-mono text-[10px] uppercase tracking-widest h-9"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 font-mono text-[10px] uppercase tracking-widest h-9"
            onClick={() => onConfirm(reason)}
            disabled={isPending}
          >
            {isPending ? "Rejecting…" : "Reject"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LibraryRow({
  item,
  onPublish,
  onReject,
  isPending,
}: {
  item: AdminLibraryItem;
  onPublish: (id: string) => void;
  onReject: (item: AdminLibraryItem) => void;
  isPending: boolean;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/30 bg-card/20 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      {/* Left: Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary/60 border border-primary/20 px-1.5 py-0.5">
            {mimeLabel(item.materialId.mimeType)}
          </span>
          <span className={cn("flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest border px-1.5 py-0.5", cfg.className)}>
            <StatusIcon className="size-2.5" />
            {cfg.label}
          </span>
        </div>

        <p className="font-bold text-sm leading-snug truncate">{item.title}</p>

        {item.description && (
          <p className="text-[11px] font-mono text-muted-foreground/50 line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {item.submittedBy && (
            <span className="text-[10px] font-mono text-muted-foreground/40 flex items-center gap-1">
              <Users className="size-2.5" />
              {item.submittedBy.username}
            </span>
          )}
          {item.universityId && (
            <span className="text-[10px] font-mono text-muted-foreground/40 flex items-center gap-1">
              <BookOpen className="size-2.5" />
              {item.universityId.name}
            </span>
          )}
          {item.courseId && (
            <span className="text-[10px] font-mono text-muted-foreground/40 flex items-center gap-1">
              <FileText className="size-2.5" />
              {item.courseId.code}
            </span>
          )}
          <span className="text-[10px] font-mono text-muted-foreground/30">
            {fileSize(item.materialId.size)}
            {item.materialId.pageCount > 0 && ` · ${item.materialId.pageCount}p`}
          </span>
          {item.useCount > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground/30">
              {item.useCount} {item.useCount === 1 ? "use" : "uses"}
            </span>
          )}
        </div>

        {item.status === "rejected" && item.rejectionReason && (
          <p className="text-[10px] font-mono text-destructive/60 mt-1">
            Reason: {item.rejectionReason}
          </p>
        )}
      </div>

      {/* Right: Actions */}
      {item.status === "pending_review" && (
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            className="h-8 text-[10px] font-mono gap-1.5"
            onClick={() => onPublish(item._id)}
            disabled={isPending}
          >
            <CheckCircle2 className="size-3" />
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] font-mono gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => onReject(item)}
            disabled={isPending}
          >
            <XCircle className="size-3" />
            Reject
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TAB_TRIGGER_CLS =
  "relative rounded-none! border-none bg-transparent data-[state=active]:bg-transparent px-6 pb-4 text-muted-foreground data-[state=active]:text-primary transition-all after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-200";

export default function AdminLibraryPage() {
  const [statusFilter, setStatusFilter] = useState<LibraryStatus | "all">("pending_review");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<AdminLibraryItem | null>(null);

  const { data, isLoading } = useAdminLibrary({
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    page,
    limit: 20,
  });
  const review = useReviewLibraryItem();

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const handlePublish = async (id: string) => {
    try {
      await review.mutateAsync({ id, action: "publish" });
      toast.success("Item published to library");
    } catch {
      toast.error("Failed to publish item");
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await review.mutateAsync({ id: rejectTarget._id, action: "reject", rejectionReason: reason });
      toast.success("Item rejected");
      setRejectTarget(null);
    } catch {
      toast.error("Failed to reject item");
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block border border-primary/60 px-2 py-1 mb-2 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Content
          </span>
        </div>
        <h1 className="text-2xl font-mono font-bold tracking-widest uppercase">
          Public Library
        </h1>
        <p className="text-[11px] font-mono text-muted-foreground/50 mt-1 uppercase tracking-widest">
          Review submissions and manage the public study catalogue
        </p>
      </motion.div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => { setStatusFilter(v as LibraryStatus | "all"); setPage(1); }}
      >
        <div className="border-b border-border/30 w-full">
          <TabsList
            variant="line"
            className="bg-transparent w-auto min-w-full justify-start h-auto px-0 overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap shrink-0 border-none"
          >
            <TabsTrigger value="pending_review" className={TAB_TRIGGER_CLS}>
              PENDING REVIEW
            </TabsTrigger>
            <TabsTrigger value="published" className={TAB_TRIGGER_CLS}>
              PUBLISHED
            </TabsTrigger>
            <TabsTrigger value="rejected" className={TAB_TRIGGER_CLS}>
              REJECTED
            </TabsTrigger>
            <TabsTrigger value="all" className={TAB_TRIGGER_CLS}>
              ALL
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <motion.div
          key={statusFilter}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="pt-2"
        >
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse bg-card/40 border border-border/30" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/30">
              <BookOpen className="size-10 text-muted-foreground/20 mb-3" />
              <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                No items
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <LibraryRow
                  key={item._id}
                  item={item}
                  onPublish={handlePublish}
                  onReject={setRejectTarget}
                  isPending={review.isPending}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-mono"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-[10px] font-mono text-muted-foreground/50">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-mono"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </Tabs>

      {/* Reject Dialog */}
      {rejectTarget && (
        <RejectDialog
          item={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          isPending={review.isPending}
        />
      )}
    </div>
  );
}

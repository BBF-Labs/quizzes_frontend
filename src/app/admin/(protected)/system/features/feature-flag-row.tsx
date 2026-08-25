"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  History,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  FeatureFlag,
  useDeleteFeatureFlag,
  useUpdateFeatureFlag,
} from "@/hooks/admin/use-feature-flags";

interface FeatureFlagRowProps {
  flag: FeatureFlag;
  onViewAudit: (flag: FeatureFlag) => void;
}

export function FeatureFlagRow({ flag, onViewAudit }: FeatureFlagRowProps) {
  const update = useUpdateFeatureFlag();
  const remove = useDeleteFeatureFlag();

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  // Local edit state — initialised from the flag, but the flag prop is the
  // source of truth on save.
  const [name, setName] = React.useState(flag.name);
  const [description, setDescription] = React.useState(flag.description);
  const [reason, setReason] = React.useState("");
  const [deleteReason, setDeleteReason] = React.useState("");
  const [editError, setEditError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editOpen) {
      setName(flag.name);
      setDescription(flag.description);
      setReason("");
      setEditError(null);
    }
  }, [editOpen, flag.name, flag.description]);

  const handleToggle = (next: boolean) => {
    update.mutate(
      { key: flag.key, body: { enabled: next, reason: reason || undefined } },
      {
        onSuccess: () => {
          toast.success(
            `Flag "${flag.key}" ${next ? "enabled" : "disabled"}.`,
          );
          setReason("");
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error
              ? err.message
              : `Failed to update "${flag.key}".`;
          toast.error(msg);
        },
      },
    );
  };

  const handleSaveEdit = () => {
    setEditError(null);
    update.mutate(
      {
        key: flag.key,
        body: {
          name: name.trim(),
          description: description.trim(),
          reason: reason || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Flag "${flag.key}" updated.`);
          setEditOpen(false);
        },
        onError: (err: unknown) => {
          setEditError(
            err instanceof Error ? err.message : "Failed to update flag.",
          );
        },
      },
    );
  };

  const handleDelete = () => {
    remove.mutate(
      { key: flag.key, reason: deleteReason || undefined },
      {
        onSuccess: () => {
          toast.success(`Flag "${flag.key}" deleted.`);
          setDeleteOpen(false);
        },
        onError: (err: unknown) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to delete flag.",
          );
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="group border border-border/50 bg-card/40 hover:border-border transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 p-5">
        {/* Left — meta + value editor */}
        <div className="space-y-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-foreground truncate">
              {flag.name}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-1.5 py-0.5 border border-border/50 bg-background/50">
              {flag.type}
            </span>
            <code className="font-mono text-[10px] text-primary tracking-wide bg-primary/5 px-1.5 py-0.5 border border-primary/20">
              {flag.key}
            </code>
            <span
              className={cn(
                "size-1.5 rounded-full",
                flag.enabled ? "bg-green-500" : "bg-muted-foreground/40",
              )}
              title={flag.enabled ? "Enabled" : "Disabled"}
            />
          </div>

          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            {flag.description}
          </p>

          <ValueEditor flag={flag} />
        </div>

        {/* Right — controls */}
        <div className="flex md:flex-col items-start md:items-end justify-between md:justify-start gap-3 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none size-7"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none">
              <DropdownMenuItem
                onClick={() => setEditOpen(true)}
                className="font-mono text-[11px] uppercase tracking-widest"
              >
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onViewAudit(flag)}
                className="font-mono text-[11px] uppercase tracking-widest"
              >
                <History className="size-3.5" />
                Audit Log
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="font-mono text-[11px] uppercase tracking-widest text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-widest",
                  flag.enabled ? "text-green-500" : "text-muted-foreground",
                )}
              >
                {flag.enabled ? "On" : "Off"}
              </span>
              <Switch
                checked={flag.enabled}
                onCheckedChange={handleToggle}
                disabled={update.isPending}
              />
            </div>
            <p className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
              {format(new Date(flag.updatedAt), "MMM dd, HH:mm")}
            </p>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-none border-border/50 bg-card/95 backdrop-blur-xl sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="font-mono text-base uppercase tracking-[0.2em]">
              Edit Flag
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <code className="text-primary">{flag.key}</code> · {flag.type}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Display Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-none font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-none font-mono text-xs min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Reason (optional, written to audit log)
              </Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you making this change?"
                className="rounded-none font-mono text-xs"
              />
            </div>

            {editError && (
              <p className="text-[11px] font-mono text-destructive uppercase tracking-widest">
                {editError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="rounded-none font-mono text-[10px] uppercase tracking-widest"
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="rounded-none font-mono text-[10px] uppercase tracking-widest"
              disabled={update.isPending}
            >
              {update.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-none border-border/50 bg-card/95 backdrop-blur-xl sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-mono text-base uppercase tracking-[0.2em] text-destructive">
              Delete Flag
            </DialogTitle>
            <DialogDescription className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              This removes the flag and its audit history. Any code that reads
              it will fall back to disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Reason (optional)
            </Label>
            <Input
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="e.g. feature shipped to GA"
              className="rounded-none font-mono text-xs"
            />
            <p className="font-mono text-[10px] text-muted-foreground">
              Deleting{" "}
              <code className="text-primary">{flag.key}</code> cannot be undone
              via the UI.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-none font-mono text-[10px] uppercase tracking-widest"
              disabled={remove.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-none font-mono text-[10px] uppercase tracking-widest"
              disabled={remove.isPending}
            >
              {remove.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Delete Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Per-type value editor — percentage slider, select dropdown, json textarea.
// Boolean: no value editor (master switch is the row's Switch).
// ---------------------------------------------------------------------------

interface ValueEditorProps {
  flag: FeatureFlag;
}

function ValueEditor({ flag }: ValueEditorProps) {
  const update = useUpdateFeatureFlag();

  if (flag.type === "boolean") {
    return (
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        Master switch — no extra value.
      </p>
    );
  }

  if (flag.type === "percentage") {
    const current = typeof flag.value === "number" ? flag.value : 0;
    const onChange = (next: number) => {
      update.mutate({ key: flag.key, body: { value: next } });
    };
    return (
      <div className="space-y-2 max-w-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Rollout
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            {current}%
          </span>
        </div>
        <Slider
          value={[current]}
          min={0}
          max={100}
          step={1}
          onValueCommit={(v) => onChange(v[0])}
          className="w-full"
        />
        <p className="font-mono text-[10px] text-muted-foreground">
          Per-user hashing: FNV-1a(key+userId) % 100. Same users stay bucketed.
        </p>
      </div>
    );
  }

  if (flag.type === "select") {
    const options = flag.options ?? [];
    const current = typeof flag.value === "string" ? flag.value : "";
    return (
      <div className="space-y-2 max-w-md">
        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Selected Value
        </Label>
        <Select
          value={current}
          onValueChange={(v) =>
            update.mutate({ key: flag.key, body: { value: v } })
          }
        >
          <SelectTrigger className="rounded-none font-mono text-xs">
            <SelectValue placeholder="(unset)" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="font-mono text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // json
  const stringified = JSON.stringify(flag.config ?? {}, null, 2);
  const [text, setText] = React.useState(stringified);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setText(stringified);
    setError(null);
  }, [stringified, flag.key]);

  const commit = () => {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      setError("Config must be a JSON object.");
      return;
    }
    update.mutate({
      key: flag.key,
      body: { config: parsed as Record<string, unknown> },
    });
  };

  return (
    <div className="space-y-2 max-w-md">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Config (JSON)
      </Label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        className="rounded-none font-mono text-xs min-h-24"
        spellCheck={false}
      />
      {error && (
        <p className="font-mono text-[10px] text-destructive uppercase tracking-widest">
          {error}
        </p>
      )}
      <p className="font-mono text-[10px] text-muted-foreground">
        Saved on blur.
      </p>
    </div>
  );
}
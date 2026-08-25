"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import {
  CreateFlagBody,
  FeatureFlag,
  FlagType,
  useCreateFeatureFlag,
} from "@/hooks/admin/use-feature-flags";

interface CreateFlagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional pre-fill — when provided, the modal opens in "edit name/description" mode. */
  initial?: Pick<FeatureFlag, "name" | "description">;
  onCreated?: (created: FeatureFlag) => void;
}

const KEY_REGEX = /^[a-z][a-z0-9_]*$/;

export function CreateFlagModal({
  open,
  onOpenChange,
  initial,
  onCreated,
}: CreateFlagModalProps) {
  const [key, setKey] = React.useState("");
  const [name, setName] = React.useState(initial?.name ?? "");
  const [description, setDescription] = React.useState(
    initial?.description ?? "",
  );
  const [type, setType] = React.useState<FlagType>("boolean");
  const [error, setError] = React.useState<string | null>(null);

  const create = useCreateFeatureFlag();

  // Reset on open.
  React.useEffect(() => {
    if (open) {
      setKey("");
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setType("boolean");
      setError(null);
    }
  }, [open, initial?.name, initial?.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!KEY_REGEX.test(key)) {
      setError(
        "Key must start with a lowercase letter and use only lowercase letters, digits, and underscores.",
      );
      return;
    }
    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    const body: CreateFlagBody = {
      key,
      name: name.trim(),
      description: description.trim(),
      type,
      enabled: false,
    };

    try {
      const created = await create.mutateAsync(body);
      onCreated?.(created);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create feature flag.";
      setError(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-border/50 bg-card/95 backdrop-blur-xl sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-mono text-base uppercase tracking-[0.2em]">
            New Feature Flag
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Flags start disabled. Toggle them on after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Key
            </Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="my_feature_enabled"
              className="rounded-none font-mono text-xs"
              autoComplete="off"
              spellCheck={false}
              required
            />
            <p className="text-[10px] font-mono text-muted-foreground tracking-wide">
              Identifier used in code: features.isEnabled(&quot;{key || "my_feature_enabled"}&quot;).
              Cannot be changed later.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Display Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Feature"
              className="rounded-none font-mono text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this flag controls and why it exists."
              className="rounded-none font-mono text-xs min-h-20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as FlagType)}
            >
              <SelectTrigger className="rounded-none font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean" className="font-mono text-xs">
                  boolean — master on/off switch
                </SelectItem>
                <SelectItem value="percentage" className="font-mono text-xs">
                  percentage — rollout 0–100% (per-user hashing)
                </SelectItem>
                <SelectItem value="select" className="font-mono text-xs">
                  select — one of a fixed list of options
                </SelectItem>
                <SelectItem value="json" className="font-mono text-xs">
                  json — free-form config blob
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-[11px] font-mono text-destructive uppercase tracking-widest">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-none font-mono text-[10px] uppercase tracking-widest"
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-none font-mono text-[10px] uppercase tracking-widest"
              disabled={create.isPending}
            >
              {create.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Create Flag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
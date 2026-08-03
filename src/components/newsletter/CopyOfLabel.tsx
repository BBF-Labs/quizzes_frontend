"use client";
import { useCampaign, ICampaign } from "@/hooks";
import { cn } from "@/lib/utils";

interface CopyOfLabelProps {
  copiedFrom: ICampaign["copiedFromCampaignId"];
  className?: string;
}

/**
 * Renders a small, visually subordinate "(copy of: <title>)" label for
 * campaigns duplicated from another campaign.
 *
 * `copiedFromCampaignId` may come back from the API as either:
 *  - a populated object: { _id, title }
 *  - a raw ObjectId string, in which case we fetch the referenced
 *    campaign to resolve its title.
 */
export function CopyOfLabel({ copiedFrom, className }: CopyOfLabelProps) {
  const isPopulated = !!copiedFrom && typeof copiedFrom === "object";
  const idToResolve = !isPopulated && copiedFrom ? copiedFrom : "";

  // useCampaign is a no-op (enabled: false) when passed an empty id.
  const { data: resolvedCampaign } = useCampaign(idToResolve);

  if (!copiedFrom) return null;

  const originalTitle = isPopulated ? copiedFrom.title : resolvedCampaign?.title;

  if (!originalTitle) return null;

  return (
    <span
      className={cn(
        "text-[10px] font-mono text-muted-foreground/60 tracking-widest uppercase truncate",
        className,
      )}
    >
      (copy of: {originalTitle})
    </span>
  );
}

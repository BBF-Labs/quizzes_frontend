"use client";

import { Activity, initialsOf, isAnonymousDonation, pickAvatarBg } from "@/lib/donor-display";
import type { DonationEntry } from "@/hooks/common/use-donations";

interface DonorLedgerCardProps {
  /** Total GHS raised across all donations. */
  totalRaisedGHS: number | undefined;
  /** All donations — most recent first is expected from the API. */
  donations: DonationEntry[] | undefined;
  /** Shown while `totalRaisedGHS` is still resolving. */
  isLoading?: boolean;
  /** Caption shown above the total — usually "Total Raised by Community". */
  label?: string;
  /** Tag in the top-right — defaults to the on-brand Live Ledger badge. */
  badge?: string;
  /** Color of the avatar ring. `border-white` for light cards, `border-slate-950` for dark. */
  avatarRingClass?: string;
  /** Cap on how many avatar bubbles to render. Default 5. */
  visibleAvatars?: number;
}

/**
 * Reusable donor ledger summary card — the same widget that lives on the
 * donate page, shared with the landing-page donation section.
 *
 * Shows the live GHS total, an overlapping-avatar stack of recent donors,
 * and a "X and N others recently chipped in" caption that groups anonymous
 * donors / placeholders under "others" so we never highlight a fake name.
 */
export function DonorLedgerCard({
  totalRaisedGHS,
  donations,
  isLoading,
  label = "Community Contributions",
  badge = "Live Ledger",
  avatarRingClass = "border-white",
  visibleAvatars = 5,
}: DonorLedgerCardProps) {
  const recent = (donations ?? []).slice(0, visibleAvatars);
  const remaining = (donations?.length ?? 0) - recent.length;

  const named = recent
    .filter((d) => !d.isAnonymous && !isAnonymousDonation(d.donorName))
    .map((d) => d.donorName!.trim());
  const unnamedCount = recent.length - named.length;
  const namedSlice = named.slice(0, 2);
  const moreNamed = named.length - namedSlice.length;
  const totalOthers = unnamedCount + moreNamed + remaining;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{label}</span>
        <span className="flex items-center gap-1.5 text-[#0C60FC]">
          <Activity className="h-3.5 w-3.5" /> {badge}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xs font-bold text-slate-400">GHS</span>
        <span className="display text-4xl font-bold text-slate-900">
          {isLoading ? "…" : totalRaisedGHS?.toLocaleString() ?? "0"}
        </span>
      </div>

      {recent.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          {/* overlapping avatars — same pattern as the crew card */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {recent.map((d) => {
                const seed = d.donorName || d._id;
                return (
                  <span
                    key={d._id}
                    title={d.isAnonymous ? "Anonymous" : d.donorName || "Supporter"}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${avatarRingClass} text-xs font-bold ${pickAvatarBg(seed)}`}
                  >
                    {initialsOf(d.isAnonymous ? undefined : d.donorName)}
                  </span>
                );
              })}
            </div>
            {remaining > 0 && (
              <span className="ml-3 text-[11px] font-semibold text-slate-500">
                +{remaining} more
              </span>
            )}
          </div>

          {/* caption — named donors first, everyone else lumped as "others" */}
          <p className="mt-3 text-[11px] leading-5 text-slate-600">
            {namedSlice.length > 0 ? (
              <>
                {namedSlice.join(", ")}
                {totalOthers > 0 && " and "}
              </>
            ) : null}
            {totalOthers > 0 && (
              <b>{totalOthers === 1 ? "1 other" : `${totalOthers} others`}</b>
            )}
            {" "}recently chipped in to keep Qz free.
          </p>
        </div>
      )}
    </div>
  );
}

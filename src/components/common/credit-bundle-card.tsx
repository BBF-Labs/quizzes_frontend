"use client";

import { Zap } from "lucide-react";
import type { CreditBundle } from "@/hooks/common/use-billing";

interface CreditBundleCardProps {
  bundle: CreditBundle;
  index: number;
  totalCount: number;
  onSelect: (id: string) => void;
}

export function CreditBundleCard({
  bundle,
  index,
  totalCount,
  onSelect,
}: CreditBundleCardProps) {
  const isStarter = index === 0;
  const isBest = index === totalCount - 1;

  const priceGhs = Number(bundle.priceGHS);
  const perCredit = bundle.credits > 0 ? priceGhs / bundle.credits : 0;

  // Backend names come back lowercase ("starter pack"); title-case for display.
  const displayName = bundle.name
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

  return (
    <article
      className={`play-card relative flex w-full flex-col rounded-[28px] p-7 sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)] xl:w-[calc(25%-0.9375rem)] ${
        isBest
          ? "bg-slate-950 text-white shadow-2xl shadow-slate-900/30"
          : "border border-slate-200 bg-white text-slate-950"
      }`}
      style={{ borderRadius: "28px" }}
    >
      {isBest && (
        <span className="absolute -top-3 left-7 rounded-full bg-[#DFFF61] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-900">
          Best value
        </span>
      )}
      {isStarter && (
        <span className="absolute -top-3 left-7 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
          Starter
        </span>
      )}

      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            isBest ? "bg-white/10" : "bg-slate-950"
          }`}
        >
          <Zap className="h-5 w-5 text-[#DFFF61]" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-extrabold uppercase tracking-widest ${
              isBest ? "text-[#DFFF61]" : "text-slate-500"
            }`}
          >
            Credit pack
          </p>
          <h3 className="display mt-0.5 text-lg font-bold">{displayName}</h3>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-1">
          <span
            className={`text-xs font-bold ${
              isBest ? "text-slate-300" : "text-slate-400"
            }`}
          >
            GHS
          </span>
          <span className="display text-4xl font-bold">{bundle.priceGHS}</span>
        </div>
        <p
          className={`mt-1 text-xs font-semibold ${
            isBest ? "text-slate-300" : "text-slate-500"
          }`}
        >
          one-time · never expires
        </p>
      </div>

      <ul
        className={`mt-6 space-y-2.5 text-sm ${
          isBest ? "text-slate-100" : "text-slate-600"
        }`}
      >
        <li className="flex gap-2">
          <b className={isBest ? "text-[#DFFF61]" : "text-emerald-500"}>✓</b>
          {bundle.credits} generation credits
        </li>
        <li className="flex gap-2">
          <b className={isBest ? "text-[#DFFF61]" : "text-emerald-500"}>✓</b>
          GHS {perCredit.toFixed(2)} per credit
        </li>
        <li className="flex gap-2">
          <b className={isBest ? "text-[#DFFF61]" : "text-emerald-500"}>✓</b>
          Works on any plan
        </li>
      </ul>

      <div className="mt-auto pt-7">
        <button
          type="button"
          onClick={() => onSelect(bundle._id)}
          className={`squishy w-full rounded-2xl py-3.5 text-center text-sm font-extrabold transition ${
            isBest
              ? "bg-[#DFFF61] text-slate-900 hover:bg-white"
              : "bg-slate-950 text-white hover:bg-[#0C60FC]"
          }`}
        >
          Buy {bundle.credits} credits
        </button>
      </div>
    </article>
  );
}

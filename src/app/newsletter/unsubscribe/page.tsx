"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MailMinus,
  Compass,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useUnsubscribeNewsletter } from "@/hooks";
import { LandingHeader, LandingFooter } from "@/components/landing";
import {
  ConfirmTokenPage,
  type ConfirmTokenCopy,
} from "@/components/common/confirm-token-page";
import {
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

const COPY: ConfirmTokenCopy = {
  fallbackError:
    "The unsubscribe link is invalid or has already been used.",
  headline: {
    verifying: "Removing you from the list.",
    success: "You're off.",
    error: "Link expired.",
  },
  kicker: {
    verifying: "tearing up the records ↘",
    success: "see you around ✦",
    error: "let's try that again ↘",
  },
  sub: {
    verifying:
      "Hold on — we're confirming your unsubscribe request and scrubbing your email from the broadcast list.",
    success:
      "Your email has been removed from all Qz broadcast lists. No more study tips from us — but you can always resubscribe from the footer.",
  },
  verifying: {
    chip: "Newsletter unsubscribe",
    Icon: Compass,
    statusLabel: "Confirming",
    qubi: QUBI_STUDY_SRC,
    qubiLabel: "one sec ↘",
  },
  success: {
    chip: "Newsletter removed",
    Icon: LogOut,
    statusLabel: "Status · Unsubscribed",
    qubi: QUBI_WAVE_SRC,
    qubiLabel: "see ya!",
    cta: { href: "/", label: "Back to Qz" },
  },
  error: {
    chip: "Newsletter link expired",
    Icon: AlertCircle,
    statusLabel: "Status · Failed",
    qubi: QUBI_RUN_SRC,
    qubiLabel: "oops!",
    cta: { href: "/#newsletter", label: "Manage preferences" },
  },
};

function UnsubscribeInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const mutation = useUnsubscribeNewsletter();

  return (
    <ConfirmTokenPage
      mutation={mutation}
      token={token}
      copy={COPY}
      palette="rose"
      ChipIcon={MailMinus}
      ariaLabel="Newsletter unsubscribe"
    />
  );
}

export default function UnsubscribePage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        <Suspense
          fallback={
            <div className="relative mx-auto max-w-2xl px-5 pt-40">
              <div className="text-center font-mono text-sm uppercase tracking-widest text-slate-400 animate-pulse">
                Loading unsubscribe…
              </div>
            </div>
          }
        >
          <UnsubscribeInner />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
}

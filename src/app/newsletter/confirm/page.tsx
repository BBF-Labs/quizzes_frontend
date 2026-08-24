"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Compass,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useConfirmNewsletter } from "@/hooks";
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
  fallbackError: "The link is invalid or has expired. Try requesting a new one.",
  headline: {
    verifying: "Confirming your spot.",
    success: "You're in.",
    error: "Link expired.",
  },
  kicker: {
    verifying: "syncing the inbox ↘",
    success: "good notes, headed your way ✦",
    error: "let's try that again ↘",
  },
  sub: {
    verifying:
      "Hold tight — we're confirming your newsletter token with the Qz servers.",
    success:
      "Your subscription is now active. From the next mailing, you'll get fresh study tips, useful resources and product updates — never spammy.",
  },
  verifying: {
    chip: "Newsletter verification",
    Icon: Compass,
    statusLabel: "Verifying token",
    qubi: QUBI_STUDY_SRC,
    qubiLabel: "one sec ↘",
  },
  success: {
    chip: "Newsletter verified",
    Icon: CheckCircle2,
    statusLabel: "Status · Active",
    qubi: QUBI_WAVE_SRC,
    qubiLabel: "welcome!",
    cta: { href: "/#newsletter", label: "Discover more from Qz" },
  },
  error: {
    chip: "Newsletter link expired",
    Icon: AlertCircle,
    statusLabel: "Status · Failed",
    qubi: QUBI_RUN_SRC,
    qubiLabel: "oops!",
    cta: { href: "/#newsletter", label: "Request a new link" },
  },
};

function ConfirmInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const mutation = useConfirmNewsletter();

  return (
    <ConfirmTokenPage
      mutation={mutation}
      token={token}
      copy={COPY}
      ChipIcon={Mail}
      ariaLabel="Newsletter confirmation"
    />
  );
}

export default function ConfirmPage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        <Suspense
          fallback={
            <div className="relative mx-auto max-w-2xl px-5 pt-40">
              <div className="text-center font-mono text-sm uppercase tracking-widest text-slate-400 animate-pulse">
                Loading confirmation…
              </div>
            </div>
          }
        >
          <ConfirmInner />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
}

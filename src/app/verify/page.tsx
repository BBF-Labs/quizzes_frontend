"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Compass,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useConfirmStudentVerify } from "@/hooks";
import { LandingHeader, LandingFooter } from "@/components/landing";
import {
  ConfirmTokenPage,
  type ConfirmTokenCopy,
  type ConfirmMutation,
  type ConfirmPalette,
} from "@/components/common/confirm-token-page";
import {
  QUBI_STUDY_SRC,
  QUBI_WAVE_SRC,
  QUBI_RUN_SRC,
} from "@/lib/constants";

/**
 * Generic public token-confirmation route. The `?type=` param picks
 * which flow to dispatch:
 *   - `student-verify` → confirms a student email and unlocks the discount
 *
 * Future flows (e.g. email-change, account-deletion, magic-link) plug in
 * here as additional entries in `VERIFY_CONFIG` + a case in
 * `dispatchMutation`, with no other surface changes.
 */

type VerifyType = "student-verify";

interface VerifyTypeConfig {
  palette: ConfirmPalette;
  copy: ConfirmTokenCopy;
}

const VERIFY_CONFIG: Record<VerifyType, VerifyTypeConfig> = {
  "student-verify": {
    palette: "blue",
    copy: {
      fallbackError:
        "Your verification link is invalid or has expired. Try requesting a new one from your account.",
      headline: {
        verifying: "Confirming your student status.",
        success: "You're verified.",
        error: "Link expired.",
      },
      kicker: {
        verifying: "checking your student email ↘",
        success: "10% discount unlocked ✦",
        error: "let's try that again ↘",
      },
      sub: {
        verifying:
          "Hold tight — we're confirming your institutional email with the Qz servers.",
        success:
          "Your discount is now active. New subscriptions will include 10% off automatically.",
      },
      verifying: {
        chip: "Student verification",
        Icon: Compass,
        statusLabel: "Verifying token",
        qubi: QUBI_STUDY_SRC,
        qubiLabel: "one sec ↘",
      },
      success: {
        chip: "Student verified",
        Icon: CheckCircle2,
        statusLabel: "Status · Verified",
        qubi: QUBI_WAVE_SRC,
        qubiLabel: "verified!",
        cta: {
          href: "/app/settings?tab=verification",
          label: "View your billing",
        },
      },
      error: {
        chip: "Verification link expired",
        Icon: AlertCircle,
        statusLabel: "Status · Failed",
        qubi: QUBI_RUN_SRC,
        qubiLabel: "oops!",
        cta: {
          href: "/app/settings?tab=verification",
          label: "Request a new link",
        },
      },
    },
  },
};

/**
 * Static `switch` keeps hook calls unconditional for the React
 * rules-of-hooks (eslint-plugin-react-hooks accepts this pattern
 * when the discriminant is a literal-union type).
 */
function dispatchMutation(type: VerifyType): ConfirmMutation {
  switch (type) {
    case "student-verify":
      return useConfirmStudentVerify() as ConfirmMutation;
  }
}

function VerifyInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const token = searchParams.get("token");

  if (typeParam !== "student-verify") {
    return (
      <div className="relative mx-auto max-w-2xl px-5 pt-40 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-slate-400">
          Unknown verification type: {typeParam ?? "(none)"}
        </p>
      </div>
    );
  }

  const config = VERIFY_CONFIG[typeParam];
  const mutation = dispatchMutation(typeParam);

  return (
    <ConfirmTokenPage
      mutation={mutation}
      token={token}
      copy={config.copy}
      palette={config.palette}
      ChipIcon={GraduationCap}
      successRedirect={{
        href: "/app/settings?tab=verification",
        delayMs: 2500,
      }}
      ariaLabel="Student verification"
    />
  );
}

export default function VerifyPage() {
  return (
    <div className="overflow-x-hidden bg-white text-slate-900 antialiased selection:bg-[#0C60FC] selection:text-white">
      <LandingHeader />

      <main className="soft-grid relative overflow-hidden">
        <Suspense
          fallback={
            <div className="relative mx-auto max-w-2xl px-5 pt-40 text-center">
              <div className="font-mono text-sm uppercase tracking-widest text-slate-400 animate-pulse">
                Loading verification…
              </div>
            </div>
          }
        >
          <VerifyInner />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
}

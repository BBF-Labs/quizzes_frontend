"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks";
import { useAuth } from "@/contexts/auth-context";

// Step Components
import ProfileStep from "@/components/onboarding/steps/ProfileStep";
import YearOfStudyStep from "@/components/onboarding/steps/YearOfStudyStep";
import PushOptInStep from "@/components/onboarding/steps/PushOptInStep";
import PWAInstallStep from "@/components/onboarding/steps/PWAInstallStep";
import ZIntroStep from "@/components/onboarding/steps/ZIntroStep";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { status, isLoading, updateStepAsync, isUpdating, updateError } =
    useOnboarding();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [internalError, setInternalError] = useState<string | null>(null);
  const hasSyncedInitialStep = useRef(false);

  // Define step sequence and required/skippable status
  const steps = [
    {
      id: "profile",
      label: "Profile Setup",
      required: true,
      component: ProfileStep,
    },
    {
      id: "yearOfStudy",
      label: "Year of Study",
      required: true,
      component: YearOfStudyStep,
    },
    {
      id: "pushOptIn",
      label: "Stay in the Loop",
      required: true,
      component: PushOptInStep,
    },
    {
      id: "pwaInstall",
      label: "Add to Home Screen",
      required: false,
      component: PWAInstallStep,
    },
    { id: "zIntro", label: "Meet Z", required: true, component: ZIntroStep },
  ];

  // Redirect unauthenticated users to signup
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signup");
    }
  }, [user, authLoading, router]);

  // Sync currentStep with API once on initial load (do not override manual back navigation)
  useEffect(() => {
    if (status) {
      if (status.completed) {
        router.push("/dashboard");
      } else if (
        !hasSyncedInitialStep.current &&
        status.currentStep !== undefined &&
        status.currentStep !== currentStep
      ) {
        // Use setTimeout to avoid synchronous setState in effect (lint rule)
        const timer = setTimeout(() => {
          setCurrentStep(status.currentStep);
          hasSyncedInitialStep.current = true;
        }, 0);
        return () => clearTimeout(timer);
      } else if (!hasSyncedInitialStep.current) {
        hasSyncedInitialStep.current = true;
      }
    }
  }, [status, router, currentStep]);

  const handleNext = async (data: Record<string, unknown>) => {
    setDirection(1);
    let updatedData: Record<string, unknown> = {};
    setStepData((prev) => {
      updatedData = { ...prev, ...data };
      return updatedData;
    });

    try {
      if (steps[currentStep].id !== "pwaInstall") {
        await updateStepAsync({
          stepId: steps[currentStep].id,
          data: updatedData,
        });
      }
      
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Something went wrong.";
      setInternalError(errorMessage);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = async () => {
    setDirection(1);
    try {
      await updateStepAsync({ stepId: steps[currentStep].id, isSkip: true });
      setCurrentStep((prev) => prev + 1);
    } catch {
      setInternalError("Failed to skip step.");
    }
  };

  const totalRequired = steps.filter((s) => s.required).length;
  const currentRequiredIndex = steps
    .slice(0, currentStep + 1)
    .filter((s) => s.required).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
          Initialising Environment…
        </p>
      </div>
    );
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full min-h-screen py-10 md:py-14 border-b border-border/50 bg-background overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-150 h-70 bg-primary/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10 w-full flex flex-col gap-8">
        <div className="inline-flex items-center space-x-2 border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] text-primary font-bold uppercase tracking-[0.15em] w-fit shadow-[0_0_15px_rgba(0,110,255,0.1)]">
          <div className="w-1.5 h-1.5 bg-primary" />
          <span>ONBOARDING</span>
        </div>

        {/* Boundary Guard */}
        {!steps[currentStep] ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="size-8 border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
              Finalising Setup…
            </p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Step {currentRequiredIndex} of {totalRequired}
              </p>
              <h2 className="text-sm font-bold tracking-tight uppercase">
                {steps[currentStep].label}
              </h2>
            </div>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-2"
              >
                [ Back ]
              </button>
            )}
          </div>

          <div className="h-1.5 w-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{
                width: `${(currentRequiredIndex / totalRequired) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="w-full"
            >
              {/* 
              Placeholder for steps. In the next iterations, 
              I will render the actual components for each step.
            */}
              {(() => {
                const StepComponent = steps[currentStep].component;
                return StepComponent ? (
                  <StepComponent
                    onComplete={handleNext}
                    initialData={stepData}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full border border-dashed border-border p-12 text-center pointer-events-none opacity-40">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4">
                      [ Step: {steps[currentStep].id} ]
                    </p>
                    <h3 className="text-2xl font-bold mb-2">
                      Component Pending
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Step-specific component will be rendered here.
                    </p>

                    <div className="mt-8 flex gap-4 pointer-events-auto">
                      {!steps[currentStep].required && (
                        <button
                          onClick={handleSkip}
                          className="text-xs font-mono uppercase underline"
                        >
                          Skip
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleNext({ [steps[currentStep].id]: "debug_data" })
                        }
                        className="px-6 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase"
                      >
                        Continue (Debug)
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
        </>
        )}

        {(internalError || updateError) && (
          <p className="text-center text-[11px] font-mono text-destructive tracking-wider">
            {internalError ||
              (updateError as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ||
              "An error occurred."}
          </p>
        )}

        {isUpdating && (
          <div className="flex justify-center">
            <div className="size-4 border border-primary border-t-transparent animate-spin" />
          </div>
        )}

        <div className="flex justify-center pt-6 border-t border-border/40">
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em]">
            BetaForge — Qz. Deployment
          </p>
        </div>
      </div>
    </section>
  );
}

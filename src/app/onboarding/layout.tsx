import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Qz.",
  description: "Personalise your experience with Z.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

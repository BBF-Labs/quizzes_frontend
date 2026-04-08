import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Pricing - Study with Z Premium",
  description: "Upgrade your learning experience with unlimited AI assessments, real-time grading, and premium study tools.",
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

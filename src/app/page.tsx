import { Navbar } from "@/components/common";
import { Hero } from "@/components/landing";
import { MeetZ } from "@/components/landing";
import { ProblemSolution } from "@/components/landing";
import { Features } from "@/components/landing";
import { HowZWorks } from "@/components/landing";
import { CurriculumPreview } from "@/components/landing";
import { ExamTimetablePreview } from "@/components/landing";
import { RecommendationsPreview } from "@/components/landing";
import { InstitutionSection } from "@/components/landing";
import { SocialProof } from "@/components/landing";
import { CTA } from "@/components/landing";
import { Footer } from "@/components/landing";
import { StatsSection } from "@/components/landing";
import { QuizzesSection } from "@/components/landing";
import { Pricing } from "@/components/landing";
import { Donations } from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <MeetZ />
        <ProblemSolution />
        <Features />
        <QuizzesSection />
        <HowZWorks />
        <CurriculumPreview />
        <ExamTimetablePreview />
        <RecommendationsPreview />
        <InstitutionSection />
        <SocialProof />
        <Donations />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

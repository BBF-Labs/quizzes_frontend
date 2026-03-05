import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MeetZ } from "@/components/meet-z";
import { ProblemSolution } from "@/components/problem-solution";
import { Features } from "@/components/features";
import { HowZWorks } from "@/components/how-z-works";
import { CurriculumPreview } from "@/components/curriculum-preview";
import { ExamTimetablePreview } from "@/components/exam-timetable-preview";
import { RecommendationsPreview } from "@/components/recommendations-preview";
import { InstitutionSection } from "@/components/institution-section";
import { SocialProof } from "@/components/social-proof";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";
import { StatsSection } from "@/components/stats-section";

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
        <HowZWorks />
        <CurriculumPreview />
        <ExamTimetablePreview />
        <RecommendationsPreview />
        <InstitutionSection />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

import { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

interface QuizLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

async function getQuiz(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/quizzes/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: QuizLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const quiz = await getQuiz(id);

  if (!quiz) {
    return constructMetadata({
      title: "Quiz Not Found",
      description: "The requested quiz could not be found.",
    });
  }

  const title = quiz.title;
  const description = quiz.description || `Take the ${title} on Qz.`;
  
  // Construct a dynamic OG image URL
  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&subtitle=SYSTEM ASSESSMENT`;

  return constructMetadata({
    title,
    description,
    image: ogImageUrl,
  });
}

export default function QuizDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

"use client";

import { BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  LandingHeader,
} from "@/components";
import Link from "next/link";

export default function HomeCoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      totalQuizzes: 10,
    },
    {
      id: 2,
      title: "React Fundamentals",
      description:
        "Master the basics of React and component-based architecture",
      totalQuizzes: 8,
    },
    // Add more courses as needed
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Available Courses
          </h1>
          <p className="text-zinc-400">
            Take Quizzes in Courses and See How you&apos;ll perform in an
            examination
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-zinc-900 border-zinc-800">
              <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 p-6 flex items-center justify-center rounded-t-lg">
                <h2 className="text-2xl font-bold text-white text-center group-hover:scale-105 transition-transform duration-300 flex-wrap">
                  {course.title}
                </h2>
              </div>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-zinc-400">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{course.totalQuizzes} Quizzes</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/user/quiz/${course.id}`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-12 px-4 py-3 w-full text-black hover:text-white"
                >
                  Take Course Quiz
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

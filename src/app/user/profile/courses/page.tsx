"use client";

import { BookOpen, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components";
import Link from "next/link";

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      progress: 75,
      totalQuizzes: 10,
      completedQuizzes: 7,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "React Fundamentals",
      description:
        "Master the basics of React and component-based architecture",
      progress: 30,
      totalQuizzes: 8,
      completedQuizzes: 2,
      image: "/placeholder.svg?height=200&width=400",
    },
    // Add more courses as needed
  ];

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-zinc-400">
            Track your progress and continue learning
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
                  <span className="text-zinc-400">Progress</span>
                  <span className="text-white">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="bg-zinc-800" />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-zinc-400">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{course.totalQuizzes} Quizzes</span>
                  </div>
                  <div className="flex items-center text-zinc-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>{course.completedQuizzes} Completed</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/user/quiz/${course.id}`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-12 px-4 py-3 w-full text-black hover:text-white"
                >
                  Continue to Quiz
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

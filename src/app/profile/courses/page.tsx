"use client";

import { BookOpen, CheckCircle } from "lucide-react";
import {
  Card,
  Header,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Progress,
} from "@/components";
import Image from "next/image";

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
    <div className="min-h-screen bg-black text-white">
      <Header />
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
              <Image
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                width={100}
                height={48}
                className="w-full h-48 object-cover rounded-t-lg"
              />
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
                <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                  Continue Quiz
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

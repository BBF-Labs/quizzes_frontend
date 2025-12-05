"use client";

import { BarChart, PieChart, Trophy, Target, Clock } from "lucide-react";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components";

export default function ProgressPage() {
  const stats = [
    {
      title: "Total Quizzes Taken",
      value: "42",
      icon: BarChart,
      description: "Across all courses",
    },
    {
      title: "Average Score",
      value: "85%",
      icon: PieChart,
      description: "Overall performance",
    },
    {
      title: "Achievements",
      value: "12",
      icon: Trophy,
      description: "Earned badges",
    },
    {
      title: "Completion Rate",
      value: "78%",
      icon: Target,
      description: "Quiz completion",
    },
  ];

  const recentQuizzes = [
    {
      id: 1,
      title: "JavaScript Basics",
      score: 90,
      date: "2024-02-11",
      duration: "25 mins",
    },
    {
      id: 2,
      title: "React Components",
      score: 85,
      date: "2024-02-10",
      duration: "30 mins",
    },
    // Add more quizzes as needed
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-teal-500">
            Quiz Progress
          </h1>
          <p className="text-zinc-400">
            Track your performance and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-zinc-400">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Recent Quizzes</CardTitle>
            <CardDescription>
              Your latest quiz attempts and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{quiz.title}</p>
                    <div className="flex items-center text-sm text-zinc-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{quiz.duration}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-500">
                      {quiz.score}%
                    </div>
                    <div className="text-sm text-zinc-400">{quiz.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

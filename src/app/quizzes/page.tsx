"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button, Input, QuizCard, Header } from "@/components";

const quizzes = [
  {
    id: 1,
    category: "Economics",
    title: "Introduction to Economics",
    duration: "45 mins",
    questions: 30,
    completions: 1234,
  },
  {
    id: 2,
    category: "Mathematics",
    title: "Advanced Calculus",
    duration: "60 mins",
    questions: 40,
    completions: 856,
  },
  {
    id: 3,
    category: "History",
    title: "World History: Modern Era",
    duration: "50 mins",
    questions: 25,
    completions: 2156,
  },
  // Add 6 more quizzes for demonstration
  {
    id: 4,
    category: "Economics",
    title: "Microeconomics Fundamentals",
    duration: "40 mins",
    questions: 35,
    completions: 987,
  },
  {
    id: 5,
    category: "Mathematics",
    title: "Linear Algebra",
    duration: "55 mins",
    questions: 30,
    completions: 754,
  },
  {
    id: 6,
    category: "History",
    title: "Ancient Civilizations",
    duration: "45 mins",
    questions: 28,
    completions: 1543,
  },
  {
    id: 7,
    category: "Economics",
    title: "International Trade",
    duration: "50 mins",
    questions: 32,
    completions: 678,
  },
  {
    id: 8,
    category: "Mathematics",
    title: "Statistics Basics",
    duration: "45 mins",
    questions: 35,
    completions: 1123,
  },
  {
    id: 9,
    category: "History",
    title: "World War II",
    duration: "60 mins",
    questions: 40,
    completions: 1876,
  },
];

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuizzes = filteredQuizzes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8 pt-24 relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Available Quizzes
          </h1>
          <p className="text-lg text-zinc-400 mb-8">
            Explore our collection of carefully crafted quizzes designed to
            enhance your learning experience.
          </p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search quizzes..."
                className="pl-10 bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedQuizzes.map((quiz, index) => (
            <QuizCard key={index} {...quiz} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <Button
              variant="outline"
              className="bg-zinc-800/50 border-zinc-700/50 text-white"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                className={
                  currentPage === page
                    ? "bg-gradient-to-r from-teal-500 to-blue-500"
                    : "bg-zinc-800/50 border-zinc-700/50 text-white"
                }
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              className="bg-zinc-800/50 border-zinc-700/50 text-white"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

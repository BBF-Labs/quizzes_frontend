"use client";

import { useState, useEffect } from "react";
import { Search, Loader } from "lucide-react";
import { Pagination, Input, LandingHeader, QuizCard } from "@/components";

interface Quiz {
  title: string;
  category: string;
  duration: string;
  questions: number;
  completions: number;
  id: string | number;
  createdAt?: any;
}
interface Course {
  code: string;
  _id: string;
  title: string;
  about: string;
  numberOfLectures?: number;
  approvedQuestionsCount: number;
  semester: number;
  creditHours?: number;
  isDeleted?: boolean;
}

import { useQuery } from "@tanstack/react-query";
import { useDebounce, useSyncQueryString } from "@/hooks";
import { getQuizzes, getAllCourses } from "@/controllers";

import { Suspense } from "react";

function QuizzesContent() {
  const { getParam, setQueryString } = useSyncQueryString();

  const initialSearch = getParam("search");
  const initialPage = Number(getParam("page")) || 1;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      setQueryString("search", debouncedSearch);
      if (debouncedSearch) setQueryString("page", "1");
    }
  }, [debouncedSearch, setQueryString, initialSearch]);

  const currentPage = initialPage;
  const itemsPerPage = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["quizzes", currentPage, debouncedSearch],
    queryFn: () =>
      getQuizzes({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
      }),
  });

  const quizzes = data?.quizzes || [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? pagination.totalPages || pagination.pages
    : Math.ceil((quizzes.length || 0) / itemsPerPage) || 1;

  const handlePageChange = (page: number) => {
    setQueryString("page", page.toString());
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      <div className="max-w-6xl mx-auto px-4 py-8 pt-24 relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-teal-500">
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
                }}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin h-8 w-8 text-teal-500" />
            <span className="ml-2 text-lg text-zinc-400">
              Loading quizzes...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <QuizCard key={index} {...quiz} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center pb-8">
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader className="animate-spin h-8 w-8 text-teal-500" /></div>}>
      <QuizzesContent />
    </Suspense>
  );
}

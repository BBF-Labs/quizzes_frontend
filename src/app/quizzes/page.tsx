"use client";

import { useState, useEffect } from "react";
import { Search, Loader } from "lucide-react";
import { Pagination, Input, LandingHeader, QuizCard } from "@/components";
import { getQuizzes, getAllCourses } from "@/controllers";

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

export default function QuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  const [quizzesData, setQuizzesData] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      fetchQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, currentPage]);

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await getQuizzes({
        page: currentPage,
        limit: itemsPerPage,
      });

      const getQuizDetails = (quiz: any) => {
        const timePerQuestion = 30;

        const totalQuestions = quiz.quizQuestions.reduce(
          (acc: number, quizQuestion: any) => {
            const uniqueQuestions = new Set(quizQuestion.questions || []);
            return acc + uniqueQuestions.size;
          },
          0,
        );

        const totalDuration = Math.floor(
          (totalQuestions * timePerQuestion) / 60,
        );

        return {
          totalQuestions,
          totalDuration,
        };
      };

      const quizzes = response.quizzes || [];
      const mappedQuizzes = quizzes
        .map((quiz: any) => {
          const course = courses.find((course) => quiz.courseId === course._id);
          const { totalQuestions, totalDuration } = getQuizDetails(quiz);

          return {
            title: course?.title || "Unknown Title",
            category: course?.code.split(" ")[0] || "Unknown Category",
            duration: totalDuration.toString(),
            questions: totalQuestions,
            completions: quiz.completions || 0,
            id: quiz.courseId,
            createdAt: quiz.createdAt,
          };
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);

          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return 0;
          }

          return dateB.getTime() - dateA.getTime();
        });

      setQuizzesData(mappedQuizzes);

      if (response.pagination) {
        setTotalPages(
          response.pagination.totalPages || response.pagination.pages,
        );
      } else {
        setTotalPages(Math.ceil(mappedQuizzes.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = searchQuery
    ? quizzesData.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : quizzesData;

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
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin h-8 w-8 text-teal-500" />
            <span className="ml-2 text-lg text-zinc-400">
              Loading quizzes...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => (
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
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

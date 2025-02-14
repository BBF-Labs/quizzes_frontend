"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader } from "lucide-react";
import { getAllCourses, getQuizzes } from "@/controllers"; // Import getQuizzes
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  LandingHeader,
  Input,
  Pagination,
  Button,
} from "@/components";
import Link from "next/link";

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

interface Quiz {
  courseId: string; // Assuming quizzes have a courseId to link them to courses
}

export default function HomeCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // State for quizzes
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCoursesAndQuizzes = async () => {
      setLoading(true);
      try {
        const [coursesResponse, quizzesResponse] = await Promise.all([
          getAllCourses(),
          getQuizzes(), // Fetch quizzes
        ]);
        setCourses(coursesResponse);
        setQuizzes(quizzesResponse); // Set quizzes state
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndQuizzes();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.code
        .replace(" ", "")
        .toLowerCase()
        .includes(searchQuery.replace(" ", "").toLowerCase()) ||
      course.title
        .replace(" ", "")
        .toLowerCase()
        .includes(searchQuery.replace(" ", "").toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <div className="text-center mb-12 max-w-6xl mx-auto px-4 py-8 pt-24 relative">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
          Available Courses
        </h1>
        <p className="text-lg text-zinc-400 mb-8">
          Explore our collection of courses.
        </p>
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search courses..."
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
          <span className="ml-2 text-lg text-zinc-400">Loading courses...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 mx-auto">
          {paginatedCourses.map((course) => {
            const hasQuiz = quizzes.some(
              (quiz) => quiz.courseId === course._id
            ); // Check if the course has quizzes
            return (
              <Card key={course._id} className="bg-zinc-900 border-zinc-800">
                <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 p-6 flex items-center justify-center rounded-t-lg">
                  <h2 className="text-2xl font-bold text-white text-center group-hover:scale-105 transition-transform duration-300 flex-wrap">
                    {course.code}
                  </h2>
                </div>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.about}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-zinc-400">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.numberOfLectures} Quizzes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-gradient h-12 px-4 py-3 w-full text-black hover:text-white ${
                      !hasQuiz ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!hasQuiz}
                  >
                    <Link href={`/user/quiz/${course._id}`} className="w-full">
                      Take Course Quiz
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-center pb-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

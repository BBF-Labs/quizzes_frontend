"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Search, Clock, Users, Tag, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Pagination } from "@/components";
import { LandingHeader } from "@/components";
import { getPublicPersonalQuizzes } from "@/controllers";
import { IPersonalQuiz } from "@/interfaces";

export default function CommunityQuizzesPage() {
  const [quizzes, setQuizzes] = useState<IPersonalQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    loadPublicQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadPublicQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getPublicPersonalQuizzes({
        page: currentPage,
        limit: itemsPerPage,
      });

      setQuizzes(response.quizzes);
      setTotalPages(response.pagination.pages);
      setTotalQuizzes(response.pagination.total);
    } catch (error: any) {
      console.error("Failed to load public quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500 border-green-500/50 bg-green-500/10";
      case "medium":
        return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10";
      case "hard":
        return "text-red-500 border-red-500/50 bg-red-500/10";
      default:
        return "text-gray-500 border-gray-500/50 bg-gray-500/10";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
              <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg">
              Loading community quizzes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Community Quizzes
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore and learn from quizzes shared by the community.{" "}
            {totalQuizzes} public quizzes available.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search quizzes by title, description, or tags..."
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {Array.isArray(quiz.questions)
                          ? quiz.questions.length
                          : 0}{" "}
                        questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.estimatedDuration} min
                      </span>
                    </div>

                    {/* Tags and Difficulty */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(quiz.difficulty)}
                      >
                        {quiz.difficulty}
                      </Badge>
                      {quiz.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="text-xs border-border/50"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {quiz.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-border/50"
                        >
                          +{quiz.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Completion Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border/50">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {quiz.completionCount || 0} completions
                      </span>
                      {quiz.averageScore > 0 && (
                        <span className="flex items-center gap-1">
                          Avg: {quiz.averageScore.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/user/personal-quizzes/${quiz._id}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-border hover:bg-muted"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/user/personal-quizzes/${quiz._id}/take`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full button-gradient">
                          <Play className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              No quizzes found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "No public quizzes available at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Edit,
  Play,
  Tag,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BookOpen as BookOpenIcon,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { showToast } from "@/components";
import axios from "axios";
import Config from "@/config";

interface PersonalQuiz {
  _id: string;
  title: string;
  description: string;
  courseId: {
    _id: string;
    code: string;
    title: string;
    about: string;
  };
  materialId: {
    _id: string;
    title: string;
    type: string;
    questionRefType: string;
  };
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    type: "mcq" | "fill-in" | "true-false";
    difficulty: "basic" | "intermediate" | "advanced" | "critical";
    hint?: string;
    explanation?: string;
    lectureNumber?: string;
  }>;
  settings: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    showHints: boolean;
    showExplanations: boolean;
    allowRetakes: boolean;
    passingScore: number;
  };
  stats: {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    lastAttempted?: string;
  };
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

import { useAuth } from "@/context";

export default function PersonalQuizPage() {
  const { quizId } = useParams();

  const { credentials } = useAuth();
  const [quiz, setQuiz] = useState<PersonalQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId, credentials.accessToken]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Config.API_URL}/personal-quizzes/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );
      setQuiz(response.data.quiz);
    } catch (error: any) {
      console.error("Failed to load quiz:", error);
      showToast(
        error.response?.data?.message || "Failed to load quiz",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basic":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "mcq":
        return "📝";
      case "fill-in":
        return "✏️";
      case "true-false":
        return "✅";
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="relative">
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">
            Quiz not found
          </h3>
          <p className="text-muted-foreground mb-6">
            The quiz you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Link href="/user/personal-quizzes">
            <Button variant="outline">Back to Quizzes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Link href="/user/personal-quizzes">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted"
                  >
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    Back to Quizzes
                  </Button>
                </Link>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {quiz.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {quiz.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/user/personal-quizzes/${quizId}/edit`}>
                <Button
                  variant="outline"
                  className="border-border hover:bg-muted"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Quiz
                </Button>
              </Link>
              <Link href={`/user/personal-quizzes/${quizId}/take`}>
                <Button className="button-gradient">
                  <Play className="w-4 h-4 mr-2" />
                  Take Quiz
                </Button>
              </Link>
            </div>
          </div>

          {/* Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-medium">Course</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {quiz.courseId.code}: {quiz.courseId.title}
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-primary" />
                <span className="font-medium">Material</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {quiz.materialId.title} ({quiz.materialId.type})
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">Time Limit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {quiz.settings.timeLimit || "No limit"} minutes
              </p>
            </div>
          </div>

          {/* Quiz Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {quiz.questions.length}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {quiz.stats.totalAttempts}
              </div>
              <div className="text-sm text-muted-foreground">Attempts</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {quiz.stats.bestScore}%
              </div>
              <div className="text-sm text-muted-foreground">Best Score</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {quiz.stats.averageScore}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-border/50"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Questions ({quiz.questions.length})
          </h2>

          {quiz.questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 p-6"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      Question {index + 1}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getQuestionTypeIcon(question.type)} {question.type}
                    </Badge>
                  </div>

                  {question.lectureNumber && (
                    <Badge variant="outline" className="text-xs">
                      Lecture {question.lectureNumber}
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-medium text-foreground">
                  {question.question}
                </h3>
              </div>

              {/* Options */}
              {question.type === "mcq" && (
                <div className="space-y-2 mb-4">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        option === question.answer
                          ? "border-green-500 "
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            option === question.answer
                              ? "border-green-500 bg-green-500"
                              : "border-border"
                          }`}
                        >
                          {option === question.answer && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-foreground">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    Correct Answer:
                  </span>
                </div>
                <p className="text-green-700 font-medium">{question.answer}</p>
              </div>

              {/* Hint */}
              {question.hint && (
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowHint(showHint === index ? null : index)
                    }
                    className="text-primary hover:text-amber-700 "
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {showHint === index ? "Hide Hint" : "Show Hint"}
                  </Button>
                  {showHint === index && (
                    <div className="mt-2 p-3 border border-amber-200 rounded-lg">
                      <p className="text-sm text-primary">{question.hint}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {question.explanation && (
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowExplanation(
                        showExplanation === index ? null : index
                      )
                    }
                    className="text-primary hover:text-blue-700 "
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {showExplanation === index
                      ? "Hide Explanation"
                      : "Show Explanation"}
                  </Button>
                  {showExplanation === index && (
                    <div className="mt-2 p-3  border border-blue-200 rounded-lg">
                      <p className="text-sm text-primary">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

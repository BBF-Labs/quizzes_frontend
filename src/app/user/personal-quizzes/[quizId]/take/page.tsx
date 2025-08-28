"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  BarChart3,
  Settings,
  Play,
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { showToast } from "@/components";
import { QuizQuestionCard } from "@/components/QuizQuestionCard";
import { QuizProgressCard } from "@/components/QuizProgressCard";
import { QuizResultsCard } from "@/components/QuizResultsCard";
import { QuizSettingsModal } from "@/components/QuizSettingsModal";
import { FloatingAIWidget } from "@/components/ui/floating-ai-widget";
import axios from "axios";
import Config from "@/config";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";

interface PersonalQuiz {
  _id: string;
  title: string;
  description: string;
  courseId: {
    _id: string;
    code: string;
    title: string;
  };
  materialId: {
    _id: string;
    title: string;
    type: string;
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

export default function TakePersonalQuizPage() {
  const { quizId } = useParams();
  const { credentials } = useSelector((state: RootState) => state.auth);

  const [quiz, setQuiz] = useState<PersonalQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    lectures: [],
    showHints: true,
    feedbackType: "after" as const,
    timer: 0,
    timerEnabled: false,
    isLinear: true,
    autoNext: false,
    randomizeQuestions: false,
    lectureRange: { start: 0, end: 0 },
  });
  const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId, credentials.accessToken]);

  // Timer effect
  useEffect(() => {
    if (timeLeft !== undefined && timeLeft > 0 && quizSettings.timerEnabled) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev <= 1) {
            finishQuiz();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, quizSettings.timerEnabled]);

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
      const quizData = response.data.quiz;

      // Apply settings
      setQuizSettings({
        lectures: [],
        showHints: quizData.settings.showHints,
        feedbackType: "after",
        timer: quizData.settings.timeLimit || 0,
        timerEnabled: !!quizData.settings.timeLimit,
        isLinear: true,
        autoNext: false,
        randomizeQuestions: quizData.settings.shuffleQuestions,
        lectureRange: { start: 0, end: 0 },
      });

      setQuiz(quizData);
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

  // Quiz-taking functions
  const startQuiz = () => {
    setIsTakingQuiz(true);
    setCurrentQuestion(0);
    setAnswers({});
    setQuizCompleted(false);
    setScore(0);
    if (quizSettings.timerEnabled && quizSettings.timer > 0) {
      setTimeLeft(quizSettings.timer * 60);
    }
  };

  const handleAnswer = (answer: string) => {
    // Handle different answer types appropriately
    if (answer !== undefined && answer !== null) {
      const trimmedAnswer = answer.toString().trim();
      if (trimmedAnswer !== "") {
        setAnswers((prev) => ({ ...prev, [currentQuestion]: trimmedAnswer }));
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = () => {
    const totalQuestions = quiz?.questions.length || 0;
    let correctAnswersCount = 0;

    quiz?.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer && userAnswer.trim() !== "") {
        // For case-insensitive comparison, especially for fill-in questions
        if (question.type === "fill-in") {
          // Trim whitespace and compare case-insensitively for fill-in questions
          if (
            userAnswer.trim().toLowerCase() ===
            question.answer.trim().toLowerCase()
          ) {
            correctAnswersCount++;
          }
        } else {
          // For MCQ and true-false, exact match
          if (userAnswer === question.answer) {
            correctAnswersCount++;
          }
        }
      }
    });

    // Store the raw count, not the percentage
    setScore(correctAnswersCount);

    console.log(
      `Quiz completed: ${correctAnswersCount}/${totalQuestions} correct (${Math.round(
        (correctAnswersCount / totalQuestions) * 100
      )}%)`
    );
    console.log("User answers:", answers);
    console.log(
      "Correct answers:",
      quiz?.questions.map((q) => q.answer)
    );

    setQuizCompleted(true);
    setIsTakingQuiz(false);
  };

  const retakeQuiz = () => {
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    startQuiz();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveSettings = (newSettings: any) => {
    setQuizSettings(newSettings);
    if (newSettings.timerEnabled && newSettings.timer > 0) {
      setTimeLeft(newSettings.timer * 60);
    } else {
      setTimeLeft(undefined);
    }
    setShowSettingsModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="relative">
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-20 animate-pulse" />
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
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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

  // If taking quiz, show quiz interface
  if (isTakingQuiz && quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-6xl px-4">
          {quiz.questions[currentQuestion] ? (
            <>
              <QuizQuestionCard
                question={{
                  _id: `temp-${currentQuestion}`,
                  question: quiz.questions[currentQuestion].question,
                  options: quiz.questions[currentQuestion].options,
                  answer: quiz.questions[currentQuestion].answer,
                  type: quiz.questions[currentQuestion].type,
                  explanation: quiz.questions[currentQuestion].explanation,
                  lectureNumber:
                    quiz.questions[currentQuestion].lectureNumber || "Unknown",
                  hint: quiz.questions[currentQuestion].hint,
                }}
                currentQuestion={currentQuestion}
                totalQuestions={quiz.questions.length}
                userAnswer={answers[currentQuestion] || ""}
                onAnswer={handleAnswer}
                feedback={null}
                showHint={false}
                onToggleHint={() => {}}
                showHints={quizSettings.showHints}
                onPrevious={previousQuestion}
                onNext={nextQuestion}
                canGoPrevious={currentQuestion > 0}
                canGoNext={currentQuestion < quiz.questions.length - 1}
                onOpenSettings={() => setShowSettingsModal(true)}
                onSaveProgress={() => {}}
                timerEnabled={quizSettings.timerEnabled}
                timeLeft={timeLeft}
                formatTime={formatTime}
                onShowProgress={() => setShowProgressModal(true)}
              />

              {/* Finish Quiz Button - Show only on last question */}
              {currentQuestion === quiz.questions.length - 1 && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={finishQuiz}
                    className="bg-gradient-to-br from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Finish Quiz
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                No questions available
              </h2>
              <Button onClick={() => setIsTakingQuiz(false)}>
                Back to Quiz
              </Button>
            </div>
          )}
        </div>

        {/* Floating AI Widget */}
        <FloatingAIWidget
          contextId={quizId as string}
          contextType="question"
          className="fixed bottom-6 right-6 z-40"
        />

        {/* Progress Modal */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <QuizProgressCard
                currentQuestion={currentQuestion}
                totalQuestions={quiz.questions.length}
                timerEnabled={quizSettings.timerEnabled}
                timeLeft={timeLeft}
                formatTime={formatTime}
              />
              <div className="mt-4 text-center">
                <Button onClick={() => setShowProgressModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <QuizSettingsModal
            isOpen={showSettingsModal}
            settings={quizSettings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettingsModal(false)}
            availableLectures={[]}
            quizData={null}
          />
        )}
      </div>
    );
  }

  // If quiz completed, show results
  if (quizCompleted && quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <QuizResultsCard
            score={score}
            totalQuestions={quiz.questions.length}
            questions={quiz.questions.map((q, index) => ({
              _id: `temp-${index}`,
              question: q.question,
              answer: q.answer,
              explanation: q.explanation,
            }))}
            userAnswers={quiz.questions.map((_, index) => answers[index] || "")}
            onRetake={retakeQuiz}
          />
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setQuizCompleted(false)}
              className="mr-4"
            >
              Back to Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz start screen
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/user/personal-quizzes/${quizId}`}>
              <Button
                variant="outline"
                size="sm"
                className="border-border hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quiz
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-4">
              {quiz.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {quiz.description}
            </p>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-medium">Course</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {quiz.courseId.code}: {quiz.courseId.title}
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              <span className="font-medium">Questions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {quiz.questions.length} questions
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-primary" />
              <span className="font-medium">Time Limit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {quiz.settings.timeLimit || "No limit"} minutes
            </p>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="mb-8">
          <div className="p-6 bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Quiz Settings
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(true)}
                className="border-border hover:bg-muted"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showHints"
                  checked={quizSettings.showHints}
                  disabled
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="showHints" className="text-sm text-foreground">
                  Show Hints: {quizSettings.showHints ? "Yes" : "No"}
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="timerEnabled"
                  checked={quizSettings.timerEnabled}
                  disabled
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label
                  htmlFor="timerEnabled"
                  className="text-sm text-foreground"
                >
                  Timer:{" "}
                  {quizSettings.timerEnabled
                    ? `${quizSettings.timer} min`
                    : "No limit"}
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="randomizeQuestions"
                  checked={quizSettings.randomizeQuestions}
                  disabled
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label
                  htmlFor="randomizeQuestions"
                  className="text-sm text-foreground"
                >
                  Shuffle: {quizSettings.randomizeQuestions ? "Yes" : "No"}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={startQuiz}
            className="button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 px-8 py-4 text-lg"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Quiz
          </Button>
        </div>

        {/* Floating AI Widget */}
        <FloatingAIWidget
          contextId={`Quiz: ${quiz.title} | Course: ${quiz.courseId.title} | Questions: ${quiz.questions.length} | Description: ${quiz.description}`}
          contextType="general"
        />

        {/* Settings Modal */}
        {showSettingsModal && (
          <QuizSettingsModal
            isOpen={showSettingsModal}
            settings={quizSettings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettingsModal(false)}
            availableLectures={[]}
            quizData={null}
          />
        )}
      </div>
    </div>
  );
}

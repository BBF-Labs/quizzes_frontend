"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  showToast,
} from "@/components";
import { Loader, Save, RotateCcw, BarChart3 } from "lucide-react";
import { setCurrentQuizQuestion, setQuizStateSettings } from "@/lib";
import { useAppDispatch } from "@/hooks";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib";
import { fetchFullQuiz } from "@/controllers/quizControllers";
import type { FullQuiz } from "@/interfaces";
import { FloatingAIWidget } from "@/components/ui/floating-ai-widget";
import { QuizQuestionCard } from "@/components/QuizQuestionCard";
import { QuizResultsCard } from "@/components/QuizResultsCard";
import { QuizSettingsModal } from "@/components/QuizSettingsModal";

type QuizSettings = {
  lectures: string[];
  showHints: boolean;
  feedbackType: "after" | "during";
  timer: number;
  timerEnabled: boolean;
  isLinear: boolean;
  autoNext: boolean;
  randomizeQuestions: boolean;
  lectureRange: { start: number; end: number };
};

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  answer: string;
  type: string;
  explanation?: string;
  lectureNumber: string;
  hint?: string;
}

export default function QuizPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const dispatch = useAppDispatch();

  const quizIdStr = Array.isArray(quizId) ? quizId[0] : quizId;
  const { credentials } = useSelector((state: RootState) => state.auth);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showHint, setShowHint] = useState(false);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    lectures: [],
    showHints: true,
    feedbackType: "after",
    timer: 600,
    timerEnabled: false,
    isLinear: false,
    autoNext: false,
    randomizeQuestions: false,
    lectureRange: { start: 0, end: 0 },
  });

  const [isQuizSettingsModalOpen, setIsQuizSettingsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [showLastSaved, setShowLastSaved] = useState<boolean>(false);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [quizData, setQuizData] = useState<FullQuiz | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizData = (await dispatch(
          fetchFullQuiz(quizIdStr!, credentials.accessToken)
        )) as FullQuiz;

        setQuizData(quizData);

        // Process quiz questions from the FullQuiz structure
        if (quizData.quizQuestions) {
          const processedQuestions: QuizQuestion[] = [];
          const lectureNames: string[] = [];

          quizData.quizQuestions.forEach((lecture, lectureIndex) => {
            lectureNames.push(lecture.name);
            lecture.questions.forEach((question: any, questionIndex) => {
              processedQuestions.push({
                _id: `${lectureIndex}-${questionIndex}`,
                question: question.question,
                options: question.options || [],
                answer: question.answer,
                type: question.type,
                explanation: question.explanation,
                lectureNumber: lecture.name,
                hint: question.hint,
              });
            });
          });

          setQuestions(processedQuestions);
          setQuizSettings((prev) => ({
            ...prev,
            lectures: lectureNames,
            lectureRange: { start: 0, end: processedQuestions.length - 1 },
          }));
        }

        setIsLoading(false);
        showToast("Quiz loaded successfully!", "success");

        // Check for saved progress
        const savedProgressString = localStorage.getItem(
          `quizProgress_${quizIdStr}`
        );
        if (savedProgressString) {
          const parsedProgress = JSON.parse(savedProgressString);
          setSavedProgress(parsedProgress);
          setShowContinueModal(true);
        }
      } catch (error: any) {
        setIsLoading(false);
        if (
          error.message ===
          "Error: Error validating user quiz access: User does not have access to this quiz"
        ) {
          showToast("You do not have access to this quiz", "error");
          router.push("/quizzes");
        } else {
          showToast(error.message, "error");
        }
      }
    };

    fetchQuizData();
  }, [quizIdStr, credentials.accessToken, dispatch, router]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults && quizSettings.timerEnabled) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !showResults && quizSettings.timerEnabled) {
      setShowResults(true);
      showToast("Time's up! Quiz completed.", "success");
    }
  }, [timeLeft, showResults, quizSettings.timerEnabled]);

  // Handle timer settings changes
  useEffect(() => {
    if (quizSettings.timerEnabled) {
      setTimeLeft(quizSettings.timer);
    }
  }, [quizSettings.timerEnabled, quizSettings.timer]);

  // Initialize timer when component mounts and settings are loaded
  useEffect(() => {
    if (!isLoading && quizSettings.timerEnabled) {
      setTimeLeft(quizSettings.timer);
    }
  }, [isLoading, quizSettings.timerEnabled, quizSettings.timer]);

  const handleSaveSettings = (settings: QuizSettings) => {
    setQuizSettings(settings);
    dispatch(setQuizStateSettings(settings));

    // Initialize timer if enabled
    if (settings.timerEnabled) {
      setTimeLeft(settings.timer);
    }

    resetQuiz(settings);
    setIsQuizSettingsModalOpen(false);
  };

  const saveProgress = useCallback(
    (isPage?: boolean) => {
      const progress = {
        currentQuestion,
        userAnswers,
        timeLeft,
        quizSettings,
      };
      localStorage.setItem(
        `quizProgress_${quizIdStr}`,
        JSON.stringify(progress)
      );
      if (!isPage) {
        showToast("Progress saved successfully!", "success");
      }
    },
    [currentQuestion, userAnswers, timeLeft, quizSettings, quizIdStr]
  );

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);

    if (quizSettings.feedbackType === "during") {
      const isCorrect =
        answer.toLowerCase() ===
        questions[currentQuestion].answer.toLowerCase();
      setFeedback(isCorrect ? "Correct!" : "Incorrect. Try again.");
    }

    if (quizSettings.autoNext) {
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }

      if (questions[currentQuestion].type !== "fill-in") {
        autoNextTimeoutRef.current = setTimeout(() => {
          nextQuestion();
        }, 1500);
      }
    }

    // Save progress after each answer
    saveProgress(true);
  };

  const handleSaveClick = useCallback(() => {
    saveProgress();
    setShowLastSaved(true);
  }, [saveProgress]);

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      dispatch(setCurrentQuizQuestion(currentQuestion + 1));
      setShowHint(false);
      setFeedback(null);
    } else {
      setShowResults(true);
    }

    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0 && !quizSettings.isLinear) {
      setCurrentQuestion(currentQuestion - 1);
      dispatch(setCurrentQuizQuestion(currentQuestion - 1));
      setShowHint(false);
      setFeedback(null);
    }
  };

  const calculateScore = () => {
    return userAnswers.filter(
      (answer, index) =>
        (answer?.toLowerCase() || "No answer provided") ===
        questions[index]?.answer?.toLowerCase()
    ).length;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const shuffleArray = (array: QuizQuestion[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const resetQuiz = (settings: QuizSettings = quizSettings) => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setTimeLeft(settings.timer);
    setFeedback(null);

    // Fix: Handle lecture range properly - if start and end are the same, include all questions from that lecture
    let filteredQuestions: QuizQuestion[];

    if (settings.lectureRange.start === settings.lectureRange.end) {
      // If start and end are the same, get all questions from that lecture index
      const lectureIndex = settings.lectureRange.start;
      const lectureName = settings.lectures[lectureIndex];

      if (lectureName) {
        // Filter questions by lecture name instead of index range
        filteredQuestions = questions.filter(
          (question) => question.lectureNumber === lectureName
        );
      } else {
        // Fallback to original logic if lecture name not found
        filteredQuestions = questions.filter(
          (_, index) =>
            index >= settings.lectureRange.start &&
            index <= settings.lectureRange.end
        );
      }
    } else {
      // Original logic for different start/end values
      filteredQuestions = questions.filter(
        (_, index) =>
          index >= settings.lectureRange.start &&
          index <= settings.lectureRange.end
      );
    }

    setQuestions(
      settings.randomizeQuestions
        ? shuffleArray([...filteredQuestions])
        : filteredQuestions
    );

    localStorage.removeItem(`quizProgress_${quizIdStr}`);
    setSavedProgress(null);
  };

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!showResults) {
        saveProgress(false);
        setShowLastSaved(true);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(autoSaveInterval);
  }, [saveProgress, showResults]);

  useEffect(() => {
    if (showLastSaved) {
      const timer = setTimeout(() => {
        setShowLastSaved(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showLastSaved]);

  const loadSavedProgress = () => {
    if (savedProgress) {
      const { currentQuestion, userAnswers, timeLeft, quizSettings } =
        savedProgress;
      setCurrentQuestion(currentQuestion);
      setUserAnswers(userAnswers);
      setTimeLeft(timeLeft);
      setQuizSettings(quizSettings);

      // Fix: Use the same lecture range logic as resetQuiz
      let filteredQuestions: QuizQuestion[];

      if (quizSettings.lectureRange.start === quizSettings.lectureRange.end) {
        // If start and end are the same, get all questions from that lecture index
        const lectureIndex = quizSettings.lectureRange.start;
        const lectureName = quizSettings.lectures[lectureIndex];

        if (lectureName) {
          // Filter questions by lecture name instead of index range
          filteredQuestions = questions.filter(
            (question) => question.lectureNumber === lectureName
          );
        } else {
          // Fallback to original logic if lecture name not found
          filteredQuestions = questions.filter(
            (_, index) =>
              index >= quizSettings.lectureRange.start &&
              index <= quizSettings.lectureRange.end
          );
        }
      } else {
        // Original logic for different start/end values
        filteredQuestions = questions.filter(
          (_, index) =>
            index >= quizSettings.lectureRange.start &&
            index <= quizSettings.lectureRange.end
        );
      }

      setQuestions(
        quizSettings.randomizeQuestions
          ? shuffleArray([...filteredQuestions])
          : filteredQuestions
      );

      showToast("Saved progress loaded!", "success");
    }
    setIsQuizSettingsModalOpen(false);
    setShowContinueModal(false);
  };

  const discardSavedProgress = () => {
    localStorage.removeItem(`quizProgress_${quizIdStr}`);
    setSavedProgress(null);
    setShowContinueModal(false);
    showToast("Saved progress discarded.", "success");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-card border-border p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="animate-spin h-12 w-12 text-primary" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Loading Quiz
              </h2>
              <p className="text-muted-foreground">
                Fetching quiz and verifying eligibility...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background py-8">
        <QuizResultsCard
          score={calculateScore()}
          totalQuestions={questions.length}
          questions={questions}
          userAnswers={userAnswers}
          onRetake={() => resetQuiz()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Main Quiz Content - Focused on the question */}
      <div className="w-full max-w-6xl px-4">
        {questions[currentQuestion] ? (
          <QuizQuestionCard
            question={questions[currentQuestion]}
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            userAnswer={userAnswers[currentQuestion] || ""}
            onAnswer={handleAnswer}
            feedback={feedback}
            showHint={showHint}
            onToggleHint={() => setShowHint(!showHint)}
            showHints={quizSettings.showHints}
            onPrevious={prevQuestion}
            onNext={nextQuestion}
            canGoPrevious={currentQuestion > 0 && !quizSettings.isLinear}
            canGoNext={Boolean(
              userAnswers[currentQuestion] &&
                userAnswers[currentQuestion].trim() !== ""
            )}
            onOpenSettings={() => setIsQuizSettingsModalOpen(true)}
            onSaveProgress={handleSaveClick}
            timerEnabled={quizSettings.timerEnabled}
            timeLeft={timeLeft}
            formatTime={formatTime}
            onShowProgress={() => setShowProgressModal(true)}
          />
        ) : (
          <Card className="border-0 shadow-lg bg-card border-border flex items-center justify-center">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🤔</div>
              <p className="text-lg text-muted-foreground">
                No question available.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Quiz Progress
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}
                  %
                </div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-secondary">
                  {questions.length - currentQuestion - 1}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Answered:</span>
                <span className="font-medium">
                  {
                    userAnswers.filter(
                      (answer) => answer && answer.trim() !== ""
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correct:</span>
                <span className="font-medium text-green-600">
                  {
                    userAnswers.filter(
                      (answer, index) =>
                        answer &&
                        answer.toLowerCase() ===
                          questions[index]?.answer?.toLowerCase()
                    ).length
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleSaveClick}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              <Button
                variant="outline"
                onClick={() => resetQuiz()}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Continue Modal */}
      <Dialog open={showContinueModal} onOpenChange={setShowContinueModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Continue Saved Progress?</DialogTitle>
            <DialogDescription>
              It looks like you have saved progress. Would you like to continue
              from where you stopped?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={discardSavedProgress}>
              Start New
            </Button>
            <Button onClick={loadSavedProgress}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Settings Modal */}
      <QuizSettingsModal
        isOpen={isQuizSettingsModalOpen}
        onClose={() => setIsQuizSettingsModalOpen(false)}
        settings={quizSettings}
        onSave={handleSaveSettings}
        availableLectures={quizSettings.lectures}
        quizData={quizData}
      />

      {/* AI Widget */}
      <FloatingAIWidget
        contextType="question"
        contextId={questions[currentQuestion]._id}
        className="z-40"
      />
    </div>
  );
}

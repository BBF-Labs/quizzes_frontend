"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  Sheet,
  SheetContent,
  SheetTrigger,
  RadioGroup,
  RadioGroupItem,
  DialogTrigger,
  Progress,
  Input,
  Label,
  QuizSettingsModal,
  SheetTitle,
  showToast,
} from "@/components";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Settings,
  Loader2,
} from "lucide-react";
import { setCurrentQuizQuestion, setQuizStateSettings } from "@/lib";
import { useAppDispatch } from "@/hooks";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib";
import { fetchFullQuiz } from "@/controllers/quizControllers";
import type { FullQuiz } from "@/interfaces";

// Define types for quiz settings and questions
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

interface LectureRange {
  name: string;
  start: number;
  end: number;
}

interface Lecture {
  name: string;
  questions: string[];
  _id: string;
}

export default function QuizPage() {
  const router = useRouter();
  const { quizId } = useParams();
  const dispatch = useAppDispatch();

  const quizIdStr = Array.isArray(quizId) ? quizId[0] : quizId;
  const { credentials } = useSelector((state: RootState) => state.auth);

  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
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
  const [lectureRanges, setLectureRanges] = useState<LectureRange[]>([]);
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizData = (await dispatch(
          fetchFullQuiz(quizIdStr!, credentials.accessToken)
        )) as FullQuiz;

        const lectures = quizData.quizQuestions as unknown as Lecture[];
        const fetchedQuestions: QuizQuestion[] = [];
        const ranges: LectureRange[] = [];
        let currentIndex = 0;

        lectures.forEach((lecture) => {
          const questionsInLecture = lecture.questions.length;
          ranges.push({
            name: lecture.name,
            start: currentIndex,
            end: currentIndex + questionsInLecture - 1,
          });

          lecture.questions.forEach((question: any) => {
            fetchedQuestions.push({
              ...question,
              lectureNumber: lecture.name,
            });
          });

          currentIndex += questionsInLecture;
        });

        setAllQuestions(fetchedQuestions);
        setQuestions(fetchedQuestions);
        setLectureRanges(ranges);
        setQuizSettings((prev) => ({
          ...prev,
          lectures: ranges.map((lecture) => lecture.name),
          lectureRange: { start: 0, end: fetchedQuestions.length - 1 },
        }));
        setIsLoading(false);
        showToast("Quiz loaded successfully!", "success");
      } catch (error: any) {
        setIsLoading(false);
        if (
          error.message ===
          "Error: Error validating user quiz access: User  does not have access to this quiz"
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
    } else if (timeLeft === 0 && !showResults) {
      setShowResults(true);
    }
  }, [timeLeft, showResults, quizSettings.timerEnabled]);

  const handleSaveSettings = (settings: QuizSettings) => {
    setQuizSettings(settings);
    dispatch(setQuizStateSettings(settings));
    setTimeLeft(settings.timer);
    resetQuiz(settings);
    setIsQuizSettingsModalOpen(false);
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);

    if (quizSettings.feedbackType === "during") {
      const isCorrect =
        answer.toLowerCase() ===
        questions[currentQuestion].answer.toLowerCase();
      showFeedback(isCorrect);
    }

    if (quizSettings.autoNext) {
      // Clear any existing timeout
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }

      // Set a new timeout, but don't auto-advance for fill-in questions
      if (questions[currentQuestion].type !== "fill-in") {
        autoNextTimeoutRef.current = setTimeout(() => {
          nextQuestion();
        }, 1500); // 1.5 seconds delay
      }
    }
  };

  const showFeedback = (isCorrect: boolean) => {
    const feedbackElement = document.getElementById("feedback");
    if (feedbackElement) {
      feedbackElement.textContent = isCorrect
        ? "Correct!"
        : "Incorrect. Try again.";
      feedbackElement.className = isCorrect ? "text-green-500" : "text-red-500";
      feedbackElement.style.display = "block";
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      dispatch(setCurrentQuizQuestion(currentQuestion + 1));
      setShowHint(false);
    } else {
      setShowResults(true);
    }

    // Clear the timeout when moving to the next question
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0 && !quizSettings.isLinear) {
      setCurrentQuestion(currentQuestion - 1);
      dispatch(setCurrentQuizQuestion(currentQuestion - 1));
      setShowHint(false);
    }
  };

  const calculateScore = () => {
    return userAnswers.filter(
      (answer, index) =>
        answer.toLowerCase() === questions[index]?.answer?.toLowerCase()
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

    const filteredQuestions = allQuestions.filter(
      (_, index) =>
        index >= settings.lectureRange.start &&
        index <= settings.lectureRange.end
    );

    setQuestions(
      settings.randomizeQuestions
        ? shuffleArray([...filteredQuestions])
        : filteredQuestions
    );
  };

  const getFormattedLectureName = (lectureName: string | undefined) => {
    if (!lectureName) return "Unknown Lecture";
    return lectureName;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg font-semibold">Fetching quiz...</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <Card className="max-w-2xl mx-auto mt-24">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4 overflow-y-auto">
            You scored {calculateScore()} out of {questions.length}
          </p>
          <Progress
            value={(calculateScore() / questions.length) * 100}
            className="mb-6"
          />
          {questions.map((question, index) => (
            <div key={index} className="mb-4 p-4 bg-muted rounded-lg">
              <div
                className="font-semibold"
                dangerouslySetInnerHTML={{ __html: question.question }}
              />
              <div className="text-muted-foreground">
                Your answer: {userAnswers[index] || "No answer provided"}
              </div>
              <div
                className={
                  (userAnswers[index]?.toLowerCase() || "") ===
                  (question.answer?.toLowerCase() || "")
                    ? "text-green-500"
                    : "text-red-500"
                }
                dangerouslySetInnerHTML={{
                  __html: `Correct answer: ${question.answer}`,
                }}
              ></div>
              <p
                className="text-sm text-muted-foreground mt-2"
                dangerouslySetInnerHTML={{ __html: question.explanation || "" }}
              ></p>
            </div>
          ))}
          <Button onClick={() => resetQuiz()} className="mt-4">
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-24">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {questions.length > currentQuestion
              ? getFormattedLectureName(
                  questions[currentQuestion].lectureNumber
                )
              : "Unknown Lecture"}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {quizSettings.timerEnabled && (
              <div className="flex items-center space-x-1 bg-primary text-primary px-2 py-1 rounded button-gradient">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setIsQuizSettingsModalOpen(!isQuizSettingsModalOpen)
                  }
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Open settings</span>
                </Button>
              </DialogTrigger>
              <QuizSettingsModal
                onClose={() => setIsQuizSettingsModalOpen(false)}
                isOpen={isQuizSettingsModalOpen}
                initialSettings={quizSettings}
                onSave={handleSaveSettings}
                lectureRanges={lectureRanges}
              />
            </Dialog>
            <Button onClick={() => resetQuiz()}>Reset Quiz</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="mb-4 md:hidden hover:button-gradient"
              >
                Show Progress
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="hidden">x</SheetTitle>
              <QuizProgress
                currentQuestion={currentQuestion}
                totalQuestions={questions.length}
              />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block mb-6">
            <QuizProgress
              currentQuestion={currentQuestion}
              totalQuestions={questions.length}
            />
          </div>

          <div className="space-y-4">
            {questions[currentQuestion] ? (
              <>
                <div
                  className="text-xl font-semibold mb-2"
                  dangerouslySetInnerHTML={{
                    __html: questions[currentQuestion].question,
                  }}
                ></div>

                {questions[currentQuestion].type === "mcq" && (
                  <RadioGroup
                    value={userAnswers[currentQuestion] || ""}
                    onValueChange={handleAnswer}
                  >
                    {questions[currentQuestion].options.map((option, index) => (
                      <Label
                        key={index}
                        className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted"
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <div dangerouslySetInnerHTML={{ __html: option }}></div>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {questions[currentQuestion].type === "true-false" && (
                  <RadioGroup
                    value={userAnswers[currentQuestion] || ""}
                    onValueChange={handleAnswer}
                  >
                    <Label className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted">
                      <RadioGroupItem value="true" id="true" />
                      <span>True</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-muted">
                      <RadioGroupItem value="false" id="false" />
                      <span>False</span>
                    </Label>
                  </RadioGroup>
                )}

                {questions[currentQuestion].type === "fill-in" && (
                  <Input
                    type="text"
                    value={userAnswers[currentQuestion] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Type your answer here"
                  />
                )}

                <div
                  id="feedback"
                  style={{ display: "none" }}
                  className="mt-2 font-semibold"
                ></div>

                {quizSettings.showHints &&
                  showHint &&
                  questions[currentQuestion].hint && (
                    <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                      <AlertCircle className="inline mr-2" />
                      Hint: {questions[currentQuestion].hint}
                    </div>
                  )}

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={quizSettings.isLinear || currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  {quizSettings.showHints && (
                    <Button
                      onClick={() => setShowHint(!showHint)}
                      variant={`${!showHint ? "outline" : "destructive"}`}
                    >
                      {showHint ? (
                        <CheckCircle className="mr-2" />
                      ) : (
                        <HelpCircle className="mr-2" />
                      )}
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                  )}
                  <Button
                    variant="gradient"
                    onClick={nextQuestion}
                    disabled={
                      quizSettings.autoNext &&
                      questions[currentQuestion].type !== "fill-in"
                    }
                  >
                    {currentQuestion === questions.length - 1
                      ? "Finish"
                      : "Next"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">No question available.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const QuizProgress = ({
  currentQuestion,
  totalQuestions,
}: {
  currentQuestion: number;
  totalQuestions: number;
}) => (
  <div className="space-y-2">
    <h3 className="font-semibold text-lg">Quiz Progress</h3>
    <Progress
      value={(currentQuestion / totalQuestions) * 100}
      className="w-full"
    />
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>
        Question {currentQuestion + 1} of {totalQuestions}
      </span>
      <span>
        {Math.round((currentQuestion / totalQuestions) * 100)}% Complete
      </span>
    </div>
  </div>
);

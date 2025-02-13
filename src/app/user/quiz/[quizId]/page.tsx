"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { setCurrentQuizQuestion, setQuizStateSettings } from "@/lib";
import { useAppDispatch } from "@/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import { fetchFullQuiz } from "@/controllers/quizControllers";
import { FullQuiz } from "@/interfaces";

// Define types for quiz settings and questions
type QuizSettings = {
  lectures: string[];
  showHints: boolean;
  feedbackType: "after" | "during";
  timer: number;
  timerEnabled: boolean;
  isLinear: boolean;
  autoNext: boolean;
  randomizeQuestions: boolean; // Added randomization option
};

interface QuizQuestion {
  _id?: string; // Added _id for each question
  question: string; // Corrected type from "string" to string
  options: string[]; // Changed to string array
  answer: string; // Corrected type from "string" to string
  type: string; // Corrected type from "string" to string
  explanation?: string;
  lectureNumber: string;
  hint?: string;
}

interface LectureRange {
  name: string;
  start: number;
  end: number;
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
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
  });

  const [isQuizSettingsModalOpen, setIsQuizSettingsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lectureRanges, setLectureRanges] = useState<LectureRange[]>([]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizData = (await dispatch(
          fetchFullQuiz(quizIdStr!, credentials.accessToken)
        )) as FullQuiz;

        if (!quizData) {
          showToast("You don't have Access to this quiz", "error");
          router.push("/quizzes");
          return;
        }

        const fetchedQuestions =
          (quizData.quizQuestions!.flatMap(
            (lecture: any) => lecture.questions
          ) as unknown as QuizQuestion[]) || [];

        // Create lecture ranges dynamically based on fetched questions
        const ranges: LectureRange[] = [];
        let currentIndex = 0;

        quizData.quizQuestions!.forEach((lecture: any) => {
          const questionsInLecture = lecture.questions.length;
          const lectureName = lecture.name.startsWith("Lecture")
            ? lecture.name
            : lecture.name.replace("Lecture ", ""); // Remove "Lecture" prefix if not in the format

          ranges.push({
            name: lectureName,
            start: currentIndex,
            end: currentIndex + questionsInLecture - 1,
          });
          currentIndex += questionsInLecture;
        });

        // Set the questions and quiz settings
        setQuestions(fetchedQuestions);
        setLectureRanges(ranges);
        setQuizSettings((prev) => ({
          ...prev,
          lectures: ranges.map((lecture) => lecture.name),
        }));
        setIsLoading(false);
        showToast("Quiz loaded successfully!", "success");
      } catch (error: any) {
        setIsLoading(false);
        showToast(`Failed to load quiz: ${error.message}`, "error");
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

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);

    if (quizSettings.autoNext) {
      nextQuestion();
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

  const handleSaveSettings = (settings: QuizSettings) => {
    settings.lectures = lectureRanges.map((lecture) => lecture.name);
    setQuizSettings(settings);
    dispatch(setQuizStateSettings(settings));
    setTimeLeft(settings.timer);
    if (settings.randomizeQuestions) {
      setQuestions(shuffleArray(questions));
    }
    setIsQuizSettingsModalOpen(false);
  };

  const QuizProgress = () => (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">Quiz Progress</h3>
      <Progress
        value={(currentQuestion / questions.length) * 100}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <span>
          {Math.round((currentQuestion / questions.length) * 100)}% Complete
        </span>
      </div>
    </div>
  );

  const shuffleArray = (array: QuizQuestion[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setTimeLeft(quizSettings.timer);
  };

  const getFormattedLectureName = (lectureName: string) => {
    const match = lectureName.match(/Lecture \d+/);
    return match ? lectureName : lectureName.split(" ")[1];
  };

  if (isLoading) {
    return <div className="text-center">Loading quiz...</div>;
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
              <p className="font-semibold">{question.question}</p>
              <p className="text-muted-foreground">
                Your answer: {userAnswers[index]}
              </p>
              <p
                className={
                  userAnswers[index]?.toLowerCase() ===
                  question.answer?.toLowerCase()
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                Correct answer: {question.answer}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {question.explanation}
              </p>
            </div>
          ))}
          <Button onClick={resetQuiz} className="mt-4">
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
            {getFormattedLectureName(quizSettings.lectures[currentQuestion])}
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
              />
            </Dialog>
            <Button onClick={resetQuiz}>Reset Quiz</Button>
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
              <QuizProgress />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block mb-6">
            <QuizProgress />
          </div>

          <div className="space-y-4">
            {questions[currentQuestion] ? (
              <>
                <h2 className="text-xl font-semibold mb-2">
                  {questions[currentQuestion].question}
                </h2>

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
                        <span>{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                )}

                {questions[currentQuestion].type === "true-false" && (
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
                        <span>{option}</span>
                      </Label>
                    ))}
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
                  <Button variant="gradient" onClick={nextQuestion}>
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

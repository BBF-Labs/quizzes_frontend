"use client";

import { useState, useEffect } from "react";
import {
  Progress,
  Label,
  Button,
  QuizSettingsModal,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  RadioGroup,
  RadioGroupItem,
  Input,
} from "@/components";
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Clock,
  Save,
} from "lucide-react";
import type { IQuestion, IQuizQuestion, QuizSettings } from "@/types/quiz";

// Mock data - replace with actual data fetching
const mockQuizQuestion: IQuizQuestion = {
  _id: "1",
  name: "Sample Quiz",
  courseId: "101",
  isApproved: true,
  quizQuestions: [
    {
      name: "Lecture 1",
      questions: ["1", "2", "3"],
    },
    {
      name: "Lecture 2",
      questions: ["4", "5", "6"],
    },
  ],
  creditHours: 3,
};

const mockQuestions: IQuestion[] = [
  {
    _id: "1",
    question: "What is the capital of France?",
    type: "mcq",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital and most populous city of France.",
    hint: "It's known as the City of Light",
  },
  {
    _id: "2",
    question: "The Earth is flat.",
    type: "true-false",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation:
      "The Earth is actually an oblate spheroid, slightly flattened at the poles and bulging at the equator.",
    hint: "Think about satellite images and circumnavigation.",
  },
  {
    _id: "3",
    question: "The largest planet in our solar system is _______.",
    type: "fill-in",
    options: [],
    correctAnswer: "Jupiter",
    explanation:
      "Jupiter is the largest planet in our solar system, with a mass more than two and a half times that of all the other planets combined.",
    hint: "It's named after the king of the Roman gods.",
  },
];

export default function QuizPage() {
  const [quizQuestion, setQuizQuestion] = useState<IQuizQuestion | null>(null);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [showHint, setShowHint] = useState(false);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    lectureNumber: "",
    showHints: true,
    feedbackType: "after",
    timer: 600,
    timerEnabled: true,
    isLinear: false,
    autoNext: false, // Ensure this is included in the settings
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(true);
  const [savedAnswers, setSavedAnswers] = useState<string[]>([]);

  useEffect(() => {
    // Simulating data fetching
    setQuizQuestion(mockQuizQuestion);
    setQuestions(mockQuestions);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !showResults) {
      setShowResults(true);
    }
  }, [timeLeft, showResults]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);

    // Automatically go to the next question if autoNext is enabled
    if (quizSettings.autoNext) {
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0 && !quizSettings.isLinear) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
    }
  };

  const calculateScore = () => {
    return userAnswers.filter(
      (answer, index) =>
        answer.toLowerCase() === questions[index].correctAnswer.toLowerCase()
    ).length;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSettingsSave = (settings: QuizSettings) => {
    setQuizSettings(settings);
    setTimeLeft(settings.timer);
  };

  const handleSave = () => {
    setSavedAnswers([...userAnswers]);
    setUserAnswers([...savedAnswers]);
  };

  if (!quizQuestion || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        Loading...
      </div>
    );
  }

  if (showResults) {
    return (
      <div>
        <main className="container mx-auto max-w-6xl mt-24 p-4">
          <Card className="bg-card shadow-lg transition-transform transform hover:scale-105">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">
                Quiz Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4 text-foreground">
                You scored {calculateScore()} out of {questions.length}
              </p>
              <Progress
                value={(calculateScore() / questions.length) * 100}
                className="mb-4"
              />
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-muted rounded-lg shadow-md"
                >
                  <p className="font-semibold text-foreground">
                    {question.question}
                  </p>
                  <p className="text-muted-foreground">
                    Your answer: {userAnswers[index]}
                  </p>
                  <p
                    className={
                      userAnswers[index].toLowerCase() ===
                      question.correctAnswer.toLowerCase()
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Correct answer: {question.correctAnswer}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {question.explanation}
                  </p>
                </div>
              ))}
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retake Quiz
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="container flex flex-col justify-center mx-auto max-w-6xl mt-24 p-4">
        <QuizSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSettingsSave}
        />
        <Card className="bg-card mb-6 shadow-lg border-teal-500 border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">
              {quizQuestion.name} - {quizSettings.lectureNumber}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {quizSettings.timerEnabled && (
                <div className="flex items-center space-x-1 bg-primary text-primary-foreground px-2 py-1 rounded">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <Progress
                value={(currentQuestion / questions.length) * 100}
                className="w-2/3 "
              />
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mr-1"></div>
                  <span>Answered: {userAnswers.filter(Boolean).length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                  <span>
                    Unanswered:{" "}
                    {questions.length - userAnswers.filter(Boolean).length}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-lg font-medium text-foreground mb-4">
              {questions[currentQuestion].question}
            </p>
            {questions[currentQuestion].type === "mcq" && (
              <RadioGroup
                value={userAnswers[currentQuestion] || ""}
                onValueChange={handleAnswer}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {questions[currentQuestion].type === "true-false" && (
              <RadioGroup
                value={userAnswers[currentQuestion] || ""}
                onValueChange={handleAnswer}
              >
                {questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {questions[currentQuestion].type === "fill-in" && (
              <Input
                type="text"
                value={userAnswers[currentQuestion] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here"
                className="mt-2 p-2 border rounded"
              />
            )}
            {quizSettings.showHints &&
              showHint &&
              questions[currentQuestion].hint && (
                <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
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
                  variant="outline"
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
                {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

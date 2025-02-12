"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components";
import { CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface UserAnswer {
  questionId: number;
  answer: string;
}

// Mock data - replace with actual data fetching in a real application
const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    explanation: "Paris is the capital and most populous city of France.",
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    explanation:
      "Mars is often called the Red Planet due to its reddish appearance in the night sky, caused by iron oxide (rust) on its surface.",
  },
  // Add more questions as needed
];

const mockUserAnswers: UserAnswer[] = [
  { questionId: 1, answer: "Paris" },
  { questionId: 2, answer: "Venus" },
  // Add more user answers as needed
];

export default function FeedbackPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // In a real application, you would fetch this data from your backend
    setQuestions(mockQuestions);
    setUserAnswers(mockUserAnswers);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = userAnswers.find(
    (ua) => ua.questionId === currentQuestion?.id
  );

  const isCorrect = userAnswer?.answer === currentQuestion?.correctAnswer;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <main className="container mx-auto mt-24 p-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              Quiz Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <p className="text-foreground">{currentQuestion.question}</p>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded ${
                      option === currentQuestion.correctAnswer
                        ? "bg-green-100 dark:bg-green-900"
                        : option === userAnswer?.answer
                        ? "bg-red-100 dark:bg-red-900"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {option}
                    {option === currentQuestion.correctAnswer ||
                      (isCorrect && (
                        <CheckCircle
                          className="inline-block ml-2 text-green-500"
                          size={16}
                        />
                      ))}
                    {option === userAnswer?.answer &&
                      option !== currentQuestion.correctAnswer && (
                        <XCircle
                          className="inline-block ml-2 text-red-500"
                          size={16}
                        />
                      )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="font-semibold text-foreground">Explanation:</p>
                <p className="text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>
              <div className="flex justify-between mt-6">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: "multiple-choice" | "true-false" | "fill-in-blank";
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  timeLimit?: number;
  showHints?: boolean;
  showExplanations?: boolean;
  userAnswer?: string;
  isAnswered?: boolean;
  isReviewMode?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onPrevious,
  timeLimit,
  showHints = true,
  showExplanations = true,
  userAnswer,
  isAnswered = false,
  isReviewMode = false,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || "");
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLimit && timeLimit > 0 && !isAnswered && !isReviewMode) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLimit, isAnswered, isReviewMode]);

  // Reset timer when question changes
  useEffect(() => {
    if (timeLimit && timeLimit > 0) {
      setTimeRemaining(timeLimit);
      setIsTimeUp(false);
    }
  }, [question.id, timeLimit]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered || isReviewMode) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswered) return;

    const isCorrect =
      question.type === "multiple-choice" || question.type === "true-false"
        ? question.options?.find((opt) => opt.id === selectedAnswer)?.isCorrect
        : selectedAnswer.toLowerCase() ===
          question.correctAnswer?.toLowerCase();

    onAnswer(question.id, selectedAnswer, !!isCorrect);
  };

  const handleNext = () => {
    if (questionNumber < totalQuestions) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (questionNumber > 1) {
      onPrevious();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQuestionTypeIcon = () => {
    switch (question.type) {
      case "multiple-choice":
        return <CheckCircle className="w-4 h-4" />;
      case "true-false":
        return <XCircle className="w-4 h-4" />;
      case "fill-in-blank":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isCorrectAnswer = (optionId: string) => {
    if (!isAnswered || !showExplanations) return false;
    return question.options?.find((opt) => opt.id === optionId)?.isCorrect;
  };

  const isUserAnswer = (optionId: string) => {
    return selectedAnswer === optionId;
  };

  const getOptionStyle = (optionId: string) => {
    if (!isAnswered || !showExplanations) {
      return selectedAnswer === optionId
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500";
    }

    if (isCorrectAnswer(optionId)) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }

    if (isUserAnswer(optionId) && !isCorrectAnswer(optionId)) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20";
    }

    return "border-gray-200 dark:border-gray-600 opacity-60";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              {getQuestionTypeIcon()}
              <span className="text-sm capitalize">
                {question.type.replace("-", " ")}
              </span>
            </div>
          </div>

          {timeLimit && timeLimit > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span
                className={`text-lg font-mono font-semibold ${
                  timeRemaining <= 10
                    ? "text-red-600"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <Progress
            value={(questionNumber / totalQuestions) * 100}
            className="h-2"
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
            {question.text}
          </h2>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Answer Options */}
        {question.type === "multiple-choice" && question.options && (
          <div className="space-y-3 mb-6">
            {question.options.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={isAnswered || isReviewMode}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${getOptionStyle(
                  option.id
                )} ${
                  !isAnswered && !isReviewMode
                    ? "cursor-pointer hover:shadow-md"
                    : "cursor-default"
                }`}
                whileHover={!isAnswered && !isReviewMode ? { scale: 1.02 } : {}}
                whileTap={!isAnswered && !isReviewMode ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-3">
                  {isAnswered && showExplanations && (
                    <div className="flex-shrink-0">
                      {isCorrectAnswer(option.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : isUserAnswer(option.id) &&
                        !isCorrectAnswer(option.id) ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : null}
                    </div>
                  )}
                  <span className="text-gray-700 dark:text-gray-300">
                    {option.text}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {question.type === "true-false" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {["true", "false"].map((option) => (
              <motion.button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered || isReviewMode}
                className={`p-4 text-center rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === option
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                } ${
                  !isAnswered && !isReviewMode
                    ? "cursor-pointer hover:shadow-md"
                    : "cursor-default"
                }`}
                whileHover={!isAnswered && !isReviewMode ? { scale: 1.02 } : {}}
                whileTap={!isAnswered && !isReviewMode ? { scale: 0.98 } : {}}
              >
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {option}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {question.type === "fill-in-blank" && (
          <div className="mb-6">
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={isAnswered || isReviewMode}
              placeholder="Type your answer here..."
              className="w-full p-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 disabled:opacity-60"
            />
          </div>
        )}

        {/* Hint */}
        {showHints && question.hint && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 {question.hint}
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Explanation */}
        {showExplanations && question.explanation && isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Explanation:
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              {question.explanation}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button
              onClick={handlePrevious}
              disabled={questionNumber <= 1}
              variant="outline"
              className="border-gray-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {!isAnswered && !isReviewMode && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || isTimeUp}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Answer
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {isAnswered && questionNumber < totalQuestions && (
              <Button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Next Question
              </Button>
            )}

            {questionNumber === totalQuestions && isAnswered && (
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Finish Quiz
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Time Up Warning */}
      {isTimeUp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              Time&apos;s up! Please submit your answer.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

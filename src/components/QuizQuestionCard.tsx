"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Save,
  Settings,
  Clock,
  BarChart3,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useState, useEffect } from "react";

interface QuizQuestionCardProps {
  question: {
    _id: string;
    question: string;
    options: string[];
    answer: string;
    type: string;
    explanation?: string;
    lectureNumber: string;
    hint?: string;
  };
  currentQuestion: number;
  totalQuestions: number;
  userAnswer: string;
  onAnswer: (answer: string) => void;
  feedback: string | null;
  showHint: boolean;
  onToggleHint: () => void;
  showHints: boolean;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onOpenSettings?: () => void;
  onSaveProgress?: () => void;
  timerEnabled?: boolean;
  timeLeft?: number;
  formatTime?: (time: number) => string;
  onShowProgress?: () => void;
}

export function QuizQuestionCard({
  question,
  currentQuestion,
  totalQuestions,
  userAnswer,
  onAnswer,
  feedback,
  showHint,
  onToggleHint,
  showHints,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onOpenSettings,
  onSaveProgress,
  timerEnabled,
  timeLeft,
  formatTime,
  onShowProgress,
}: QuizQuestionCardProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Trigger shake animation whenever userAnswer changes and it's wrong
  useEffect(() => {
    if (userAnswer && feedback) {
      if (feedback === "Correct!") {
        setIsCorrect(true);
        setIsShaking(false);
      } else {
        setIsCorrect(false);
        setIsShaking(true);
        // Stop shaking after animation completes
        const timer = setTimeout(() => setIsShaking(false), 600);
        return () => clearTimeout(timer);
      }
    } else {
      setIsCorrect(false);
      setIsShaking(false);
    }
  }, [userAnswer, feedback]);

  // Reset states when question changes
  useEffect(() => {
    setIsShaking(false);
    setIsCorrect(false);
  }, [currentQuestion]);

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "mcq":
        return "Multiple Choice";
      case "true-false":
        return "True/False";
      case "fill-in":
        return "Fill in the Blank";
      default:
        return "Question";
    }
  };

  return (
    <motion.div
      key={currentQuestion} // Add key for animation on question change
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut", type: "spring" }}
      className="w-full flex justify-center"
    >
      {/* Navigation - Side by Side with Question */}
      <div className="flex items-center gap-6 max-w-6xl w-full">
        {/* Left Navigation Button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="border-border hover:bg-muted rounded-full w-14 h-14 p-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Question Content - Center */}
        <div className="flex-1 max-w-4xl">
          {/* Question Header Card */}
          <motion.div
            animate={
              isShaking
                ? {
                    x: [-10, 10, -10, 10, -5, 5, -2, 2, 0],
                    borderColor: ["#ef4444", "#dc2626", "#b91c1c"],
                  }
                : isCorrect
                ? {
                    scale: [1, 1.02, 1],
                    borderColor: ["#14b8a6", "#0d9488", "#0f766e"],
                  }
                : {}
            }
            transition={
              isShaking
                ? {
                    duration: 0.6,
                    ease: "easeInOut",
                  }
                : isCorrect
                ? {
                    duration: 0.5,
                    ease: "easeOut",
                  }
                : {}
            }
          >
            <Card
              className={`mb-4 border-2 shadow-lg bg-card overflow-hidden transition-all duration-300 ${
                isShaking
                  ? "border-red-500 bg-red-50/50 dark:bg-red-950/20"
                  : isCorrect
                  ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20"
                  : "border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg">
                      {currentQuestion + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                          {getQuestionTypeLabel(question.type)}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="font-medium">
                            {currentQuestion + 1}
                          </span>
                          <span className="mx-1">/</span>
                          <span className="font-medium">{totalQuestions}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {question.lectureNumber}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    {showHints && question.hint && (
                      <Button
                        onClick={onToggleHint}
                        variant={showHint ? "destructive" : "outline"}
                        size="sm"
                        className="border-border hover:bg-accent text-xs px-2 py-1"
                      >
                        {showHint ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Hide
                          </>
                        ) : (
                          <>
                            <HelpCircle className="mr-1 h-3 w-3" />
                            Hint
                          </>
                        )}
                      </Button>
                    )}
                    {onSaveProgress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onSaveProgress}
                        className="border-border hover:bg-accent text-xs px-2 py-1"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    )}
                    {onOpenSettings && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenSettings}
                        className="border-border hover:bg-accent text-xs px-2 py-1"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quiz Header Information - Below the buttons */}
                <div className="flex items-center justify-between mb-3">
                  {/* Essential Actions */}
                  <div className="flex items-center gap-2">
                    {/* Timer */}
                    {timerEnabled && timeLeft !== undefined && formatTime && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-teal-500 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        {formatTime(timeLeft)}
                      </div>
                    )}

                    {/* Progress Button */}
                    {onShowProgress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onShowProgress}
                        className="border-border hover:bg-accent text-xs px-2 py-1"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Progress
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestion + 1) / totalQuestions) * 100
                      }%`,
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  className={`text-lg font-semibold leading-relaxed mb-4 transition-colors duration-300 ${
                    isShaking
                      ? "text-red-800 dark:text-red-200"
                      : isCorrect
                      ? "text-teal-800 dark:text-teal-200"
                      : "text-foreground"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: question.question,
                  }}
                />

                {/* Hint Display */}
                {showHints && showHint && question.hint && (
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1 text-sm">
                          Hint
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                          {question.hint}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Answer Options Card */}
          <Card className="mb-4 border-0 shadow-lg bg-card border-border">
            <CardContent className="p-4">
              {question.type === "mcq" && (
                <RadioGroup
                  value={userAnswer || ""}
                  onValueChange={onAnswer}
                  className="space-y-2"
                >
                  {question.options.map((option, index) => (
                    <Label
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg border-2 border-border cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`option-${index}`}
                        className="text-primary border-2 border-border group-hover:border-primary"
                      />
                      <div
                        className="flex-1 text-foreground group-hover:text-foreground transition-colors"
                        dangerouslySetInnerHTML={{ __html: option }}
                      />
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {question.type === "true-false" && (
                <RadioGroup
                  value={userAnswer || ""}
                  onValueChange={onAnswer}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  <Label className="flex items-center justify-center space-x-3 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-200 group">
                    <RadioGroupItem
                      value="true"
                      id="true"
                      className="text-green-600"
                    />
                    <span className="font-semibold text-foreground group-hover:text-foreground">
                      True
                    </span>
                  </Label>
                  <Label className="flex items-center justify-center space-x-3 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 group">
                    <RadioGroupItem
                      value="false"
                      id="false"
                      className="text-red-600"
                    />
                    <span className="font-semibold text-foreground group-hover:text-foreground">
                      False
                    </span>
                  </Label>
                </RadioGroup>
              )}

              {question.type === "fill-in" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="fill-in-answer"
                    className="text-sm font-medium text-foreground"
                  >
                    Type your answer:
                  </Label>
                  <Input
                    id="fill-in-answer"
                    type="text"
                    value={userAnswer || ""}
                    onChange={(e) => onAnswer(e.target.value)}
                    placeholder="Enter your answer here..."
                    className="h-10 text-base border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background text-foreground"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Navigation Button */}
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="bg-gradient-to-br from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full w-14 h-14 p-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex-shrink-0"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

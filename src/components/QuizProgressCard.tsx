"use client";

import { motion } from "framer-motion";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface QuizProgressCardProps {
  currentQuestion: number;
  totalQuestions: number;
  timeLeft?: number;
  timerEnabled?: boolean;
  formatTime?: (time: number) => string;
}

export function QuizProgressCard({
  currentQuestion,
  totalQuestions,
  timeLeft,
  timerEnabled,
  formatTime,
}: QuizProgressCardProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const remainingQuestions = totalQuestions - currentQuestion - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Quiz Progress
            </CardTitle>
            {timerEnabled && timeLeft !== undefined && formatTime && (
              <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg">
                <span className="text-sm font-bold">⏰</span>
                <span className="font-mono font-bold text-sm">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="relative">
              <Progress
                value={progressPercentage}
                className="h-3 w-full bg-gray-200 dark:bg-gray-700"
              />
              <div
                className="absolute inset-0 bg-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  clipPath: "inset(0 0 0 0)",
                }}
              />
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-xs text-blue-500 dark:text-blue-400">
                  Complete
                </div>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {remainingQuestions}
                </div>
                <div className="text-xs text-teal-500 dark:text-teal-400">
                  Remaining
                </div>
              </div>
            </div>

            {/* Question Counter */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Question{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentQuestion + 1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalQuestions}
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {currentQuestion + 1 === totalQuestions ? "Final Question" : `${remainingQuestions} to go`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Clock, Save, Settings, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface QuizHeaderCardProps {
  lectureName: string;
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  timerEnabled: boolean;
  lastSaved: Date | null;
  showLastSaved: boolean;
  onSettingsClick: () => void;
  onResetClick: () => void;
  onSaveClick: () => void;
  formatTime: (time: number) => string;
}

export function QuizHeaderCard({
  lectureName,
  currentQuestion,
  totalQuestions,
  timeLeft,
  timerEnabled,
  lastSaved,
  showLastSaved,
  onSettingsClick,
  onResetClick,
  onSaveClick,
  formatTime,
}: QuizHeaderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {lectureName}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Question {currentQuestion + 1} of {totalQuestions}
                </span>
                <span>•</span>
                <span>
                  {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}% Complete
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Timer */}
              {timerEnabled && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onSettingsClick}
                  className="hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-700"
                  title="Quiz Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={onResetClick}
                  className="hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20 dark:hover:border-orange-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={onSaveClick}
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Last Saved Notification */}
          {lastSaved && showLastSaved && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Progress saved successfully!
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {currentQuestion + 1}
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-400">
                Current
              </div>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800 text-center">
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {totalQuestions}
              </div>
              <div className="text-xs text-teal-500 dark:text-teal-400">
                Total
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {totalQuestions - currentQuestion - 1}
              </div>
              <div className="text-xs text-purple-500 dark:text-purple-400">
                Remaining
              </div>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%
              </div>
              <div className="text-xs text-orange-500 dark:text-orange-400">
                Complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

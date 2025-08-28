"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface QuizResultsCardProps {
  score: number;
  totalQuestions: number;
  questions: Array<{
    _id: string;
    question: string;
    answer: string;
    explanation?: string;
  }>;
  userAnswers: string[];
  onRetake: () => void;
}

export function QuizResultsCard({
  score,
  totalQuestions,
  questions,
  userAnswers,
  onRetake,
}: QuizResultsCardProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getScoreMessage = () => {
    if (percentage === 100) return "Perfect score! 🎉";
    if (percentage >= 80) return "Great job! 🚀";
    if (percentage >= 60) return "Good work! 👍";
    return "Keep practicing! 💪";
  };

  const getScoreColor = () => {
    if (percentage === 100) return "from-green-500 to-emerald-500";
    if (percentage >= 80) return "from-blue-500 to-indigo-500";
    if (percentage >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Header */}
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            🎯
          </motion.div>
          <CardTitle className="text-3xl font-bold">Quiz Results</CardTitle>
          <p className="text-teal-100 text-lg">You&apos;ve completed the quiz!</p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Score Summary */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {score} out of {totalQuestions}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-6"
            >
              {getScoreMessage()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto"
            >
              <Progress
                value={percentage}
                className="h-4 mb-4"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {percentage}% Complete
              </div>
            </motion.div>
          </div>

          {/* Question Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Question Review
            </h3>
            
            {questions.map((question, index) => {
              const isCorrect = (userAnswers[index]?.toLowerCase() || "") === (question.answer?.toLowerCase() || "");
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-semibold text-gray-900 dark:text-white mb-3"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-400">Your answer:</span>
                          <span className={`font-medium ${
                            isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          }`}>
                            {userAnswers[index] || "No answer provided"}
                          </span>
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>

                        {!isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 dark:text-gray-400">Correct answer:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {question.answer}
                            </span>
                          </div>
                        )}
                      </div>

                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-semibold">Explanation:</span> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <Button
              onClick={onRetake}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-8 py-3 text-lg shadow-lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Retake Quiz
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


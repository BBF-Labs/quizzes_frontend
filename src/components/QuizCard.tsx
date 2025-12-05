"use client";

import { motion } from "framer-motion";
import {
  Play,
  Edit3,
  Share2,
  Trash2,
  Clock,
  Users,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface QuizCardProps {
  quiz: {
    _id: string;
    title: string;
    description?: string;
    difficulty: "easy" | "medium" | "hard";
    estimatedDuration: number;
    questionCount: number;
    averageScore?: number;
    completionCount?: number;
    lastModified: Date;
    tags: string[];
    isPersonal?: boolean;
  };
  onStart?: (quizId: string) => void;
  onEdit?: (quizId: string) => void;
  onDelete?: (quizId: string) => void;
  onShare?: (quizId: string) => void;
  showActions?: boolean;
}

export function QuizCard({
  quiz,
  onStart,
  onEdit,
  onDelete,
  onShare,
  showActions = true,
}: QuizCardProps) {
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {quiz.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getDifficultyColor(quiz.difficulty)}>
              {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty}
            </Badge>
            {quiz.isPersonal && (
              <Badge variant="outline" className="text-xs">
                Personal
              </Badge>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{quiz.questionCount} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(quiz.estimatedDuration)}</span>
          </div>
          {quiz.completionCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{quiz.completionCount} attempts</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tags */}
        {quiz.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {quiz.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {quiz.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{quiz.tags.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Performance metrics */}
        {quiz.averageScore !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Score
              </span>
              <span
                className={`text-sm font-semibold ${getScoreColor(
                  quiz.averageScore
                )}`}
              >
                {quiz.averageScore}%
              </span>
            </div>
            <Progress value={quiz.averageScore} className="h-2" />
          </div>
        )}

        {/* Last modified */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <Calendar className="w-3 h-3" />
          <span>Modified {formatDate(quiz.lastModified)}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(quiz._id)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              {onShare && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onShare(quiz._id)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(quiz._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
              {onStart && (
                <Button
                  size="sm"
                  onClick={() => onStart(quiz._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Star,
  Share2,
  Trash2,
  CheckCircle,
  XCircle,
  Brain,
  Target,
  Sparkles,
  TrendingUp,
  Hourglass,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { showToast } from "./toaster";
import { formatDistanceToNow } from "date-fns";

interface FlashcardData {
  _id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  masteryLevel: number;
  tags: string[];
  lastReviewed?: Date;
  reviewCount: number;
}

interface FlashcardCardProps {
  flashcard: FlashcardData;
  onUpdate?: (updated: FlashcardData) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
  showActions?: boolean;
}

export function FlashcardCard({
  flashcard,
  onUpdate,
  onDelete,
  onShare,
  showActions = true,
}: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteryLevel, setMasteryLevel] = useState(flashcard.masteryLevel);
  const [isUpdating, setIsUpdating] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (level >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMasteryGradient = (level: number) => {
    if (level >= 80) return "from-emerald-500 to-green-500";
    if (level >= 60) return "from-amber-500 to-yellow-500";
    return "from-red-500 to-pink-500";
  };

  const updateMasteryLevel = async (change: number) => {
    const newLevel = Math.max(0, Math.min(100, masteryLevel + change));
    setIsUpdating(true);

    try {
      setMasteryLevel(newLevel);

      if (onUpdate) {
        await onUpdate({
          ...flashcard,
          masteryLevel: newLevel,
          lastReviewed: new Date(),
          reviewCount: flashcard.reviewCount + 1,
        });

        showToast("Mastery Updated!", "success");
      }
    } catch (error) {
      console.error("Failed to update mastery level:", error);
      setMasteryLevel(flashcard.masteryLevel); // Revert on error

      showToast("Update Failed", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = async () => {
    try {
      if (onShare) {
        await onShare(flashcard._id);
        showToast("Flashcard Shared!", "success");
      }
    } catch (error) {
      console.error("Failed to share flashcard:", error);
      showToast("Share Failed", "error");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this flashcard?")) {
      try {
        if (onDelete) {
          await onDelete(flashcard._id);
          showToast("Flashcard Deleted!", "success");
        }
      } catch (error) {
        console.error("Failed to delete flashcard:", error);
        showToast("Delete Failed", "error");
      }
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
          
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(20, 184, 166, 0.3); }
            50% { box-shadow: 0 0 40px rgba(20, 184, 166, 0.6); }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          .animate-sparkle {
            animation: sparkle 2s ease-in-out infinite;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .flip-card {
            perspective: 1000px;
          }
          
          .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
          }
          
          .flip-card-flipped {
            transform: rotateY(180deg);
          }
          
          .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            transform-style: preserve-3d;
          }
          
          .flip-card-back {
            transform: rotateY(180deg);
          }
          
          .flip-card-front {
            transform: rotateY(0deg);
          }
          
          .flip-card-flipped .flip-card-front {
            visibility: hidden;
          }
          
          .flip-card-flipped .flip-card-back {
            visibility: visible;
          }
          
          .gradient-primary {
            background: linear-gradient(135deg, #14b8a6, #2563eb, #7c3aed);
            background-size: 200% 200%;
            animation: gradient-shift 8s ease infinite;
          }
          
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .gradient-card {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 1px solid #e2e8f0;
          }
          
          .shadow-elevated {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .shadow-glow {
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
          }
          
          .back-gradient {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
          }
          
          .mastery-badge {
            background: linear-gradient(135deg, var(--tw-gradient-stops));
            --tw-gradient-from: #14b8a6;
            --tw-gradient-to: #2563eb;
          }
        `,
        }}
      />

      <div className="flip-card w-full h-[35rem]">
        <div
          className={`flip-card-inner ${isFlipped ? "flip-card-flipped" : ""}`}
        >
          {/* Front Side */}
          <div className="flip-card-front">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full gradient-primary relative overflow-hidden rounded-3xl shadow-elevated hover:shadow-glow transition-all duration-300 cursor-pointer group"
            >
              {/* Difficulty Badge */}
              <div className="absolute top-6 right-6 z-10">
                <Badge
                  className={`${getDifficultyColor(
                    flashcard.difficulty
                  )} border font-medium rounded-full px-3 py-1`}
                >
                  {flashcard.difficulty}
                </Badge>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "24px 24px",
                  }}
                />
              </div>

              {/* Floating Brain Icon Background */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/10">
                <Brain className="w-40 h-40 animate-float" />
              </div>

              {/* Content - Perfectly Centered */}
              <div className="relative z-10 h-full flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <div className="mb-8">
                    <Brain className="w-14 h-14 text-white/90 mx-auto mb-6 drop-shadow-lg" />
                    <h3 className="text-3xl font-bold text-white leading-snug group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
                      {flashcard.front}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-white/80 text-sm font-medium">
                      Click anywhere on the card to reveal answer
                    </p>
                    <p className="text-white/60 text-xs">
                      Use the mastery buttons on the back to track your progress
                    </p>

                    {/* Tags */}
                    {flashcard.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {flashcard.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-white/20 text-white border-white/30 text-xs rounded-full px-3 py-1 backdrop-blur-sm"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {flashcard.tags.length > 3 && (
                          <Badge className="bg-white/20 text-white border-white/30 text-xs rounded-full px-3 py-1 backdrop-blur-sm">
                            +{flashcard.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Clickable overlay for flipping */}
              <div
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={handleFlip}
              />
            </motion.div>
          </div>

          {/* Back Side */}
          <div className="flip-card-back">
            <motion.div
              className="h-full back-gradient border border-gray-200 shadow-elevated relative overflow-hidden rounded-3xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Flip Back Button - Top Left */}
              <div className="absolute top-4 left-4 z-30">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFlip}
                  className="bg-secondary/90 backdrop-blur-sm border-gray-300 hover:bg-white hover:border-gray-400 rounded-full shadow-lg transition-all duration-200 hover:scale-105 text-primary"
                >
                  <Target className="w-4 h-4 mr-2 text-gray-400" />
                  Flip Back
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <Sparkles className="w-8 h-8 text-teal-600 animate-sparkle" />
              </div>

              <div className="absolute bottom-4 left-4 opacity-20">
                <TrendingUp
                  className="w-8 h-8 text-blue-600 animate-sparkle"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>

              <div className="h-full flex flex-col p-6">
                {/* Answer Section - Enhanced with more space */}
                <div className="flex items-center justify-center mb-5">
                  <div className="text-center max-w-md">
                    <div className="relative mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse-glow">
                        <Target className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <Sparkles className="w-3 h-3 text-yellow-800" />
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-gray-800 mb-4">
                      Answer
                    </h4>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg">
                      <p className="text-lg font-medium text-gray-700 leading-relaxed">
                        {flashcard.back}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mastery Level Controls - Enhanced spacing with higher z-index */}
                <div className="mb-5 bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg relative z-30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-700">
                      Mastery Level
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-r ${getMasteryGradient(
                          masteryLevel
                        )}`}
                      ></div>
                      <span
                        className={`text-lg font-bold ${getMasteryColor(
                          masteryLevel
                        )}`}
                      >
                        {masteryLevel}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 text-center">
                    Click the buttons below to adjust your mastery level
                  </p>

                  <div className="mb-4">
                    <Progress
                      value={masteryLevel}
                      className="h-4 rounded-full bg-gray-200"
                      style={
                        {
                          "--progress-color":
                            masteryLevel >= 80
                              ? "rgb(16 185 129)"
                              : masteryLevel >= 60
                              ? "rgb(245 158 11)"
                              : "rgb(239 68 68)",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMasteryLevel(-10)}
                      disabled={isUpdating}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isUpdating ? "Updating..." : "Harder"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMasteryLevel(10)}
                      disabled={isUpdating}
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isUpdating ? "Updating..." : "Easier"}
                    </Button>
                  </div>
                  {isUpdating && (
                    <p className="text-xs text-blue-600 text-center mt-2">
                      <Hourglass className="w-4 h-4 mr-2" />
                      Updating mastery level...
                    </p>
                  )}
                </div>

                {/* Stats - Enhanced with more space */}
                <div className="mb-5 bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center justify-center gap-8 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-medium">
                          Last Reviewed
                        </p>
                        <span className="font-semibold text-sm">
                          {flashcard.lastReviewed
                            ? formatDistanceToNow(
                                new Date(flashcard.lastReviewed)
                              )
                            : "Never"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-medium">
                          Reviews
                        </p>
                        <span className="font-semibold text-sm">
                          {flashcard.reviewCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions - Centered without flip back button with higher z-index */}
                <div className="flex items-center justify-center mt-auto relative z-30">
                  {showActions && (
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShare()}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-200 transition-all duration-200 hover:scale-105 hover:shadow-md px-4 py-2"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete()}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full bg-white/80 backdrop-blur-sm border border-red-200 transition-all duration-200 hover:scale-105 hover:shadow-md px-4 py-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Clickable overlay for flipping - positioned behind interactive elements and excluding mastery controls area */}
              <div
                className="absolute inset-0 cursor-pointer"
                style={{
                  clipPath:
                    "polygon(0% 0%, 100% 0%, 100% 60%, 0% 60%), polygon(0% 85%, 100% 85%, 100% 100%, 0% 100%)",
                }}
                onClick={handleFlip}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

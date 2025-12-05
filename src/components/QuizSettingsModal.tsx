"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Clock,
  Target,
  BookOpen,
  Eye,
  Zap,
  Settings,
  Info,
  AlertTriangle,
} from "lucide-react";
import { FullQuiz } from "@/interfaces/IQuizState";
import { showToast } from "./toaster";

interface QuizSettings {
  lectures: string[];
  showHints: boolean;
  feedbackType: "after" | "during";
  timer: number;
  timerEnabled: boolean;
  isLinear: boolean;
  autoNext: boolean;
  randomizeQuestions: boolean;
  lectureRange: { start: number; end: number };
}

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: QuizSettings;
  onSave: (settings: QuizSettings) => void;
  availableLectures: string[];
  quizData?: FullQuiz | null;
}

export function QuizSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  availableLectures,
  quizData,
}: QuizSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<QuizSettings>(settings);

  // Auto-update end range when start range changes to prevent invalid ranges
  const handleStartLectureChange = (value: string) => {
    const startIndex = parseInt(value);
    setLocalSettings((prev) => {
      const newEndIndex = Math.max(startIndex, prev.lectureRange.end);
      return {
        ...prev,
        lectureRange: {
          start: startIndex,
          end: newEndIndex,
        },
      };
    });
  };

  // Initialize end range to last lecture if not set
  useEffect(() => {
    if (availableLectures && availableLectures.length > 0) {
      const lastLectureIndex = availableLectures.length - 1;
      // Only auto-adjust if the current range is invalid
      if (
        localSettings.lectureRange.start > localSettings.lectureRange.end ||
        localSettings.lectureRange.end >= availableLectures.length
      ) {
        setLocalSettings((prev) => ({
          ...prev,
          lectureRange: {
            start: Math.min(prev.lectureRange.start, lastLectureIndex),
            end: lastLectureIndex,
          },
        }));
      }
    }
  }, [availableLectures]);

  const handleSave = () => {
    // Validate lecture range before saving
    if (availableLectures && availableLectures.length > 0) {
      const { start, end } = localSettings.lectureRange;
      if (start > end || start < 0 || end >= availableLectures.length) {
        // Don't save invalid ranges
        showToast("Invalid lecture range", "error");
        return;
      }
    }

    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  // Check if lecture range is valid
  const isLectureRangeValid =
    availableLectures && availableLectures.length > 0
      ? localSettings.lectureRange.start <= localSettings.lectureRange.end &&
        localSettings.lectureRange.start >= 0 &&
        localSettings.lectureRange.end < availableLectures.length
      : true;

  // Check if end range was auto-adjusted
  const wasEndRangeAdjusted =
    availableLectures &&
    availableLectures.length > 0 &&
    localSettings.lectureRange.end === availableLectures.length - 1 &&
    localSettings.lectureRange.start < localSettings.lectureRange.end;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="w-full max-w-4xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-2xl bg-card border-border rounded-2xl">
          <CardHeader className="bg-teal-500 text-white rounded-t-2xl">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Settings className="h-5 w-5" />
              Quiz Settings
            </CardTitle>
            <p className="text-white/80 text-sm">
              Customize your quiz experience
            </p>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Timer Settings and Quiz Behavior in Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timer Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-teal-500" />
                  <h3 className="text-base font-semibold text-foreground">
                    Timer Settings
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="timer-enabled"
                      checked={localSettings.timerEnabled}
                      onCheckedChange={(checked) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          timerEnabled: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="timer-enabled"
                      className="text-foreground text-sm"
                    >
                      Enable Timer
                    </Label>
                  </div>
                  {localSettings.timerEnabled && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="timer-value"
                        className="text-foreground text-sm"
                      >
                        Timer Duration (minutes)
                      </Label>
                      <Input
                        id="timer-value"
                        type="number"
                        min="1"
                        max="120"
                        value={localSettings.timer / 60}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            timer: parseInt(e.target.value) * 60,
                          }))
                        }
                        className="w-full bg-background border-border text-foreground h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz Behavior */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-blue-500" />
                  <h3 className="text-base font-semibold text-foreground">
                    Quiz Behavior
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="linear-mode"
                      checked={localSettings.isLinear}
                      onCheckedChange={(checked) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          isLinear: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="linear-mode"
                      className="text-foreground text-sm"
                    >
                      Linear Mode
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="auto-next"
                      checked={localSettings.autoNext}
                      onCheckedChange={(checked) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          autoNext: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="auto-next"
                      className="text-foreground text-sm"
                    >
                      Auto Next
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="randomize"
                      checked={localSettings.randomizeQuestions}
                      onCheckedChange={(checked) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          randomizeQuestions: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="randomize"
                      className="text-foreground text-sm"
                    >
                      Randomize Questions
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback & Hints */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-teal-500" />
                <h3 className="text-base font-semibold text-foreground">
                  Feedback & Hints
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="show-hints"
                    checked={localSettings.showHints}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        showHints: checked,
                      }))
                    }
                  />
                  <Label
                    htmlFor="show-hints"
                    className="text-foreground text-sm"
                  >
                    Show Hints
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="feedback-type"
                    className="text-foreground text-sm"
                  >
                    Feedback Type
                  </Label>
                  <Select
                    value={localSettings.feedbackType}
                    onValueChange={(value: "after" | "during") =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        feedbackType: value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="after" className="text-foreground">
                        After Each Question
                      </SelectItem>
                      <SelectItem value="during" className="text-foreground">
                        Immediate Feedback
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Lecture Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <h3 className="text-base font-semibold text-foreground">
                  Lecture Range
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Select the range of lectures to include in your quiz. The end
                lecture will only be automatically adjusted if you select an
                invalid range (e.g., start &gt; end).
              </p>
              {availableLectures && availableLectures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="start-lecture"
                      className="text-foreground text-sm"
                    >
                      Start Lecture
                    </Label>
                    <Select
                      value={localSettings.lectureRange.start.toString()}
                      onValueChange={handleStartLectureChange}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground h-8 text-sm">
                        <SelectValue placeholder="Select start lecture" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        {availableLectures.map((lecture, index) => (
                          <SelectItem
                            key={index}
                            value={index.toString()}
                            className="text-foreground"
                          >
                            {lecture}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="end-lecture"
                      className="text-foreground text-sm"
                    >
                      End Lecture
                    </Label>
                    <Select
                      value={localSettings.lectureRange.end.toString()}
                      onValueChange={(value) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          lectureRange: {
                            ...prev.lectureRange,
                            end: parseInt(value),
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background border-border text-foreground h-8 text-sm">
                        <SelectValue placeholder="Select end lecture" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        {availableLectures.map((lecture, index) => (
                          <SelectItem
                            key={index}
                            value={index.toString()}
                            className="text-foreground"
                            disabled={index < localSettings.lectureRange.start}
                          >
                            {lecture}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    No lecture information available. Using question numbers
                    instead.
                  </p>
                </div>
              )}
              <p
                className={`text-xs ${
                  isLectureRangeValid ? "text-muted-foreground" : "text-red-500"
                }`}
              >
                Total questions in range:{" "}
                {quizData &&
                quizData.quizQuestions &&
                availableLectures &&
                availableLectures.length > 0
                  ? (() => {
                      const startIndex = localSettings.lectureRange.start;
                      const endIndex = localSettings.lectureRange.end;
                      if (
                        startIndex <= endIndex &&
                        startIndex < availableLectures.length &&
                        endIndex < availableLectures.length
                      ) {
                        const selectedLectures = availableLectures.slice(
                          startIndex,
                          endIndex + 1
                        );
                        const totalQuestions =
                          quizData.quizQuestions
                            ?.filter(
                              (lecture: any, index: number) =>
                                index >= startIndex && index <= endIndex
                            )
                            .reduce(
                              (sum: number, lecture: any) =>
                                sum + lecture.questions.length,
                              0
                            ) || 0;
                        return `${selectedLectures.join(
                          ", "
                        )} (${totalQuestions} questions)`;
                      }
                      return "Invalid range";
                    })()
                  : availableLectures && availableLectures.length > 0
                  ? (() => {
                      const startIndex = localSettings.lectureRange.start;
                      const endIndex = localSettings.lectureRange.end;
                      if (
                        startIndex <= endIndex &&
                        startIndex < availableLectures.length &&
                        endIndex < availableLectures.length
                      ) {
                        const selectedLectures = availableLectures.slice(
                          startIndex,
                          endIndex + 1
                        );
                        return `${selectedLectures.join(", ")} (${
                          endIndex - startIndex + 1
                        } lectures)`;
                      }
                      return "Invalid range";
                    })()
                  : "No lectures available"}
              </p>
              {!isLectureRangeValid && (
                <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Invalid lecture range. Please select a valid start and end
                  lecture.
                </p>
              )}
              {wasEndRangeAdjusted && (
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <Info className="w-4 h-4 mr-2 text-blue-500" />
                  End lecture automatically adjusted to include all available
                  lectures in the range.
                </p>
              )}
            </div>
          </CardContent>

          {/* Action Buttons */}
          <div className="p-4 pt-0 flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-border hover:bg-accent text-sm px-3 py-1.5"
            >
              Reset to Defaults
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-accent text-sm px-3 py-1.5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isLectureRangeValid}
              className={`text-sm px-3 py-1.5 ${
                isLectureRangeValid
                  ? "bg-teal-500 hover:bg-teal-600 text-white"
                  : "bg-gray-400 cursor-not-allowed text-gray-200"
              }`}
            >
              <Zap className="h-3 w-3 mr-2" />
              Apply Settings
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

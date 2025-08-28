"use client";

import { useState } from "react";
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
import { Clock, Target, BookOpen, Eye, Zap, Settings } from "lucide-react";
import { FullQuiz } from "@/interfaces/IQuizState";

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

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

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
          <CardHeader className="bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-t-2xl">
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
                      onValueChange={(value) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          lectureRange: {
                            ...prev.lectureRange,
                            start: parseInt(value),
                          },
                        }))
                      }
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
              <p className="text-xs text-muted-foreground">
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
                      return `${startIndex + 1} to ${
                        endIndex + 1
                      } (0 questions)`;
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
                      return `${startIndex + 1} to ${endIndex + 1} (${
                        endIndex - startIndex + 1
                      } lectures)`;
                    })()
                  : `${
                      localSettings.lectureRange.end -
                      localSettings.lectureRange.start +
                      1
                    } questions`}
              </p>
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
              className="bg-gradient-to-br from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white text-sm px-3 py-1.5"
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

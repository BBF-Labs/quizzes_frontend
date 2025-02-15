"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Slider,
  Switch,
} from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RootState } from "@/lib";
import { useSelector } from "react-redux";

interface QuizSettings {
  lectures: string[];
  showHints: boolean;
  feedbackType: "during" | "after";
  timer: number;
  timerEnabled: boolean;
  autoNext: boolean;
  isLinear: boolean;
  randomizeQuestions: boolean;
  lectureRange: { start: number; end: number };
}

interface LectureRange {
  name: string;
  start: number;
  end: number;
}

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: QuizSettings) => void;
  initialSettings: QuizSettings;
  lectureRanges: LectureRange[];
}

export function QuizSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
  lectureRanges,
}: QuizSettingsModalProps) {
  const { quizStateSettings } = useSelector((state: RootState) => state.quiz);

  const [settings, setSettings] = useState<QuizSettings>(
    initialSettings ||
      quizStateSettings || {
        lectures: [],
        showHints: true,
        feedbackType: "after",
        timer: 600,
        timerEnabled: true,
        autoNext: false,
        isLinear: false,
        randomizeQuestions: false,
        lectureRange: { start: 0, end: 0 },
      }
  );

  const [useRangeSelector, setUseRangeSelector] = useState(true);
  const [lectureRange, setLectureRange] = useState(settings.lectureRange);

  const handleSave = () => {
    onSave({ ...settings, lectureRange });
    onClose();
  };

  const handleTimeInput = (hours: number, minutes: number) => {
    setSettings((prev) => ({ ...prev, timer: hours * 3600 + minutes * 60 }));
  };

  // const toggleLecture = (lecture: string) => {
  //   setSettings((prev) => ({
  //     ...prev,
  //     lectures: prev.lectures.includes(lecture)
  //       ? prev.lectures.filter((l) => l !== lecture)
  //       : [...prev.lectures, lecture],
  //   }));
  // };

  useEffect(() => {
    setLectureRange(initialSettings.lectureRange);
  }, [initialSettings]);

  const LectureRangeSelector = () => {
    return (
      <div className="space-y-2">
        <Label>Select Lecture Range</Label>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select
            value={lectureRange.start.toString()}
            onValueChange={(value) =>
              setLectureRange((prev) => ({
                ...prev,
                start: Number.parseInt(value),
                end: Math.max(prev.end, Number.parseInt(value)),
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Start Lecture" />
            </SelectTrigger>
            <SelectContent>
              {lectureRanges.map((lecture, index) => (
                <SelectItem key={index} value={lecture.start.toString()}>
                  {lecture.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="self-center hidden sm:inline">to</span>
          <Select
            value={lectureRange.end.toString()}
            onValueChange={(value) =>
              setLectureRange((prev) => ({
                ...prev,
                end: Number.parseInt(value),
                start: Math.min(prev.start, Number.parseInt(value)),
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="End Lecture" />
            </SelectTrigger>
            <SelectContent>
              {lectureRanges.map((lecture, index) => (
                <SelectItem key={index} value={lecture.end.toString()}>
                  {lecture.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[425px] w-full sm:max-w-[70vw] max-h-[90vh] rounded-xl">
        <DialogHeader>
          <DialogTitle>Quiz Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 px-2 sm:px-4">
          <LectureRangeSelector />

          <div className="flex items-center justify-between">
            <Label htmlFor="showHints">Show Hints</Label>
            <Switch
              id="showHints"
              checked={settings.showHints}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, showHints: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <RadioGroup
              value={settings.feedbackType}
              onValueChange={(value: "during" | "after") => {
                setSettings((prev) => ({ ...prev, feedbackType: value }));
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="during" id="during" />
                <Label htmlFor="during">During Quiz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after">After Quiz</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              id="timerEnabled"
              checked={settings.timerEnabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  timerEnabled: checked === true,
                }))
              }
            />
            <Label htmlFor="timerEnabled">Enable Timer</Label>
          </div>

          {settings.timerEnabled && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useRangeSelector"
                  checked={useRangeSelector}
                  onCheckedChange={(checked) =>
                    setUseRangeSelector(checked === true)
                  }
                />
                <Label htmlFor="useRangeSelector">Use Range Selector</Label>
              </div>
              {useRangeSelector ? (
                <div className="space-y-2">
                  <Label>Timer (minutes)</Label>
                  <Slider
                    min={1}
                    max={180}
                    step={1}
                    value={[settings.timer / 60]}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, timer: value[0] * 60 }))
                    }
                  />
                  <div className="text-center">
                    {settings.timer / 60} minutes
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      className="w-20"
                      value={Math.floor(settings.timer / 3600)}
                      onChange={(e) =>
                        handleTimeInput(
                          Number(e.target.value),
                          (settings.timer % 3600) / 60
                        )
                      }
                    />
                    <span>hours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Minutes"
                      className="w-20"
                      value={(settings.timer % 3600) / 60}
                      onChange={(e) =>
                        handleTimeInput(
                          Math.floor(settings.timer / 3600),
                          Number(e.target.value)
                        )
                      }
                    />
                    <span>minutes</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="autoNext">Auto Next Question</Label>
            <Switch
              id="autoNext"
              checked={settings.autoNext}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, autoNext: checked === true }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isLinear">Linear Quiz</Label>
            <Switch
              id="isLinear"
              checked={settings.isLinear}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, isLinear: checked === true }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
            <Switch
              id="randomizeQuestions"
              checked={settings.randomizeQuestions}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  randomizeQuestions: checked === true,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

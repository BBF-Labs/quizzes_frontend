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
import { RootState } from "@/lib";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";

interface QuizSettings {
  lectures: string[];
  showHints: boolean;
  feedbackType: "during" | "after";
  timer: number;
  timerEnabled: boolean;
  autoNext: boolean;
  isLinear: boolean;
  randomizeQuestions: boolean; // Added randomization option
}

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: QuizSettings) => void;
  initialSettings: QuizSettings;
}

export function QuizSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}: QuizSettingsModalProps) {
  const { quizStateSettings } = useSelector((state: RootState) => state.quiz);

  // Initialize settings with initialSettings or fallback to quizStateSettings
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
      }
  );

  const [useRangeSelector, setUseRangeSelector] = useState(true);
  const [lectureOptions, setLectureOptions] = useState<string[]>([]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleTimeInput = (hours: number, minutes: number) => {
    setSettings((prev) => ({ ...prev, timer: hours * 3600 + minutes * 60 }));
  };

  const toggleLecture = (lecture: string) => {
    setSettings((prev) => ({
      ...prev,
      lectures: prev.lectures.includes(lecture)
        ? prev.lectures.filter((l) => l !== lecture)
        : [...prev.lectures, lecture],
    }));
  };

  useEffect(() => {
    // Assuming quizStateSettings has a property that contains lecture names
    if (quizStateSettings && quizStateSettings.lectures) {
      setLectureOptions(quizStateSettings.lectures);
    }
  }, [quizStateSettings]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quiz Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Select Lectures</Label>
            <div className="grid grid-cols-3 gap-2">
              {lectureOptions.map((lecture) => (
                <div
                  key={lecture}
                  className={cn(
                    "flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors",
                    settings.lectures.includes(lecture)
                      ? "button-gradient"
                      : "bg-secondary hover:button-gradient hover:opacity-30"
                  )}
                  onClick={() => toggleLecture(lecture)}
                >
                  {lecture}
                </div>
              ))}
            </div>
          </div>

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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="timerEnabled"
              checked={settings.timerEnabled}
              onCheckedChange={
                (checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    timerEnabled: checked as boolean,
                  })) // Ensure checked is boolean
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
                    setUseRangeSelector(checked as boolean)
                  } // Ensure checked is boolean
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
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="autoNext">Auto Next Question</Label>
            <Switch
              id="autoNext"
              checked={settings.autoNext}
              onCheckedChange={
                (checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    autoNext: checked as boolean,
                  })) // Ensure checked is boolean
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isLinear">Linear Quiz</Label>
            <Switch
              id="isLinear"
              checked={settings.isLinear}
              onCheckedChange={
                (checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    isLinear: checked as boolean,
                  })) // Ensure checked is boolean
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
                  randomizeQuestions: checked as boolean, // Ensure checked is boolean
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

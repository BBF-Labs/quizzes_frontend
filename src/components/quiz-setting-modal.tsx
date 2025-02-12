"use client";

import { useState } from "react";
import {
  Select,
  Input,
  Button,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Slider,
  Dialog,
  RadioGroup,
  RadioGroupItem,
  Switch,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Checkbox,
} from "@/components";
import {} from "@/components/ui/checkbox";
import type { QuizSettings } from "@/types/quiz";

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: QuizSettings) => void;
}

export function QuizSettingsModal({
  isOpen,
  onClose,
  onSave,
}: QuizSettingsModalProps) {
  const [settings, setSettings] = useState<QuizSettings>({
    lectureNumber: "Lecture 1",
    showHints: true,
    feedbackType: "after",
    timer: 600, // 10 minutes in seconds
    timerEnabled: true,
    autoNext: false,
    isLinear: false, // New setting for linear quiz
  });
  const [useRangeSelector, setUseRangeSelector] = useState(true);

  const lectureOptions = [
    "Lecture 1",
    "Lecture 2",
    "Lecture 3",
    "Lecture 4",
    "Lecture 5",
    "IA",
    "QUIZ",
  ];

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleTimeInput = (hours: number, minutes: number) => {
    setSettings({ ...settings, timer: hours * 3600 + minutes * 60 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-2  border-teal-500">
        <DialogHeader>
          <DialogTitle>Quiz Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lectureSelect" className="text-right">
              Lecture
            </Label>
            <Select
              value={settings.lectureNumber}
              onValueChange={(value) =>
                setSettings({ ...settings, lectureNumber: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Lecture" />
              </SelectTrigger>
              <SelectContent>
                {lectureOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showHints">Show Hints</Label>
            <Switch
              id="showHints"
              checked={settings.showHints}
              className={`${settings.showHints ? "button-gradient" : ""}`}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showHints: checked })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <RadioGroup
              value={settings.feedbackType}
              onValueChange={(value: "during" | "after") => {
                setSettings({ ...settings, feedbackType: value });
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
              className={`${settings.timerEnabled ? "button-gradient" : ""}`}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, timerEnabled: checked as boolean })
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
                  className={`${useRangeSelector ? "button-gradient" : ""}`}
                  onCheckedChange={(checked) =>
                    setUseRangeSelector(checked as boolean)
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
                      setSettings({ ...settings, timer: value[0] * 60 })
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
              className={`${settings.autoNext ? "button-gradient" : ""}`}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoNext: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isLinear">Linear Quiz</Label>
            <Switch
              id="isLinear"
              className={`${settings.isLinear ? "button-gradient" : ""}`}
              checked={settings.isLinear}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, isLinear: checked })
              }
            />
          </div>
        </div>
        <Button variant="gradient" onClick={handleSave}>
          Save Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
}

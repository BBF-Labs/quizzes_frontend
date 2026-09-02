"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, PlayCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MaterialPickerDialog } from "@/components/common/MaterialPickerDialog";
import { useLibraryMaterials } from "@/hooks/app/use-app-library";
import { toast } from "sonner";

interface GenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onGenerate: (
    materialId: string,
    settings?: Record<string, unknown>,
  ) => Promise<void>;
  type: "flashcards" | "quiz" | "mindmap" | "notes";
}

export function GenerationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onGenerate,
  type,
}: GenerationDialogProps) {
  const { data: materials = [] } = useLibraryMaterials();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Quiz settings
  const [timeLimit, setTimeLimit] = useState(20);
  const [questionCount, setQuestionCount] = useState(15);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const handleSelect = (materialId: string) => {
    setSelectedMaterialId(materialId);
  };

  const handleGenerate = async () => {
    if (!selectedMaterialId) return;
    setIsGenerating(true);
    try {
      const settings =
        type === "quiz"
          ? { timeLimit, questionCount, shuffleQuestions, showExplanations, showHints: true }
          : undefined;
      await onGenerate(selectedMaterialId, settings);
      toast.success("Generation started!");
      onOpenChange(false);
      setSelectedMaterialId(null);
    } catch (err: any) {
      if (err?.response?.status === 402) {
        const label =
          type === "quiz" ? "quiz" : type === "flashcards" ? "flashcard" : "mind map";
        toast.error(`Daily ${label} limit reached. Upgrade your plan or use credits.`);
      } else {
        toast.error("Failed to start generation. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg border-border/40 bg-card/95 backdrop-blur-md p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 pb-4 border-b border-border/10">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <PlayCircle className="size-5 text-primary" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col">
            {/* Material selector row */}
            <div className="p-4 border-b border-border/10 bg-muted/20">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
                Source material
              </p>
              {selectedMaterial ? (
                <div className="flex items-center justify-between rounded-sm border border-border/20 bg-background/40 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-primary truncate">{selectedMaterial.title}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/50 uppercase mt-0.5">
                      {selectedMaterial.mimeType?.split("/").pop()} ·{" "}
                      {(selectedMaterial.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPickerOpen(true)}
                    className="ml-3 shrink-0 text-[10px] font-mono uppercase text-primary/60 hover:text-primary transition"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-sm border border-dashed border-border/30 bg-background/20 py-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/50 hover:border-primary/30 hover:text-primary/60 transition"
                >
                  <Plus className="size-3" />
                  Select material
                </button>
              )}
            </div>

            {/* Quiz settings panel */}
            {type === "quiz" && selectedMaterialId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="p-4 border-b border-border/10 bg-muted/10 space-y-4"
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70 font-black">
                  Quiz Generation Settings
                </p>

                <div className="space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-mono uppercase text-muted-foreground/80">
                        Time Limit
                      </Label>
                      <span className="text-[10px] font-mono text-primary font-bold bg-primary/5 px-1">
                        {timeLimit} min
                      </span>
                    </div>
                    <Slider
                      value={[timeLimit]}
                      onValueChange={([v]) => setTimeLimit(v)}
                      min={5}
                      max={60}
                      step={5}
                      className="py-1"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-mono uppercase text-muted-foreground/80">
                        Questions
                      </Label>
                      <span className="text-[10px] font-mono text-primary font-bold bg-primary/5 px-1">
                        {questionCount}
                      </span>
                    </div>
                    <Slider
                      value={[questionCount]}
                      onValueChange={([v]) => setQuestionCount(v)}
                      min={5}
                      max={50}
                      step={1}
                      className="py-1"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="shuffle"
                        checked={shuffleQuestions}
                        onCheckedChange={setShuffleQuestions}
                        className="scale-75 origin-left"
                      />
                      <Label htmlFor="shuffle" className="text-[9px] font-mono uppercase text-muted-foreground/60 cursor-pointer">
                        Shuffle
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="explanations"
                        checked={showExplanations}
                        onCheckedChange={setShowExplanations}
                        className="scale-75 origin-left"
                      />
                      <Label htmlFor="explanations" className="text-[9px] font-mono uppercase text-muted-foreground/60 cursor-pointer">
                        Explanations
                      </Label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border/10 bg-muted/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-[10px] font-mono uppercase"
            >
              Cancel
            </Button>
            <Button
              disabled={!selectedMaterialId || isGenerating}
              onClick={handleGenerate}
              size="sm"
              className="text-[10px] font-mono uppercase tracking-widest bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <Loader2 className="size-3 animate-spin mr-2" />
              ) : (
                <Plus className="size-3 mr-2" />
              )}
              {isGenerating ? "Generating..." : `Generate ${type}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shared picker — opened from inside the dialog */}
      <MaterialPickerDialog
        isOpen={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleSelect}
        allowUpload
        title="Select Source Material"
        description="Pick from your library or upload a new file."
        confirmLabel="Use this material"
      />
    </>
  );
}

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  useLibraryMaterials, 
  useCreateLibraryMaterial, 
} from "@/hooks/app/use-app-library";
import { useUploadFile } from "@/hooks/common/use-upload";
import { 
  Search, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Plus,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface GenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onGenerate: (materialId: string, settings?: Record<string, unknown>) => Promise<void>;
  type: "flashcards" | "quiz" | "mindmap" | "notes";
}

export function GenerationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onGenerate,
  type
}: GenerationDialogProps) {
  const { data: materials = [], isLoading: isLoadingMaterials } = useLibraryMaterials();
  const uploadMutation = useUploadFile();
  const createMaterial = useCreateLibraryMaterial();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Settings state
  const [timeLimit, setTimeLimit] = useState(20);
  const [questionCount, setQuestionCount] = useState(15);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMaterials = (materials || []).filter((m) =>
    (m.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const uploadRes = await uploadMutation.mutateAsync({ file });
      const material = await createMaterial.mutateAsync({
        uploadId: uploadRes._id, // FIXED: use _id
        title: file.name,
      });
      setSelectedMaterialId(material.id);
      toast.success("Material uploaded and selected!", { id: toastId });
    } catch (err: any) {
      if (err?.response?.status === 402) {
        toast.error("Daily upload limit reached. Upgrade your plan to upload more materials.", { id: toastId });
      } else {
        toast.error("Upload failed. Please try again.", { id: toastId });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!selectedMaterialId) return;
    
    setIsGenerating(true);
    try {
      const settings = type === "quiz" ? {
        timeLimit,
        questionCount,
        shuffleQuestions,
        showExplanations,
        showHints: true,
      } : undefined;

      await onGenerate(selectedMaterialId, settings);
      toast.success("Generation started!");
      onOpenChange(false);
      // Reset state for next time
      setSelectedMaterialId(null);
      setSearchQuery("");
    } catch (err: any) {
      if (err?.response?.status === 402) {
        const featureLabel = type === "quiz" ? "quiz" : type === "flashcards" ? "flashcard" : "mind map";
        toast.error(`Daily ${featureLabel} limit reached. Upgrade your plan or use credits.`);
      } else {
        toast.error("Failed to start generation. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border/40 bg-card/95 backdrop-blur-md p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/10">
          <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <PlayCircle className="size-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[400px]">
          {/* Action Bar */}
          <div className="p-4 border-b border-border/10 bg-muted/20 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/50 border border-border/20 pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary/30 transition-all rounded-sm"
              />
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 text-[10px] font-mono uppercase tracking-wider rounded-sm shrink-0"
            >
              {isUploading ? (
                <Loader2 className="size-3 animate-spin mr-2" />
              ) : (
                <Upload className="size-3 mr-2" />
              )}
              Upload
            </Button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoadingMaterials ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Loader2 className="size-6 animate-spin mb-2" />
                <p className="text-[10px] font-mono uppercase tracking-widest">Loading Library...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                <FileText className="size-10 mb-2 stroke-1" />
                <p className="text-xs font-mono">No materials found.</p>
                <p className="text-[9px] font-mono uppercase mt-1">Upload one to get started.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredMaterials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterialId(material.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 text-left border transition-all rounded-sm",
                      selectedMaterialId === material.id
                        ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                        : "bg-background/20 border-border/20 hover:border-primary/20 hover:bg-background/40"
                    )}
                  >
                    <div className={cn(
                      "size-8 flex items-center justify-center rounded-sm shrink-0 border",
                      selectedMaterialId === material.id ? "bg-primary/20 border-primary/20" : "bg-muted/30 border-border/20"
                    )}>
                      <FileText className={cn("size-4", selectedMaterialId === material.id ? "text-primary" : "text-muted-foreground/60")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-bold truncate",
                        selectedMaterialId === material.id ? "text-primary" : "text-foreground"
                      )}>
                        {material.title}
                      </p>
                      <p className="text-[9px] font-mono text-muted-foreground/50 uppercase truncate mt-0.5">
                        {material.mimeType} • {(material.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {selectedMaterialId === material.id && (
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings (Optional for Quiz) */}
          {type === "quiz" && selectedMaterialId && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="p-4 border-t border-border/10 bg-muted/10 space-y-4"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70 font-black">
                Quiz Generation Settings
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-mono uppercase text-muted-foreground/80">Time Limit</Label>
                    <span className="text-[10px] font-mono text-primary font-bold bg-primary/5 px-1">{timeLimit} min</span>
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
                    <Label className="text-[10px] font-mono uppercase text-muted-foreground/80">Questions</Label>
                    <span className="text-[10px] font-mono text-primary font-bold bg-primary/5 px-1">{questionCount}</span>
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
                    <Label htmlFor="shuffle" className="text-[9px] font-mono uppercase text-muted-foreground/60 cursor-pointer">Shuffle</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="explanations" 
                      checked={showExplanations} 
                      onCheckedChange={setShowExplanations} 
                      className="scale-75 origin-left"
                    />
                    <Label htmlFor="explanations" className="text-[9px] font-mono uppercase text-muted-foreground/60 cursor-pointer">Explanations</Label>
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
  );
}

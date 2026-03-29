"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLibraryMaterials } from "@/hooks/app/use-app-library";
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Library,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddAppMaterial } from "@/hooks/app/use-app-actions";

interface MaterialSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  alreadyAddedIds?: string[];
}

export function MaterialSelectorDialog({
  isOpen,
  onOpenChange,
  sessionId,
  alreadyAddedIds = []
}: MaterialSelectorDialogProps) {
  const { data: materials = [], isLoading } = useLibraryMaterials();
  const { mutate: addMaterial, isPending } = useAddAppMaterial(sessionId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = materials.filter((m) => {
    const matchesSearch = (m.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const notAdded = !alreadyAddedIds.includes(m.id);
    return matchesSearch && notAdded;
  });

  const handleConfirm = () => {
    if (!selectedId) return;
    addMaterial(selectedId, {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedId(null);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 border-border/40 bg-card/95 backdrop-blur-md p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/10">
          <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
            <Library className="size-5 text-primary" />
            Add from Library
          </DialogTitle>
          <DialogDescription className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">
            Select a material from your library to add to this session
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-100">
          {/* Search Bar */}
          <div className="p-4 border-b border-border/10 bg-muted/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40" />
              <input
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/50 border border-border/20 pl-9 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary/30 transition-all rounded-sm"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Loader2 className="size-6 animate-spin mb-2" />
                <p className="text-[10px] font-mono uppercase tracking-widest">Scanning Library...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                <FileText className="size-10 mb-2 stroke-1" />
                <p className="text-xs font-mono">No available materials found.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 text-left border transition-all rounded-sm",
                      selectedId === m.id
                        ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                        : "bg-background/20 border-border/20 hover:border-primary/20 hover:bg-background/40"
                    )}
                  >
                    <div className={cn(
                      "size-8 flex items-center justify-center rounded-sm shrink-0 border",
                      selectedId === m.id ? "bg-primary/20 border-primary/20" : "bg-muted/30 border-border/20"
                    )}>
                      <FileText className={cn("size-4", selectedId === m.id ? "text-primary" : "text-muted-foreground/60")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-bold truncate",
                        selectedId === m.id ? "text-primary" : "text-foreground"
                      )}>
                        {m.title}
                      </p>
                      <p className="text-[9px] font-mono text-muted-foreground/50 uppercase truncate mt-0.5">
                        {m.mimeType} • {(m.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {selectedId === m.id && (
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
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
            disabled={!selectedId || isPending}
            onClick={handleConfirm}
            size="sm"
            className="text-[10px] font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 min-w-25"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin mr-2" />
            ) : (
              <Plus className="size-3 mr-2" />
            )}
            {isPending ? "Adding..." : "Add to Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
